import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import OrganizationGrid from "@/components/organization/OrganizationGrid"

export default async function OrganizationsPage() {
  const session = await getServerSession(authOptions)
  if (!session || session.user.role !== "SUPER_ADMIN") {
    redirect("/login")
  }

  const organizations = await prisma.organization.findMany({
    where: { isActive: true },
    orderBy: { createdAt: "desc" }
  })

  const serializedOrgs = organizations.map(org => ({
    ...org,
    createdAt: org.createdAt.toISOString(),
    updatedAt: org.updatedAt.toISOString()
  }))

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Organizations</h1>
      <OrganizationGrid initialData={serializedOrgs as any} />
    </div>
  )
}
