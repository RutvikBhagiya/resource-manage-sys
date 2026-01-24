import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { BookingStatus,ApprovalStatus,NotificationType } from "@/generated/prisma/enums" 
import { sendNotification } from "@/lib/notifications"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try{
        const session = await getServerSession(authOptions)
        if (!session) return new Response("Unauthorized", { status: 401 })

        if (session.user.role !== "ADMIN")
            return new Response("Forbidden", { status: 403 })

        const { id } = await params
        const bookingId = Number(id)

        const booking = await prisma.booking.findUnique({
            where: { bookingId },
            include: {Resource: true}
        })

        if (!booking)
            return new Response("Booking not found", { status: 404 })

        if (booking.status !== BookingStatus.PENDING)
            return new Response("Booking not pending", { status: 400 })

        const conflict = await prisma.booking.findFirst({
            where: {
                resourceId: booking.resourceId,
                status: BookingStatus.APPROVED,
                AND: [
                    { startDateTime: { lt: booking.endDateTime } },
                    { endDateTime: { gt: booking.startDateTime } },
                    { bookingId: { not: bookingId } }
                ]
            }
        });

        if (conflict) {
            return new Response(
                "Cannot approve: This time slot was just taken by another approved booking.", 
                { status: 409 }
            );
        }

        const result = await prisma.$transaction([
            prisma.booking.update({
                where: { bookingId },
                data: { status: BookingStatus.APPROVED }
            }),

            prisma.bookingApproval.upsert({
                where: { bookingId: bookingId }, 
                update: {
                    status: ApprovalStatus.APPROVED,
                    approverId: Number(session.user.id),
                    approvedAt: new Date()
                },
                create: {
                    bookingId,
                    status: ApprovalStatus.APPROVED,
                    approverId: Number(session.user.id),
                    approvedAt: new Date()
                }
            })
            ])
        await sendNotification({
            userId: booking.userId,
            title: "Booking Approved",
            message: `Your booking for ${booking.Resource.name} has been approved.`,
            type: NotificationType.SUCCESS
        })

        return Response.json({booking: result[0], approval: result[1]})
    }
    catch(error){
        console.error("Error approving booking:", error);
        return Response.json("Failed to approve booking",{status: 500})
    }
}
