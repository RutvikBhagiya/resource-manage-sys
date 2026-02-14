import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validate } from "@/lib/utils/validate"
import { userCreateSchema } from "@/lib/validators/user.schema"
import bcrypt from "bcryptjs"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (session.user.role !== "ADMIN") {
            return new NextResponse("Forbidden", { status: 403 })
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
            return new NextResponse("User with this email already exists", { status: 409 })
        }

        const hashedPassword = await bcrypt.hash(data.password, 10)

        const userData: any = {
            name: data.name,
            email: data.email,
            password: hashedPassword,
            role: data.role,
            phone: data.phone,
            image: data.image,
            organizationId: parseInt(session.user.id), // Wait, organizationId should be session.user.organizationId
            departmentId: json.departmentId ? Number(json.departmentId) : undefined
        }

        // Fix organizationId assignment
        // session.user.organizationId is what we need. 
        // We need to fetch it if it's not in session user object, but usually it is.
        // Let's verify session user object. 

        let orgId = session.user.organizationId
        if (!orgId) {
            const currentUser = await prisma.user.findUnique({
                where: { id: parseInt(session.user.id) },
                select: { organizationId: true }
            })
            orgId = currentUser?.organizationId
        }

        if (!orgId) {
            return new NextResponse("Organization not found", { status: 404 })
        }

        userData.organizationId = orgId

        const user = await prisma.user.create({
            data: userData
        })

        const { password, ...userWithoutPassword } = user

        return NextResponse.json(userWithoutPassword, { status: 201 })
    }
    catch (error) {
        console.error("Error creating user:", error)
        return new NextResponse("Failed to create user", { status: 500 })
    }
}

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: parseInt(session.user.id) },
            select: { organizationId: true }
        })

        if (!currentUser?.organizationId) {
            return new NextResponse("Organization not found", { status: 404 })
        }

        const users = await prisma.user.findMany({
            where: {
                organizationId: currentUser.organizationId,
            },
            select: {
                id: true,
                name: true,
                email: true,
                role: true,
                phone: true,
                departmentId: true,
                isActive: true,
                Department: {
                    select: {
                        name: true
                    }
                },
                createdAt: true
            },
            orderBy: {
                createdAt: "desc",
            },
        })

        return NextResponse.json(users)
    } catch (error) {
        console.error("[ADMIN_USERS_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
