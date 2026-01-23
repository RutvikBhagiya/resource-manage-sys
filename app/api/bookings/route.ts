import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validate } from "@/lib/utils/validate"
import { bookingCreateSchema } from "@/lib/validators/booking.schema"
import { BookingStatus } from "@/generated/prisma/enums"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return new Response("Unauthorized", { status: 401 })

        const json = await req.json()
        const result = validate(bookingCreateSchema, json)
        if (!result.success) return result.response

        const data = result.data

        // Convert to Date Object
        const startDateTime = new Date(data.startDateTime);
        const endDateTime = new Date(data.endDateTime);

        if (startDateTime >= endDateTime) {
             return new Response("End time must be after start time", { status: 400 })
        }

        const resource = await prisma.resource.findUnique({
            where: { resourceId: data.resourceId },
            select: {
                requiresApproval: true,
                organizationId: true,
                isActive: true,
                name: true 
            }
        });

        if (!resource || !resource.isActive) {
        return new Response("Resource not found or inactive", { status: 404 });
        }

        //Ensure User is from Resource's Organization 
        if (resource.organizationId !== session.user.organizationId) {
             return new Response("You cannot book resources from another organization", { status: 403 });
        }

        const conflict = await prisma.booking.findFirst({
            where: {
                resourceId: data.resourceId,
                status: {
                    notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED] // Ignore cancelled/rejected bookings
                },
                AND: [
                    { startDateTime: { lt: endDateTime } },
                    { endDateTime: { gt: startDateTime } }
                ]
            }
        });

        if (conflict) {
            return new Response("Resource is already booked for this time slot", { status: 409 });
        }

        const initialStatus = resource.requiresApproval ? BookingStatus.PENDING : BookingStatus.APPROVED;

        const booking = await prisma.booking.create({
            data: {
                organizationId: session.user.organizationId,
                resourceId: data.resourceId,
                userId: Number(session.user.id),
                title: data.title,
                purpose: data.purpose,
                startDateTime: startDateTime,
                endDateTime: endDateTime,
                attendeesCount: data.attendeesCount,
                priority: data.priority,
                status: initialStatus
            }
        })

        return Response.json(booking, { status: 201 })
    } 
    catch (error) {
        console.error("Create booking error:", error)
        return new Response("Failed to create booking", { status: 500 })
    }
}

export async function GET() {
    try{
        const session = await getServerSession(authOptions)
        if (!session) return new Response("Unauthorized", { status: 401 })

        const bookings = await prisma.booking.findMany({
            where: { userId: Number(session.user.id) },
            include: { Resource: {
                            select: {
                                name: true,
                                roomNumber: true
                            }
                        } 
                    },
            orderBy: { createdAt: "desc" },
        })

        return Response.json(bookings)
    }
    catch(error){
        console.error("Error retrieving bookings:", error);
        return Response.json("Failed to retrieve bookings",{status: 500})
    }
}
