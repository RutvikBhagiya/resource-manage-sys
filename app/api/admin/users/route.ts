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

        // Ensure user is an Admin or Super Admin
        if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
            return new NextResponse("Forbidden", { status: 403 })
        }

        // If Super Admin, they might want to see all users (handled by super-admin routes), 
        // but if they use this route, we can restrict to their org or show error.
        // For now, let's assume this is strictly for Organization Admins.
        // Actually, let's match the logic: fetch users for the admin's organization.

        // Must have an organizationId
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
