import bcrypt from "bcryptjs"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validate } from "@/lib/utils/validate"
import { userCreateSchema } from "@/lib/validators/user.schema" 

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return new Response("Unauthorized", { status: 401 })
    }

    if (session.user.role !== "ADMIN" &&session.user.role !== "SUPER_ADMIN"){
      return new Response("Forbidden", { status: 403 })
    }

    const json = await req.json()
    const result = validate(userCreateSchema, json)

    if (!result.success) {
      return result.response
    }

    const { password, ...restData } = result.data
    const hashedPassword = await bcrypt.hash(password, 10)

    if (session.user.role === "ADMIN" && restData.organizationId !== session.user.organizationId){
      return new Response("Forbidden", { status: 403 })
    }

    const user = await prisma.user.create({
      data: {
        ...restData,
        password: hashedPassword,
        organizationId: session.user.organizationId
      }
    })

    return Response.json(user, { status: 201 })
  } 
  catch (error) {
    console.error("Error creating user:", error)
    return Response.json("Failed to create user", { status: 500 })
  }
}

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        organizationId: true,
        isActive: true,
        createdAt: true,
      },
    })

    return Response.json(users)
  } catch (error) {
    console.error("Error fetching users:", error)
    return Response.json("Failed to fetch users", { status: 500 })
  }
}
