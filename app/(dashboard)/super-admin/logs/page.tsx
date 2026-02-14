import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import AuditTable from "@/components/audit/AuditTable"

export default async function AuditLogsPage() {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "SUPER_ADMIN") {
        redirect("/login")
    }

    const logs = await prisma.auditLog.findMany({
        orderBy: { createdAt: "desc" },
        take: 200,
        include: {
            User: {
                select: {
                    name: true,
                    email: true,
                    role: true
                }
            }
        }
    })

    const serializedLogs = logs.map(log => ({
        ...log,
        createdAt: log.createdAt.toISOString()
    }))

    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-semibold">Audit Logs</h1>
            <p className="text-muted-foreground">Comprehensive log of all system activities.</p>
            <AuditTable initialData={serializedLogs as any} />
        </div>
    )
}
