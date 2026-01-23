import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { BookingStatus } from "@/generated/prisma/enums"

export async function PATCH(req: Request,{ params }: { params: Promise<{ id: string }> }) {
    try{
        const session = await getServerSession(authOptions)
        if (!session) return new Response("Unauthorized", { status: 401 })

        const { id } = await params
        const bookingId = Number(id)
        if (isNaN(bookingId))
            return new Response("Invalid booking id", { status: 400 })

        const booking = await prisma.booking.findUnique({
            where: { bookingId }
        })

        if (!booking)
            return new Response("Booking not found", { status: 404 })

        if (booking.userId !== Number(session.user.id))
            return new Response("Forbidden", { status: 403 })

        if (booking.status !== BookingStatus.PENDING)
            return new Response("Cannot cancel this booking", { status: 400 })

        const updated = await prisma.booking.update({
            where: { bookingId },
            data: { status: BookingStatus.CANCELLED }
        })

        return Response.json(updated)
    }
    catch(error){
        console.error("Error cancelling booking:", error);
        return Response.json("Failed to cancel booking",{status: 500})
    }
}
