import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validate } from "@/lib/utils/validate"
import { resourceAmenityCreateSchema } from "@/lib/validators/resource-amenity.schema"

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
        const result = validate(resourceAmenityCreateSchema, json)

        if (!result.success) {
            return result.response
        }
        const data = result.data

        const resourceAmenity = await prisma.resourceAmenity.create({
            data: {
                resourceId: data.resourceId,
                name: data.name,
                type: data.type,
                quantity: data.quantity,
                isWorking: data.isWorking,
            }
        })

        return Response.json(resourceAmenity, { status: 201 })
    }
    catch (error) {
        console.error("Error creating resource amenity:", error);
        return Response.json("Failed to create resource amenity", { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return new Response("Unauthorized", { status: 401 })

        const { searchParams } = new URL(req.url)
        const resourceId = searchParams.get("resourceId")

        const whereClause = resourceId ? { resourceId: Number(resourceId) } : {}

        const amenities = await prisma.resourceAmenity.findMany({
            where: whereClause,
            include: {
                Resource: {
                    select: { name: true }
                }
            }
        });

        return Response.json(amenities);
    }
    catch (error) {
        console.error("Error fetching resource amenities:", error);
        return Response.json("Failed to fetch resource amenities", { status: 500 })
    }
}
