import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: parseInt(session.user.id) },
            select: { organizationId: true }
        })

        if (!currentUser?.organizationId) {
            return new NextResponse("Organization not found", { status: 404 })
        }

        const users = await prisma.user.findMany({
            where: {
                organizationId: currentUser.organizationId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                departmentId: true,
                isActive: true,
                Department: {
                    select: {
                        name: true
                    }
                },
                createdAt: true
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return NextResponse.json(users)
    } catch (error) {
        console.error("[ADMIN_USERS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
