import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try{
        const session = await getServerSession(authOptions)
        if (!session) return new Response("Unauthorized", { status: 401 })

        const { id } = await params
        const bookingId = Number(id)

        const booking = await prisma.booking.findUnique({
            where: { bookingId },
            include: {
                Resource: true,
                User: true,
                BookingApproval: true
            }
        })

        if (!booking) return new Response("Not found", { status: 404 })

        if (session.user.role === "USER" && booking.userId !== Number(session.user.id)) {
            return new Response("Forbidden", { status: 403 })
        }

        return Response.json(booking)
    }
    catch(error){
        console.error("Error retrieving booking details:", error);
        return Response.json("Failed to retrieve booking details",{status: 500})
    }
  
}