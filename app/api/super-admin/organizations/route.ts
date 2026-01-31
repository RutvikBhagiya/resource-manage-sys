import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validate } from "@/lib/utils/validate"
import { organizationCreateSchema } from "@/lib/validators/organization.schema"
import { auditExtension } from "@/lib/audit"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return new Response("Unauthorized", { status: 401 })
        }

        if (session.user.role !== "SUPER_ADMIN") {
            return new Response("Forbidden", { status: 403 })
        }

        const json = await req.json()
        const result = validate(organizationCreateSchema, json)

        if (!result.success) {
            return result.response
        }
        const data = result.data

        const extendedPrisma = prisma.$extends(auditExtension(Number(session.user.id)))
        const organization = await extendedPrisma.organization.create({
            data: {
                ...data
            }
        })

        return Response.json(organization, { status: 201 })
    }
    catch (error) {
        return Response.json("Failed to create organization", { status: 500 })
    }
}


export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return new Response("Unauthorized", { status: 401 })

        const organizations = await prisma.organization.findMany({
            where: { isActive: true },
            orderBy: { createdAt: "desc" }
        })

        return Response.json(organizations)
    }
    catch (error) {
        console.error("Error retrieving organizations:", error);
        return Response.json("Failed to retrieve organizations", { status: 500 })
    }
}
