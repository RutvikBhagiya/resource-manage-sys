import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validate } from "@/lib/utils/validate"
import { bookingCreateSchema } from "@/lib/validators/booking.schema"
import { BookingStatus } from "@/generated/prisma/enums"
import { auditExtension } from "@/lib/audit"
import { successResponse, errorResponse } from "@/lib/api-response"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return errorResponse("Unauthorized", 401)

        const json = await req.json()
        const result = validate(bookingCreateSchema, json)
        if (!result.success) return errorResponse("Validation failed", 400, result.response)

        const data = result.data

        // Convert to Date Object
        const startDateTime = new Date(data.startDateTime);
        const endDateTime = new Date(data.endDateTime);

        if (startDateTime >= endDateTime) {
            return errorResponse("End time must be after start time", 400)
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
            return errorResponse("Resource not found or inactive", 404);
        }

        //Ensure User is from Resource's Organization 
        if (resource.organizationId !== session.user.organizationId) {
            return errorResponse("You cannot book resources from another organization", 403);
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
            return errorResponse("Resource is already booked for this time slot", 409);
        }

        const initialStatus = resource.requiresApproval ? BookingStatus.PENDING : BookingStatus.APPROVED;

        const extendedPrisma = prisma.$extends(auditExtension(Number(session.user.id)))
        const booking = await extendedPrisma.booking.create({
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

        return successResponse(booking, "Booking created successfully", 201)
    }
    catch (error) {
        console.error("Create booking error:", error)
        return errorResponse("Failed to create booking", 500, error)
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return errorResponse("Unauthorized", 401)

        const bookings = await prisma.booking.findMany({
            where: { userId: Number(session.user.id) },
            include: {
                Resource: {
                    select: {
                        name: true,
                        roomNumber: true
                    }
                }
            },
            orderBy: { createdAt: "desc" },
        })

        return successResponse(bookings, "Bookings retrieved successfully")
    }
    catch (error) {
        console.error("Error retrieving bookings:", error);
        return errorResponse("Failed to retrieve bookings", 500, error)
    }
}
