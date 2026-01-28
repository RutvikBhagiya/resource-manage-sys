import { prisma } from "@/lib/prisma" 
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { name, email, password, organizationId } = body

    if (!name || !email || !password || !organizationId) {
      return NextResponse.json({ error: "Missing fields" }, { status: 400 })
    }

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 409 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const normalizedEmail = email.toLowerCase().trim();

    const user = await prisma.user.create({
      data: {
        name,
        email : normalizedEmail,
        password: hashedPassword,
        role: "USER",
        organizationId,
      }
    })

    return NextResponse.json({ success: true, userId: user.id })
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 })
  }
}
