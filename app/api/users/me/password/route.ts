import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"
import bcrypt from "bcryptjs"
import { successResponse, errorResponse } from "@/lib/api-response"

const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: z.string().min(6),
})

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return errorResponse("Unauthorized", 401)
    }

    const body = await req.json()
    const result = updatePasswordSchema.safeParse(body)

    if (!result.success) {
      return errorResponse("Invalid request data", 422, result.error)
    }

    const { currentPassword, newPassword } = result.data

    const user = await prisma.user.findUnique({
      where: {
        id: parseInt(session.user.id),
      },
    })

    if (!user) {
      return errorResponse("User not found", 404)
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isPasswordValid) {
      return errorResponse("Invalid current password", 400)
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: {
        id: parseInt(session.user.id),
      },
      data: {
        password: hashedPassword,
      },
    })

    return successResponse(null, "Password updated successfully")
  } catch (error) {
    console.error("[PASSWORD_UPDATE]", error)
    return errorResponse("Internal Error", 500, error)
  }
}
