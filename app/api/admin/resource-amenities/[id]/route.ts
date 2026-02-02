import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session || session.user.role !== "ADMIN") {
            return new Response("Unauthorized", { status: 401 })
        }

        const { id } = await params
        const amenityId = Number(id)
        if (isNaN(amenityId)) return new Response("Invalid ID", { status: 400 })

        await prisma.resourceAmenity.delete({
            where: { amenityId }
        })

        return Response.json({ message: "Amenity deleted" })
    } catch (error) {
        console.error("Error deleting amenity:", error)
        return new Response("Failed to delete amenity", { status: 500 })
    }
}
