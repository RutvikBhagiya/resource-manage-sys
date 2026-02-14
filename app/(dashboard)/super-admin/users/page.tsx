import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import UserTable from "@/components/user/UserTable"

export default async function UsersPage() {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "SUPER_ADMIN") {
        redirect("/login")
    }

    const users = await prisma.user.findMany({
        where: { isActive: true },
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
            Organization: rest.Organization ? {
                ...rest.Organization,
                // type: rest.Organization.type // Assuming type is safe string/enum
            } : null
        }
    })

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-semibold">Users Management</h1>
            <UserTable initialData={usersWithoutPassword as any} />
        </div>
    )
}
