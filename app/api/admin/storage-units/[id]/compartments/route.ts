import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validate } from "@/lib/utils/validate"
import { compartmentCreateSchema } from "@/lib/validators/storage.schema"
import { auditExtension } from "@/lib/audit"
import { successResponse, errorResponse } from "@/lib/api-response"

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return errorResponse("Unauthorized", 401)
        if (session.user.role !== "ADMIN") return errorResponse("Forbidden", 403)

        const { id } = await params
        const unitId = Number(id)

        const compartments = await prisma.compartment.findMany({
            where: { unitId },
            orderBy: { compartmentNumber: "asc" }
        })

        // Fetch User details for assignedTo
        // Since schema doesn't have relation, we must fetch users manually if assignedTo is present
        const userIds = compartments
            .filter(c => c.assignedTo)
            .map(c => c.assignedTo as number)

        let usersMap = new Map<number, { id: number, name: string, email: string }>()
        if (userIds.length > 0) {
            const users = await prisma.user.findMany({
                where: { id: { in: userIds } },
                select: { id: true, name: true, email: true }
            })
            users.forEach(u => usersMap.set(u.id, u))
        }

        const enrichedCompartments = compartments.map(c => ({
            ...c,
            User: c.assignedTo ? usersMap.get(c.assignedTo) : null
        }))

        return successResponse(enrichedCompartments, "Compartments retrieved successfully")
    } catch (error) {
        console.error("Error retrieving compartments:", error)
        return errorResponse("Failed to retrieve compartments", 500, error)
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return errorResponse("Unauthorized", 401)
        if (session.user.role !== "ADMIN") return errorResponse("Forbidden", 403)

        const { id } = await params
        const unitId = Number(id)
        const json = await req.json()

        const payload = { ...json, unitId }
        const result = validate(compartmentCreateSchema, payload)

        if (!result.success) return errorResponse("Validation failed", 400, result.response)

        const data = result.data

        const extendedPrisma = prisma.$extends(auditExtension(Number(session.user.id)))
        const compartment = await extendedPrisma.compartment.create({
            data: {
                unitId,
                compartmentNumber: data.compartmentNumber,
                capacity: data.capacity,
                description: data.description,
                isAvailable: data.isAvailable
            }
        })

        // Update StorageUnit count if needed? Schema has 'totalCompartments' but that's static usually, or a count?
        // Let's assume 'totalCompartments' in StorageUnit is capacity/metadata, not dynamic count. 
        // But if user wants it sync, we could update it. Let's leave it as metadata for now.

        return successResponse(compartment, "Compartment created successfully", 201)
    } catch (error) {
        console.error("Error creating compartment:", error)
        return errorResponse("Failed to create compartment", 500, error)
    }
}
