import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validate } from "@/lib/utils/validate"
import { userUpdateSchema } from "@/lib/validators/user.schema"

export async function PATCH(req: Request,{ params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new Response("Unauthorized", { status: 401 })
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return new Response("Forbidden", { status: 403 })
    }

    const { id } = await params
    const userId = Number(id)

    if (isNaN(userId)) {
      return new Response("Invalid user id", { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    })

    if (!existingUser) {
      return new Response("User not found", { status: 404 })
    }

    if (session.user.role === "ADMIN" && existingUser.organizationId !== session.user.organizationId) {
      return new Response("Forbidden", { status: 403 })
    }

    const json = await req.json()
    const result = validate(userUpdateSchema, json)

    if (!result.success) {
      return result.response
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: result.data,
    })

    return Response.json(updatedUser)
  } catch (error) {
    console.error("Error updating user:", error)
    return new Response("Failed to update user", { status: 500 })
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new Response("Unauthorized", { status: 401 })
    }

    if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
      return new Response("Forbidden", { status: 403 })
    }

    const { id } = await params
    const userId = Number(id)

    if (isNaN(userId)) {
      return new Response("Invalid user id", { status: 400 })
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { organizationId: true },
    })

    if (!user) {
      return new Response("User not found", { status: 404 })
    }

    if (session.user.role === "ADMIN" && user.organizationId !== session.user.organizationId) {
      return new Response("Forbidden", { status: 403 })
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    })

    return Response.json({ message: "User deactivated successfully" })
  } catch (error) {
    console.error("Error deleting user:", error)
    return Response.json("Failed to delete user", { status: 500 })
  }
}
