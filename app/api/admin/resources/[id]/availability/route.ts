import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { z } from "zod"

const availabilitySchema = z.object({
    dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format"),
    isAvailable: z.boolean().default(true)
})

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { id } = await params
        const resourceId = parseInt(id)

        if (isNaN(resourceId)) {
            return new NextResponse("Invalid Resource ID", { status: 400 })
        }

        const resource = await prisma.resource.findUnique({
            where: { resourceId },
            select: { organizationId: true }
        })

        if (!resource) return new NextResponse("Resource not found", { status: 404 })

        // Allow read access to any authenticated user who can view the resource
        // if (session.user.role === "ADMIN" && resource.organizationId !== session.user.organizationId) {
        //     return new NextResponse("Forbidden", { status: 403 })
        // }

        const availability = await prisma.resourceAvailability.findMany({
            where: { resourceId },
            orderBy: { startTime: 'asc' }
        })

        return NextResponse.json(availability)
    } catch (error) {
        console.error("[RESOURCE_AVAILABILITY_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { id } = await params
        const resourceId = parseInt(id)

        if (isNaN(resourceId)) {
            return new NextResponse("Invalid Resource ID", { status: 400 })
        }

        const resource = await prisma.resource.findUnique({
            where: { resourceId },
            select: { organizationId: true }
        })

        if (!resource) return new NextResponse("Resource not found", { status: 404 })

        if (session.user.role === "ADMIN" && resource.organizationId !== session.user.organizationId) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const json = await req.json()
        const body = availabilitySchema.parse(json)
        // Convert time strings to Date objects (Store as UTC to keep the "Face Value" of the time)
        const start = new Date(`1970-01-01T${body.startTime}:00Z`)
        const end = new Date(`1970-01-01T${body.endTime}:00Z`)

        if (start >= end) {
            return new NextResponse("Start time must be before end time", { status: 400 })
        }

        const overlaps = await prisma.resourceAvailability.findFirst({
            where: {
                resourceId,
                dayOfWeek: body.dayOfWeek,
                OR: [
                    {
                        AND: [
                            { startTime: { lte: start } },
                            { endTime: { gt: start } }
                        ]
                    },
                    {
                        AND: [
                            { startTime: { lt: end } },
                            { endTime: { gte: end } }
                        ]
                    },
                    {
                        AND: [
                            { startTime: { gte: start } },
                            { endTime: { lte: end } }
                        ]
                    }
                ]
            }
        })

        if (overlaps) {
            return new NextResponse("Time slot overlaps with an existing availability rule", { status: 409 })
        }

        const newAvailability = await prisma.resourceAvailability.create({
            data: {
                resourceId,
                dayOfWeek: body.dayOfWeek,
                startTime: start,
                endTime: end,
                isAvailable: body.isAvailable
            }
        })

        return NextResponse.json(newAvailability)
    } catch (error) {
        if (error instanceof z.ZodError) {
            return new NextResponse("Invalid Request Data", { status: 400 })
        }
        console.error("[RESOURCE_AVAILABILITY_POST]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
