"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Resource } from "@/types/resource"
import { Button } from "@/components/ui/button"

export const columns: ColumnDef<Resource>[] = [
  {
    accessorKey: "name",
    header: "Name"
  },
  {
    accessorKey: "capacity",
    header: "Capacity",
    cell: ({row}) => row.original.capacity ?? "-"
  },
  {
    accessorKey: "requiresApproval",
    header: "RequiresApproval",
    cell: ({ row }) => row.original.requiresApproval ? "Yes" : "No"
  },
  {
    header: "Building",
    cell: ({ row }) => row.original.Building?.name ?? "-"
  },
  {
    header: "Category",
    cell: ({ row }) => row.original.ResourceCategory?.name ?? "-" 
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString()
  },
  {
    id: "actions",
    header: "Actions",
    cell: () => (
      <div className="space-x-2">
        <Button size="sm" variant="outline">
          Edit
        </Button>
        <Button size="sm" variant="destructive">
          Delete
        </Button>
      </div>
    )
  }
]
