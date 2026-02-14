import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { BookingStatus, ApprovalStatus, NotificationType } from "@/generated/prisma/enums"
import { sendNotification } from "@/lib/notifications"
import { auditExtension } from "@/lib/audit"
import { successResponse, errorResponse } from "@/lib/api-response"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return errorResponse("Unauthorized", 401)

        if (session.user.role !== "ADMIN")
            return errorResponse("Forbidden", 403)

        const { id } = await params
        const bookingId = Number(id)

        const booking = await prisma.booking.findUnique({
            where: { bookingId },
            include: { Resource: true }
        })

        if (!booking)
            return errorResponse("Booking not found", 404)

        if (booking.status !== BookingStatus.PENDING)
            return errorResponse("Booking not pending", 400)

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
            return errorResponse("Cannot approve: This time slot was just taken by another approved booking.",409);
        }

        const extendedPrisma = prisma.$extends(auditExtension(Number(session.user.id)))
        const result = await extendedPrisma.$transaction([
            extendedPrisma.booking.update({
                where: { bookingId },
                data: { status: BookingStatus.APPROVED }
            }),

            extendedPrisma.bookingApproval.upsert({
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

        return successResponse({ booking: result[0], approval: result[1] }, "Booking approved successfully")
    }
    catch (error) {
        console.error("Error approving booking:", error);
        return errorResponse("Failed to approve booking", 500, error)
    }
}
