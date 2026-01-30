import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validate } from "@/lib/utils/validate"
import { userCreateSchema } from "@/lib/validators/user.schema"
import bcrypt from "bcryptjs"
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
        const result = validate(userCreateSchema, json)

        if (!result.success) {
            return result.response
        }
        const data = result.data

        const existingUser = await prisma.user.findUnique({
            where: { email: data.email }
        })
        if (existingUser) {
            return new Response("User with this email already exists", { status: 409 })
        }

        const hashedPassword = await bcrypt.hash(data.password, 10)

        const extendedPrisma = prisma.$extends(auditExtension(Number(session.user.id)))
        const user = await extendedPrisma.user.create({
            data: {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: data.role,
                organizationId: data.organizationId ? Number(data.organizationId) : null,
                phone: data.phone,
                image: data.image
            }
        })

        const { password, ...userWithoutPassword } = user

        return Response.json(userWithoutPassword, { status: 201 })
    }
    catch (error) {
        console.error("Error creating user:", error)
        return new Response("Failed to create user", { status: 500 })
    }
}


export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return new Response("Unauthorized", { status: 401 })

        if (session.user.role !== "SUPER_ADMIN") {
            return new Response("Forbidden", { status: 403 })
        }

        const users = await prisma.user.findMany({
            where: { isActive: true },
            orderBy: { createdAt: "desc" },
            include: {
                Organization: {
                    select: {
                        name: true,
                        type: true
                    }
                }
            }
        })

        const usersWithoutPassword = users.map(user => {
            const { password, ...rest } = user
            return rest
        })

        return Response.json(usersWithoutPassword)
    }
    catch (error) {
        console.error("Error retrieving users:", error);
        return new Response("Failed to retrieve users", { status: 500 })
    }
}
