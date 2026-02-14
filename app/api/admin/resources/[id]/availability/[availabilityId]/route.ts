import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string; availabilityId: string }> }
) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
            return new NextResponse("Unauthorized", { status: 401 })
        }

        const { id, availabilityId } = await params
        const resourceId = parseInt(id)
        const availId = parseInt(availabilityId)

        if (isNaN(resourceId) || isNaN(availId)) {
            return new NextResponse("Invalid ID", { status: 400 })
        }

        const resource = await prisma.resource.findUnique({
            where: { resourceId },
            select: { organizationId: true }
        })

        if (!resource) return new NextResponse("Resource not found", { status: 404 })

        if (session.user.role === "ADMIN" && resource.organizationId !== session.user.organizationId) {
            return new NextResponse("Forbidden", { status: 403 })
        }

        const availability = await prisma.resourceAvailability.findUnique({
            where: {
                availabilityId: availId,
                resourceId: resourceId
            }
        })

        if (!availability) {
            return new NextResponse("Availability rule not found", { status: 404 })
        }

        await prisma.resourceAvailability.delete({
            where: { availabilityId: availId }
        })

        return new NextResponse(null, { status: 204 })
    } catch (error) {
        console.error("[RESOURCE_AVAILABILITY_DELETE]", error)
        return new NextResponse("Internal Error", { status: 500 })
    }
}
