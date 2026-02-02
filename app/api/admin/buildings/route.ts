import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validate } from "@/lib/utils/validate"
import { buildingCreateSchema } from "@/lib/validators/building.schema"

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
        const result = validate(buildingCreateSchema, json)

        if (!result.success) {
            return result.response
        }
        const data = result.data

        const building = await prisma.building.create({
            data: {
                ...data,
                organizationId: session?.user.organizationId as number
            }
        })

        return Response.json(building, { status: 201 })
    }
    catch (error) {
        console.error("Error Creating building:", error);
        return Response.json("Failed to create building", { status: 500 })
    }
}

export async function GET() {
    try {
        const buildings = await prisma.building.findMany({
            orderBy: { createdAt: "desc" },
            include: {
                _count: {
                    select: { Resource: true }
                }
            }
        })

        return Response.json(buildings)
    }
    catch (error) {
        console.error("Error fetching buildings:", error);
        return Response.json("Failed to fetch buildings", { status: 500 })
    }
}