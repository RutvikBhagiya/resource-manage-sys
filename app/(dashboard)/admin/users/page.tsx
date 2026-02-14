import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import UserTable from "@/components/user/UserTable"

export default async function AdminUsersPage() {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        redirect("/login")
    }

    const users = await prisma.user.findMany({
        where: {
            organizationId: Number(session.user.organizationId),
            isActive: true
        },
        orderBy: { createdAt: "desc" },
        include: {
            Organization: {
                select: {
                    name: true,
                    type: true
                }
            }
        }
    })

    const usersWithoutPassword = users.map(user => {
        const { password, ...rest } = user
        return {
            ...rest,
            createdAt: rest.createdAt.toISOString(),
            updatedAt: rest.updatedAt.toISOString(),
        }
    })

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-semibold">Organization Users</h1>
            <p className="text-muted-foreground">Manage users within your organization.</p>
            <UserTable apiEndpoint="/api/admin/users" initialData={usersWithoutPassword as any} />
        </div>
    )
}
