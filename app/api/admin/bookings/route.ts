import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { BookingStatus } from "@/generated/prisma/enums"
import { successResponse, errorResponse } from "@/lib/api-response"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return errorResponse("Unauthorized", 401)

        if (session.user.role !== "ADMIN")
            return errorResponse("Forbidden", 403)

        const { searchParams } = new URL(req.url)
        const status = searchParams.get("status") as BookingStatus | null

        const bookings = await prisma.booking.findMany({
            where: {
                organizationId: session.user.organizationId as number,
                ...(status ? { status } : {})
            },
            include: {
                User: true,
                Resource: true,
                BookingApproval: true
            },
            orderBy: { createdAt: "desc" }
        })

        return successResponse(bookings, "Bookings retrieved successfully")
    }
    catch (error) {
        console.error("Error retrieving bookings:", error);
        return errorResponse("Failed to retrieve bookings", 500, error)
    }
}
