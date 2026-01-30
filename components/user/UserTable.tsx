"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { flexRender, getCoreRowModel, getFilteredRowModel, getPaginationRowModel, getSortedRowModel, useReactTable, SortingState, ColumnFiltersState } from "@tanstack/react-table"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { User } from "@/types/user"
import { getUserColumns } from "./columns"
import UserDialog from "./UserDialog"

interface UserTableProps {
    apiEndpoint?: string
    readOnly?: boolean
}

export default function UserTable({ apiEndpoint = "/api/super-admin/users", readOnly = false }: UserTableProps) {
    const [data, setData] = useState<User[]>([])
    const [sorting, setSorting] = useState<SortingState>([])
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        fetch(apiEndpoint)
            .then((res) => res.json())
            .then(setData)
            .catch((err) => console.error(err))
    }, [])

    const handleDelete = async (id: string) => {
        try {
            setDeletingId(id)

            const res = await fetch(`/api/super-admin/users/${id}`, {
                method: "DELETE",
            })
            if (!res.ok) {
                const errorMsg = await res.text()
                throw new Error(errorMsg)
            }

            toast.success("User deleted successfully")
            setData((prev) => prev.filter((user) => user.id !== id))
        } catch (err) {
            console.error(err)
            toast.error(err instanceof Error ? err.message : "Error deleting user")
        } finally {
            setDeletingId(null)
        }
    }

    const table = useReactTable({
        data,
        columns: getUserColumns(handleDelete, deletingId, !readOnly),
        state: { sorting, columnFilters },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    })

    return (
        <div className="w-full">
            <div className="flex items-center justify-between py-4">
                <Input
                    placeholder="Search name..."
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(e) =>
                        table.getColumn("name")?.setFilterValue(e.target.value)
                    }
                    className="max-w-sm"
                />
                {!readOnly && <UserDialog type="add" />}
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => (
                                    <TableHead key={header.id}>
                                        {flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={table.getAllColumns().length} className="text-center">
                                    No users found
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            <div className="flex justify-end gap-2 py-4">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div>
    )
}
