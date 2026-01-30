"use client"

import { ColumnDef } from "@tanstack/react-table"
import { User } from "@/types/user"
import { Button } from "@/components/ui/button"
import UserDialog from "./UserDialog"
import {
    AlertDialog,
    AlertDialogTrigger,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogCancel,
    AlertDialogAction,
} from "@/components/ui/alert-dialog"

export const getUserColumns = (
    handleDelete: (id: string) => void,
    deletingId: string | null,
    showActions: boolean = true
): ColumnDef<User>[] => {
    const columns: ColumnDef<User>[] = [
        {
            accessorKey: "name",
            header: "Name",
        },
        {
            accessorKey: "email",
            header: "Email",
        },
        {
            accessorKey: "phone",
            header: "Phone",
            cell: ({ row }) => row.original.phone || "-",
        },
        {
            accessorKey: "role",
            header: "Role",
        },
        {
            id: "department",
            header: "Department",
            accessorFn: (row) => row.Department?.name || "-",
        },
        {
            accessorKey: "isActive",
            header: "Status",
            cell: ({ row }) => (
                <div className={row.original.isActive ? "text-green-600" : "text-red-600"}>
                    {row.original.isActive ? "Active" : "Inactive"}
                </div>
            ),
        },
    ]

    if (showActions) {
        columns.push({
            id: "actions",
            header: "Actions",
            cell: ({ row }) => (
                <div className="space-x-2 flex">
                    <UserDialog user={row.original} type="edit" />
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button
                                size="sm"
                                variant="destructive"
                                disabled={deletingId === row.original.id}
                            >
                                {deletingId === row.original.id ? "Deleting..." : "Delete"}
                            </Button>
                        </AlertDialogTrigger>

                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete {row.original.name}. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>

                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={() => handleDelete(row.original.id)}
                                    className="bg-red-600"
                                >
                                    Delete
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            ),
        })
    }

    return columns
}
