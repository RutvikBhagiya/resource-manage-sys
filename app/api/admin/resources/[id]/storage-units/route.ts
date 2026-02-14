import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validate } from "@/lib/utils/validate"
import { storageUnitCreateSchema } from "@/lib/validators/storage.schema"
import { auditExtension } from "@/lib/audit"
import { successResponse, errorResponse } from "@/lib/api-response"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return errorResponse("Unauthorized", 401)

        if (session.user.role !== "ADMIN") return errorResponse("Forbidden", 403)

        const { id } = await params
        const resourceId = Number(id)

        const units = await prisma.storageUnit.findMany({
            where: { resourceId },
            include: {
                _count: {
                    select: { Compartment: true }
                }
            },
            orderBy: { createdAt: "desc" }
        })

        return successResponse(units, "Storage units retrieved successfully")
    } catch (error) {
        console.error("Error retrieving storage units:", error)
        return errorResponse("Failed to retrieve storage units", 500, error)
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return errorResponse("Unauthorized", 401)
        if (session.user.role !== "ADMIN") return errorResponse("Forbidden", 403)

        const { id } = await params
        const resourceId = Number(id)
        const json = await req.json()

        const payload = { ...json, resourceId }
        const result = validate(storageUnitCreateSchema, payload)

        if (!result.success) return errorResponse("Validation failed", 400, result.response)

        const data = result.data

        const extendedPrisma = prisma.$extends(auditExtension(Number(session.user.id)))
        const unit = await extendedPrisma.storageUnit.create({
            data: {
                resourceId,
                name: data.name,
                type: data.type,
                totalCompartments: data.totalCompartments
            }
        })

        return successResponse(unit, "Storage unit created successfully", 201)
    } catch (error) {
        console.error("Error creating storage unit:", error)
        return errorResponse("Failed to create storage unit", 500, error)
    }
}
