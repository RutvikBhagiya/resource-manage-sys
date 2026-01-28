import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validate } from "@/lib/utils/validate"
import { organizationCreateSchema } from "@/lib/validators/organization.schema"

// export async function POST(req: Request) {
//     try {
//         const session = await getServerSession(authOptions)
//         if (!session) return new Response("Unauthorized", { status: 401 })

//         const json = await req.json()
//         const result = validate(organizationCreateSchema, json)
//         if (!result.success) return result.response

//         const data = result.data

//         const organization = await prisma.organization.findUnique({
//             where: { organizationId: data. },
//             select: {
//                 requiresApproval: true,
//                 organizationId: true,
//                 isActive: true,
//                 name: true 
//             }
//         });

//         if (!resource || !resource.isActive) {
//         return new Response("Resource not found or inactive", { status: 404 });
//         }

//         //Ensure User is from Resource's Organization 
//         if (resource.organizationId !== session.user.organizationId) {
//              return new Response("You cannot book resources from another organization", { status: 403 });
//         }

//         const conflict = await prisma.booking.findFirst({
//             where: {
//                 resourceId: data.resourceId,
//                 status: {
//                     notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED] // Ignore cancelled/rejected bookings
//                 },
//                 AND: [
//                     { startDateTime: { lt: endDateTime } },
//                     { endDateTime: { gt: startDateTime } }
//                 ]
//             }
//         });

//         if (conflict) {
//             return new Response("Resource is already booked for this time slot", { status: 409 });
//         }

//         const initialStatus = resource.requiresApproval ? BookingStatus.PENDING : BookingStatus.APPROVED;

//         const booking = await prisma.booking.create({
//             data: {
//                 organizationId: session.user.organizationId,
//                 resourceId: data.resourceId,
//                 userId: Number(session.user.id),
//                 title: data.title,
//                 purpose: data.purpose,
//                 startDateTime: startDateTime,
//                 endDateTime: endDateTime,
//                 attendeesCount: data.attendeesCount,
//                 priority: data.priority,
//                 status: initialStatus
//             }
//         })

//         return Response.json(booking, { status: 201 })
//     } 
//     catch (error) {
//         console.error("Create booking error:", error)
//         return new Response("Failed to create booking", { status: 500 })
//     }
// }

export async function GET() {
    try{
        const session = await getServerSession(authOptions)
        if (!session) return new Response("Unauthorized", { status: 401 })

        const organizations = await prisma.organization.findMany({  
            orderBy: { createdAt: "desc" }
        })

        return Response.json(organizations)
    }
    catch(error){
        console.error("Error retrieving organizations:", error);
        return Response.json("Failed to retrieve organizations",{status: 500})
    }
}
