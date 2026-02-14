import { BuildingGrid } from "@/components/building/BuildingGrid"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function BuildingsPage() {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        redirect("/login")
    }

    const buildings = await prisma.building.findMany({
        where: { organizationId: Number(session.user.organizationId) },
        include: {
            _count: {
                select: { Resource: true }
            }
        },
        orderBy: { createdAt: "desc" }
    })

    const serializedBuildings = buildings.map(b => ({
        ...b,
        createdAt: b.createdAt.toISOString()
    }))

    return (
        <div className="p-6">
            <BuildingGrid initialData={serializedBuildings as any} />
        </div>
    )
}
