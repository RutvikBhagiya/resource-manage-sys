import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validate } from "@/lib/utils/validate"
import { bookingRejectSchema } from "@/lib/validators/booking.schema"
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
        const body = await req.json()

        const payload = { ...body, bookingId }

        const resultValidate = validate(bookingRejectSchema, payload)
        if (!resultValidate.success) return errorResponse("Validation failed", 400, resultValidate.response)

        const data = resultValidate.data

        const booking = await prisma.booking.findUnique({
            where: { bookingId },
        })

        if (!booking)
            return errorResponse("Booking not found", 404)

        if (booking.status !== BookingStatus.PENDING)
            return errorResponse("Booking not pending", 400)

        const extendedPrisma = prisma.$extends(auditExtension(Number(session.user.id)))
        const result = await extendedPrisma.$transaction([
            extendedPrisma.booking.update({
                where: { bookingId },
                data: { status: BookingStatus.REJECTED },
            }),

            extendedPrisma.bookingApproval.upsert({
                where: { bookingId },
                update: {
                    status: ApprovalStatus.REJECTED,
                    approverId: Number(session.user.id),
                    comments: data.reason,
                    approvedAt: new Date()
                },
                create: {
                    bookingId,
                    status: ApprovalStatus.REJECTED,
                    approverId: Number(session.user.id),
                    comments: data.reason,
                    approvedAt: new Date()
                }
            })
        ])
        await sendNotification({
            userId: booking.userId,
            title: "Booking Rejected",
            message: `Your booking was rejected. Reason: ${data.reason}`,
            type: NotificationType.ERROR
        })

        return successResponse({ booking: result[0], approval: result[1] }, "Booking rejected successfully")
    }
    catch (error) {
        console.error("Error rejecting booking:", error);
        return errorResponse("Failed to reject booking", 500, error)
    }
}