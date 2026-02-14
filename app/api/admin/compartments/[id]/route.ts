import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validate } from "@/lib/utils/validate"
import { compartmentUpdateSchema } from "@/lib/validators/storage.schema"
import { auditExtension } from "@/lib/audit"
import { successResponse, errorResponse } from "@/lib/api-response"

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return errorResponse("Unauthorized", 401)
        if (session.user.role !== "ADMIN") return errorResponse("Forbidden", 403)

        const { id } = await params
        const compartmentId = Number(id)
        const json = await req.json()

        const result = validate(compartmentUpdateSchema, json)
        if (!result.success) return errorResponse("Validation failed", 400, result.response)

        const data = result.data

        const extendedPrisma = prisma.$extends(auditExtension(Number(session.user.id)))

        // Handle User validation if assigning
        if (data.assignedTo) {
            const user = await prisma.user.findUnique({ where: { id: data.assignedTo } })
            if (!user) return errorResponse("User not found", 404)
        }

        const compartment = await extendedPrisma.compartment.update({
            where: { compartmentId },
            data: data
        })

        return successResponse(compartment, "Compartment updated successfully")
    } catch (error) {
        console.error("Error updating compartment:", error)
        return errorResponse("Failed to update compartment", 500, error)
    }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return errorResponse("Unauthorized", 401)
        if (session.user.role !== "ADMIN") return errorResponse("Forbidden", 403)

        const { id } = await params
        const compartmentId = Number(id)

        const extendedPrisma = prisma.$extends(auditExtension(Number(session.user.id)))
        await extendedPrisma.compartment.delete({
            where: { compartmentId }
        })

        return successResponse(null, "Compartment deleted successfully")
    } catch (error) {
        console.error("Error deleting compartment:", error)
        return errorResponse("Failed to delete compartment", 500, error)
    }
}
