import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validate } from "@/lib/utils/validate"
import { bookingRejectSchema } from "@/lib/validators/booking.schema"
import { BookingStatus, ApprovalStatus } from "@/generated/prisma/enums"

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return new Response("Unauthorized", { status: 401 })

        if (session.user.role !== "ADMIN")
            return new Response("Forbidden", { status: 403 })

        const { id } = await params
        const bookingId = Number(id)
        const body = await req.json()

        const payload = { ...body, bookingId }
        
        const resultValidate = validate(bookingRejectSchema, payload)
        if (!resultValidate.success) return resultValidate.response

        const data = resultValidate.data 

        const booking = await prisma.booking.findUnique({
            where: { bookingId },
        })

        if (!booking)
            return new Response("Booking not found", { status: 404 })

        if (booking.status !== BookingStatus.PENDING)
            return new Response("Booking not pending", { status: 400 })

        const result = await prisma.$transaction([
            prisma.booking.update({
                where: { bookingId },
                data: { status: BookingStatus.REJECTED },
            }),

            prisma.bookingApproval.upsert({
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

        return Response.json({ booking: result[0], approval: result[1] })
    }
    catch(error) {
        console.error("Error rejecting booking:", error);
        return new Response("Failed to reject booking", { status: 500 })
    }
}