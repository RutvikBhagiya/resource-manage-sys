import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validate } from "@/lib/utils/validate"
import { resourceSchema } from "@/lib/validators/resource.schema"
import { auditExtension } from "@/lib/audit"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return new Response("Unauthorized", { status: 401 })
        }

        if (session.user.role !== "ADMIN") {
            return new Response("Forbidden", { status: 403 })
        }

        const json = await req.json()
        const result = validate(resourceSchema, json)

        if (!result.success) {
            return result.response
        }
        const data = result.data
        const extendedPrisma = prisma.$extends(auditExtension(Number(session.user.id)))
        const resource = await extendedPrisma.resource.create({
            data: {
                name: data.name,
                description: data.description,
                capacity: data.capacity,
                floorNumber: data.floorNumber,
                roomNumber: data.roomNumber,
                requiresApproval: data.requiresApproval,
                isAvailable: data.isAvailable,
                organizationId: session.user.organizationId as number,
                categoryId: data.categoryId,
                buildingId: data.buildingId
            }
        })

        return Response.json(resource, { status: 201 })
    }
    catch (error) {
        console.error("Error creating resource:", error);
        return Response.json("Failed to create resource", { status: 500 });
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return new Response("Unauthorized", { status: 401 })

        const resources = await prisma.resource.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                Building: true,
                ResourceCategory: true
            }
        })

        return Response.json(resources);
    }
    catch (error) {
        console.error("Error fetching resources:", error);
        return Response.json("Failed to fetch resources", { status: 500 })
    }
}
