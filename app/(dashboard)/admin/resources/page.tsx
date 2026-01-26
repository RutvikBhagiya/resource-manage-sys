import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ResourceFormSheet } from "@/components/admin/ResourceForm"
import { CategoryDialog } from "@/components/admin/CategoryDialog"
import { ResourceActions } from "@/components/admin/ResourceActions"
import { Badge } from "@/components/ui/badge"
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from "@/components/ui/table"

export default async function ResourcesPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const resources = await prisma.resource.findMany({
    where: { 
      organizationId: session.user.organizationId,
      isActive: true 
    },
    include: {
      ResourceCategory: { select: { name: true } },
      Building: { select: { name: true } }
    },
    orderBy: { name: "asc" }
  })

  const categories = await prisma.resourceCategory.findMany({
    where: { organizationId: session.user.organizationId },
    select: { categoryId: true, name: true },
    orderBy: { name: "asc" }
  })

  const buildings = await prisma.building.findMany({
    where: { organizationId: session.user.organizationId },
    select: { buildingId: true, name: true },
    orderBy: { name: "asc" }
  })

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Resources</h1>
          <p className="text-muted-foreground">Manage your rooms and equipment</p>
        </div>
        
        <div className="flex gap-3">
          <CategoryDialog />
          <ResourceFormSheet categories={categories} buildings={buildings} />
        </div>
      </div>

      <div className="rounded-xl border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Capacity</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[100px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {resources.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                        No resources found. Add one above.
                    </TableCell>
                </TableRow>
            ) : (
                resources.map((res) => (
                <TableRow key={res.resourceId}>
                    <TableCell className="font-medium">
                      {res.name}
                      <div className="text-xs text-muted-foreground">
                        {res.roomNumber ? `Rm ${res.roomNumber}` : 'No Unit'}
                      </div>
                    </TableCell>

                    <TableCell>{res.Building?.name || "-"}</TableCell>

                    <TableCell>
                      <Badge variant="secondary">
                          {(res as any).ResourceCategory?.name || (res as any).resourceCategory?.name || "Uncategorized"}
                      </Badge>
                    </TableCell>
                    
                    <TableCell>{res.capacity}</TableCell>
                    
                    <TableCell>
                      {res.isAvailable ? (
                        <div className="flex items-center gap-2">
                           <span className="flex h-2 w-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.4)]" />
                           <span className="text-xs font-medium text-green-700">Available</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                           <span className="flex h-2 w-2 rounded-full bg-amber-500" />
                           <span className="text-xs text-muted-foreground">Maintenance</span>
                        </div>
                      )}
                    </TableCell>

                    <TableCell>
                       <ResourceActions 
                          resource={res} 
                          categories={categories} 
                          buildings={buildings} 
                       />
                    </TableCell>
                </TableRow>
                ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}