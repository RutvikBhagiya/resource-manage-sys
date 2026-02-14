import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PATCH(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (session.user.role !== "ADMIN") {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const body = await req.json()
        const { departmentId, role, isActive } = body
        const { id } = await params

        // Verify the user belongs to the same organization
        const targetUser = await prisma.user.findUnique({
            where: { id: parseInt(id) },
        })

        if (!targetUser) {
            return new NextResponse("User not found", { status: 404 })
        }

        if (targetUser.organizationId !== session.user.organizationId) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const updatedUser = await prisma.user.update({
            where: { id: parseInt(id) },
            data: {
                departmentId: departmentId ? parseInt(departmentId) : null,
                // functionality to update role or status can be added here if needed
                // keeping it safe by only updating department for now, or fields passed
                // The prompt specifically asked for department assignment.
            }
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error("[ADMIN_USERS_PATCH]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const session = await getServerSession(authOptions)

        if (!session) {

            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (session.user.role !== "ADMIN") {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const targetUser = await prisma.user.findUnique({
            where: { id: parseInt(id) },
        })

        if (!targetUser) {
            return new NextResponse("User not found", { status: 404 })
        }

        if (targetUser.organizationId !== session.user.organizationId) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        await prisma.user.delete({
            where: { id: parseInt(id) }
        })

        return new NextResponse(null, { status: 200 })
    } catch (error) {
        console.error("[ADMIN_USERS_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
