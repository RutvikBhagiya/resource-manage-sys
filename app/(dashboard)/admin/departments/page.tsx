import { DepartmentGrid } from "@/components/department/DepartmentGrid"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"

export default async function DepartmentsPage() {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        redirect("/login")
    }

    const departments = await prisma.department.findMany({
        where: { organizationId: Number(session.user.organizationId) },
        include: {
            _count: {
                select: { User: true }
            }
        },
        orderBy: { createdAt: "desc" }
    })

    const serializedDepartments = departments.map(d => ({
        ...d,
        createdAt: d.createdAt.toISOString()
    }))

    return (
        <div className="p-6">
            <DepartmentGrid initialData={serializedDepartments as any} />
        </div>
    )
}
