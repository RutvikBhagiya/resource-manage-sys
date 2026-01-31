import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return new Response("Unauthorized", { status: 401 })

        if (session.user.role !== "SUPER_ADMIN") {
            return new Response("Forbidden", { status: 403 })
        }

        const logs = await prisma.auditLog.findMany({
            orderBy: { createdAt: "desc" },
            take: 200,
            include: {
                User: {
                    select: {
                        name: true,
                        email: true,
                        role: true
                    }
                }
            }
        })

        return Response.json(logs)
    } catch (error) {
        console.error("Error fetching audit logs:", error)
        return new Response("Failed to fetch audit logs", { status: 500 })
    }
}
