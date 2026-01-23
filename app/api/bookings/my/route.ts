import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
    try{
        const session = await getServerSession(authOptions)
        if (!session) return new Response("Unauthorized", { status: 401 })

        const bookings = await prisma.booking.findMany({
            where: {
                userId: Number(session.user.id),
            },
            include: {
                Resource: true,
                BookingApproval: true,
            },
            orderBy: {
                startDateTime: "desc",
            }
        })

        return Response.json(bookings)
    }
    catch(error){
        console.error("Error retrieving my bookings:", error);
        return Response.json("Failed to retrieve my bookings",{status: 500})
    }
}
