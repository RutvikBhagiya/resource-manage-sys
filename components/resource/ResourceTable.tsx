"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Resource } from "@/types/resource"
import { getResourceColumns } from "./columns"
import { DataTable } from "@/components/ui/data-table"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import { ResourceDialog } from "./ResourceDialog"
import { CategoryManagerDialog } from "./CategoryManagerDialog"
import { AmenityManagerDialog } from "./AmenityManagerDialog"
import { ResourceAvailabilityManager } from "@/components/admin/resources/ResourceAvailabilityManager"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

export default function ResourceTable() {
  const [data, setData] = useState<Resource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null)
  const [selectedResourceForAmenities, setSelectedResourceForAmenities] = useState<Resource | null>(null)
  const [selectedResourceForAvailability, setSelectedResourceForAvailability] = useState<Resource | null>(null)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)

  const fetchResources = async () => {
    setIsLoading(true)
    try {
      const res = await fetch("/api/admin/resources")
      if (res.ok) {
        const json = await res.json()
        setData(json)
      }
    } catch (error) {
      console.error(error)
      toast.error("Failed to load resources")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchResources()
  }, [])

  const handleCreate = () => {
    setSelectedResource(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (resource: Resource) => {
    setSelectedResource(resource)
    setIsDialogOpen(true)
  }

  const handleViewAmenities = (resource: Resource) => {
    setSelectedResourceForAmenities(resource)
  }

  const handleDeleteClick = (id: number) => {
    setDeletingId(id)
    setDeleteConfirmOpen(true)
  }

  const confirmDelete = async () => {
    if (!deletingId) return

    try {
      const res = await fetch(`/api/admin/resources/${deletingId}`, {
        method: "DELETE",
      })

      if (!res.ok) {
        const error = await res.text()
        throw new Error(error || "Failed to delete")
      }

      toast.success("Resource deleted successfully")
      fetchResources()
    } catch (error) {
      console.error(error)
      toast.error("Failed to delete resource")
    } finally {
      setDeletingId(null)
      setDeleteConfirmOpen(false)
    }
  }

  const handleViewAvailability = (resource: Resource) => {
    setSelectedResourceForAvailability(resource)
  }

  const columns = getResourceColumns(handleEdit, handleDeleteClick, deletingId, handleViewAmenities, handleViewAvailability)

  if (isLoading) {
    return <div className="text-center py-10">Loading resources...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex gap-2">
          <CategoryManagerDialog />
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Resource
        </Button>
      </div>

      <DataTable columns={columns} data={data} searchKey="name" placeholder="Search resources..." />

      <ResourceDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        resource={selectedResource}
        onSuccess={fetchResources}
      />

      {selectedResourceForAmenities && (
        <AmenityManagerDialog
          open={!!selectedResourceForAmenities}
          onOpenChange={(open) => !open && setSelectedResourceForAmenities(null)}
          resourceId={selectedResourceForAmenities.resourceId}
          resourceName={selectedResourceForAmenities.name}
        />
      )}

      {selectedResourceForAvailability && (
        <Dialog open={!!selectedResourceForAvailability} onOpenChange={(open) => !open && setSelectedResourceForAvailability(null)}>
          <DialogContent className="max-w-xl">
            <DialogHeader>
              <DialogTitle>Manage Availability: {selectedResourceForAvailability.name}</DialogTitle>
              <DialogDescription>
                Configure when this resource is available for booking.
              </DialogDescription>
            </DialogHeader>
            <ResourceAvailabilityManager resourceId={selectedResourceForAvailability.resourceId} />
          </DialogContent>
        </Dialog>
      )}

      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the resource.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

