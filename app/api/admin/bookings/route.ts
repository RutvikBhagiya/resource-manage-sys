import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { BookingStatus } from "@/generated/prisma/enums"

export async function GET(req: Request) {
    try{
        const session = await getServerSession(authOptions)
        if (!session) return new Response("Unauthorized", { status: 401 })

        if (session.user.role !== "ADMIN")
            return new Response("Forbidden", { status: 403 })

        const { searchParams } = new URL(req.url)
        const status = searchParams.get("status") as BookingStatus | null

        const bookings = await prisma.booking.findMany({
            where: { 
                organizationId: session.user.organizationId,
                ...(status ? { status } : {})
            },
            include: {
                User: true,
                Resource: true,
                BookingApproval: true
            },
            orderBy: { createdAt: "desc" }
        })

        return Response.json(bookings)
    }
    catch(error){
        console.error("Error retrieving bookings:", error);
        return Response.json("Failed to retrieve bookings",{status: 500})
    }
}
