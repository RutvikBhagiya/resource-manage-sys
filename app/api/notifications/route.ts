import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return new Response("Unauthorized", { status: 401 })

        // Parse query params
        const url = new URL(req.url)
        const unreadOnly = url.searchParams.get("unreadOnly") === "true"

        const whereClause: any = {
            userId: Number(session.user.id)
        }

        if (unreadOnly) {
            whereClause.isRead = false
        }

        const notifications = await prisma.notification.findMany({
            where: whereClause,
            orderBy: { createdAt: "desc" },
            take: 50 // Limit 
        })

        return Response.json(notifications)
    } catch (error) {
        console.error("Error fetching notifications:", error)
        return new Response("Failed to fetch notifications", { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return new Response("Unauthorized", { status: 401 })

        const body = await req.json()
        const { notificationIds, markAll } = body

        if (markAll) {
            await prisma.notification.updateMany({
                where: {
                    userId: Number(session.user.id),
                    isRead: false
                },
                data: { isRead: true }
            })
            return Response.json({ success: true })
        }

        if (Array.isArray(notificationIds) && notificationIds.length > 0) {
            await prisma.notification.updateMany({
                where: {
                    notificationId: { in: notificationIds },
                    userId: Number(session.user.id)
                },
                data: { isRead: true }
            })
            return Response.json({ success: true })
        }

        return new Response("Invalid request", { status: 400 })

    } catch (error) {
        console.error("Error updating notifications:", error)
        return new Response("Failed to update notifications", { status: 500 })
    }
}