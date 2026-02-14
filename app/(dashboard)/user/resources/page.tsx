import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { UserResourceBrowser } from "@/components/user/UserResourceBrowser"

export default async function UserResourcesPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user?.organizationId) redirect("/login")

    const orgId = session.user.organizationId
    const userId = Number(session.user.id)

    // Fetch data in parallel
    const [resources, buildings, departments] = await Promise.all([
        prisma.resource.findMany({
            where: {
                organizationId: orgId,
                isActive: true
            },
            include: {
                Building: true,
                ResourceCategory: true,
                ResourceAmenity: true
            },
            orderBy: { name: 'asc' }
        }),
        prisma.building.findMany({
            where: { organizationId: orgId, isActive: true },
            select: { buildingId: true, name: true }
        }),
        prisma.department.findMany({
            where: { organizationId: orgId, isActive: true },
            select: { departmentId: true, name: true }
        })
    ])

    return (
        <div className="p-6 space-y-6">
            <div>
                <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-cyan-500 dark:from-violet-400 dark:to-cyan-400 w-fit">
                    Browse Resources
                </h1>
                <p className="text-muted-foreground mt-1">Find and book rooms, equipment, and more.</p>
            </div>

            <UserResourceBrowser
                resources={resources as any} // Type assertion to avoid strict Graphql/Json Date issues for now
                buildings={buildings}
                departments={departments}
                userId={userId}
            />
        </div>
    )
}
