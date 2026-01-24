import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const markReadSchema = z.object({
    notificationIds: z.array(z.number())
})

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return new Response("Unauthorized", { status: 401 })

        const notifications = await prisma.notification.findMany({
            where: { 
                userId: Number(session.user.id) 
            },
            orderBy: { 
                createdAt: 'desc' 
            },
            take: 50
        })

        const unreadCount = await prisma.notification.count({
            where: {
                userId: Number(session.user.id),
                isRead: false
            }
        })

        return Response.json({ notifications, unreadCount })
    } catch (error) {
        console.error("Error fetching notifications:", error)
        return new Response("Internal Error", { status: 500 })
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return new Response("Unauthorized", { status: 401 })

        const body = await req.json()
        const result = markReadSchema.safeParse(body)
        
        if (!result.success) {
            return new Response("Invalid request", { status: 400 })
        }

        await prisma.notification.updateMany({
            where: {
                userId: Number(session.user.id),
                notificationId: {
                    in: result.data.notificationIds
                }
            },
            data: {
                isRead: true
            }
        })

        return new Response("Updated", { status: 200 })
    } catch (error) {
        console.error("Error updating notifications:", error)
        return new Response("Internal Error", { status: 500 })
    }
}