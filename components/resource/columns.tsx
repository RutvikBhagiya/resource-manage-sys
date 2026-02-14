"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Resource } from "@/types/resource"
import { Button } from "@/components/ui/button"
import { ArrowUpDown, Edit, Trash2, List, Clock } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export const getResourceColumns = (
  onEdit: (resource: Resource) => void,
  onDelete: (id: number) => void,
  deletingId: number | null,
  onViewAmenities: (resource: Resource) => void,
  onViewAvailability: (resource: Resource) => void
): ColumnDef<Resource>[] => [
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    },
    {
      accessorKey: "ResourceCategory.name",
      header: "Category",
      cell: ({ row }) => row.original.ResourceCategory?.name || "N/A",
    },
    {
      accessorKey: "Building.name",
      header: "Building",
      cell: ({ row }) => row.original.Building?.name || "N/A",
    },
    {
      accessorKey: "capacity",
      header: "Capacity",
    },
    {
      accessorKey: "requiresApproval",
      header: "Approval",
      cell: ({ row }) => (
        <Badge variant={row.original.requiresApproval ? "secondary" : "outline"}>
          {row.original.requiresApproval ? "Required" : "Auto"}
        </Badge>
      )
    },
    {
      accessorKey: "isAvailable",
      header: "Status",
      cell: ({ row }) => (
        <Badge variant={row.original.isAvailable ? "default" : "destructive"}>
          {row.original.isAvailable ? "Available" : "Unavailable"}
        </Badge>
      )
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const resource = row.original
        const isDeleting = deletingId === resource.resourceId

        return (
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onViewAmenities(resource)} title="View Amenities">
              <List className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">View Amenities</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onViewAvailability(resource)} title="Manage Availability">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Manage Availability</span>
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(resource)}>
              <Edit className="h-4 w-4 text-muted-foreground" />
              <span className="sr-only">Edit</span>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
              onClick={() => onDelete(resource.resourceId)}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <span className="animate-spin">...</span>
              ) : (
                <Trash2 className="h-4 w-4" />
              )}
              <span className="sr-only">Delete</span>
            </Button>
          </div>
        )
      },
    },
  ]
