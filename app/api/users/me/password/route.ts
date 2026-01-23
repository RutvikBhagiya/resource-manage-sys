import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { changePasswordSchema } from "@/lib/validators/user.schema"
import bcrypt from "bcryptjs"

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new Response("Unauthorized", { status: 401 })
    }

    const json = await req.json()
    const result = changePasswordSchema.safeParse(json)

    if (!result.success) {
      return Response.json(result.error.format(), { status: 400 })
    }

    const { currentPassword, newPassword } = result.data

    const user = await prisma.user.findUnique({
      where: {id: Number(session.user.id) },
      select: { password: true },
    })

    if (!user) {
      return new Response("User not found", { status: 404 })
    }

    const isValid = await bcrypt.compare(currentPassword, user.password)

    if (!isValid) {
      return new Response("Current password is incorrect", { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    await prisma.user.update({
      where: { id: Number(session.user.id) },
      data: { password: hashedPassword },
    })

    await prisma.session.deleteMany({
        where: { id: Number(session.user.id) },
    })

    // await prisma.auditLog.create({
    //   data: {
    //     userId: session.user.id,
    //     action: "CHANGE_PASSWORD",
    //     entity: "User",
    //     entityId: session.user.id,
    //   },
    // })

    return Response.json({ message: "Password updated successfully" })
  } 
  catch (error) {
    console.error("Change password error:", error)
    return new Response("Failed to change password", { status: 500 })
  }
}
