import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import { successResponse, errorResponse } from "@/lib/api-response"

const updateProfileSchema = z.object({
    name: z.string().min(2).max(50),
    phone: z.string().optional().nullable(),
})

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return errorResponse("Unauthorized", 401)
        }

        const user = await prisma.user.findUnique({
            where: {
                id: parseInt(session.user.id),
            },
            select: {
                name: true,
                email: true,
                phone: true,
                role: true,
                image: true,
                Organization: {
                    select: {
                        name: true,
                        type: true,
                    },
                },
                Department: {
                    select: {
                        name: true,
                    },
                },
            },
        })

        if (!user) {
            return errorResponse("User not found", 404)
        }

        return successResponse(user, "User profile retrieved successfully")
    } catch (error) {
        console.error("[SETTINGS_GET]", error)
        return errorResponse("Internal Error", 500, error)
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return errorResponse("Unauthorized", 401)
        }

        const body = await req.json()
        const result = updateProfileSchema.safeParse(body)

        if (!result.success) {
            return errorResponse("Validation failed", 400, result.error)
        }

        const { name, phone } = result.data

        const user = await prisma.user.update({
            where: {
                id: parseInt(session.user.id),
            },
            data: {
                name,
                phone,
            },
        })

        return successResponse(user, "Profile updated successfully")
    } catch (error) {
        console.error("[SETTINGS_UPDATE]", error)
        return errorResponse("Internal Error", 500, error)
    }
}
