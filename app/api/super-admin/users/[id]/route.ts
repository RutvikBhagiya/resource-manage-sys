import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validate } from "@/lib/utils/validate"
import { userUpdateSchema } from "@/lib/validators/user.schema"
import bcrypt from "bcryptjs"
import { auditExtension } from "@/lib/audit"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "SUPER_ADMIN") {
            return new Response("Unauthorized", { status: 403 })
        }

        const { id } = await params
        const userId = Number(id)

        if (isNaN(userId)) {
            return new Response("Invalid user id", { status: 400 })
        }

        const json = await req.json()
        const result = validate(userUpdateSchema, json)

        if (!result.success) {
            return result.response
        }

        const data = result.data

        let updateData: any = { ...data }

        if (data.password && data.password.length >= 6) {
            updateData.password = await bcrypt.hash(data.password, 10)
        } else {
            delete updateData.password
        }

        if (data.password === "") {
            delete updateData.password
        }

        if (data.organizationId !== undefined) {
            updateData.organizationId = data.organizationId ? Number(data.organizationId) : null
        }

        const extendedPrisma = prisma.$extends(auditExtension(Number(session.user.id)))
        const user = await extendedPrisma.user.update({
            where: {
                id: userId
            },
            data: updateData,
        })

        const { password, ...userWithoutPassword } = user
        return Response.json(userWithoutPassword)
    } catch (error) {
        console.error("Failed to update user:", error)
        return new Response("Failed to update user", { status: 500 })
    }
}

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getServerSession(authOptions)

        if (!session || session.user.role !== "SUPER_ADMIN") {
            return new Response("Unauthorized", { status: 403 })
        }

        const { id } = await params
        const userId = Number(id)

        if (isNaN(userId)) {
            return new Response("Invalid user id", { status: 400 })
        }

        const extendedPrisma = prisma.$extends(auditExtension(Number(session.user.id)))
        await extendedPrisma.user.update({
            where: { id: userId },
            data: { isActive: false }
        })

        return new Response(null, { status: 204 })
    } catch (error) {
        console.error("Failed to delete user:", error)
        return new Response("Failed to delete user", { status: 500 })
    }
}
