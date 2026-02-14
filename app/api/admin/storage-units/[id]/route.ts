import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { auditExtension } from "@/lib/audit"
import { successResponse, errorResponse } from "@/lib/api-response"

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return errorResponse("Unauthorized", 401)
        if (session.user.role !== "ADMIN") return errorResponse("Forbidden", 403)

        const { id } = await params
        const unitId = Number(id)

        const extendedPrisma = prisma.$extends(auditExtension(Number(session.user.id)))
        // Delete related compartments first to avoid foreign key constraint
        await extendedPrisma.compartment.deleteMany({
            where: { unitId }
        })

        await extendedPrisma.storageUnit.delete({
            where: { unitId }
        })

        return successResponse(null, "Storage unit deleted successfully")
    } catch (error) {
        console.error("Error deleting storage unit:", error)
        return errorResponse("Failed to delete storage unit", 500, error)
    }
}
