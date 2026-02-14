import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { BookingStatus } from "@/generated/prisma/enums"
import { startOfDay, endOfDay } from "date-fns"

export async function GET(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { searchParams } = new URL(req.url)
        const dateParam = searchParams.get("date")

        if (!dateParam) {
            return new NextResponse("Date is required", { status: 400 })
        }

        const date = new Date(dateParam)
        if (isNaN(date.getTime())) {
            return new NextResponse("Invalid date", { status: 400 })
        }

        const resources = await prisma.resource.findMany({
            where: {
                organizationId: session.user.organizationId ?? undefined,
                isActive: true
            },
            select: {
                resourceId: true,
                name: true,
                roomNumber: true,
                ResourceCategory: {
                    select: { name: true }
                },
                Building: {
                    select: { name: true }
                }
            }
        })

        if (resources.length === 0) {
            return NextResponse.json({ resources: [], bookings: [] })
        }

        const resourceIds = resources.map(r => r.resourceId)

        // Get bookings for these resources on the specific date
        const bookings = await prisma.booking.findMany({
            where: {
                resourceId: { in: resourceIds },
                status: {
                    notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED]
                },
                AND: [
                    {
                        startDateTime: {
                            lt: endOfDay(date)
                        }
                    },
                    {
                        endDateTime: {
                            gt: startOfDay(date)
                        }
                    }
                ]
            },
            select: {
                bookingId: true,
                resourceId: true,
                startDateTime: true,
                endDateTime: true,
                title: true, // Show basic info
                status: true,
                User: {
                    select: {
                        name: true // Maybe show who booked it? Useful for internal checking.
                    }
                }
            }
        })

        return NextResponse.json({
            resources,
            bookings
        })
    } catch (error) {
        console.error("[AVAILABILITY_GET]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
