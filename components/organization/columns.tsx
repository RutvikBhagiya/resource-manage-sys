"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Organization } from "@/types/organization"
import { Button } from "@/components/ui/button"
import OrganizationDialog from "@/components/organization/OrganizationDialog"

export const columns: ColumnDef<Organization>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => row.original.email ?? "-",
  },
  {
    accessorKey: "phone",
    header: "Phone",
    cell: ({ row }) => row.original.phone ?? "-",
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => row.original.address ?? "-",
  },
  {
    accessorKey: "isActive",
    header: "Active",
    cell: ({ row }) =>
      row.original.isActive ? "Yes" : "No",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) =>
      new Date(row.original.createdAt).toLocaleDateString(),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({row}) => (
      <div className="space-x-2">
        <OrganizationDialog organization={row.original} />
        <Button size="sm" variant="destructive">
          Delete
        </Button>
      </div>
    )
  }
]
