import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import ResourceTable from "@/components/resource/ResourceTable"

export default async function ResourcesPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "ADMIN") {
    redirect("/login")
  }

  const orgId = Number(session.user.organizationId)

  const resources = await prisma.resource.findMany({
    where: { organizationId: orgId },
    include: {
      ResourceCategory: true,
      ResourceAmenity: true,
      Building: true
    },
    orderBy: { createdAt: "desc" }
  })

  // Serialize dates
  const serializedResources = resources.map(resource => ({
    ...resource,
    createdAt: resource.createdAt.toISOString(),
    updatedAt: resource.updatedAt.toISOString(),
    // Handle nested dates if any, though ResourceCategory/Amenity/Building usually don't need explicit date serialization for simple usage unless strict checking
    // But Resource interface expects Date objects for these? Check types.
    // The props will be coming from server, so they are JSON.
    // The component state expects "Resource".
    // If Resource interface has Date, and we pass string, TypeScript might complain or runtime might be fine if standard operations.
    // However, best to cast as any or ensure types match.
  }))

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Resources</h1>
      <ResourceTable initialData={serializedResources as any} />
    </div>
  )
}
