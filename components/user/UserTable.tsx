"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { User } from "@/types/user"
import { getUserColumns } from "./columns"
import UserDialog from "./UserDialog"
import { DataTable } from "@/components/ui/data-table"

interface UserTableProps {
    apiEndpoint?: string
    readOnly?: boolean
}

export default function UserTable({ apiEndpoint = "/api/super-admin/users", readOnly = false }: UserTableProps) {
    const [data, setData] = useState<User[]>([])
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

    const columns = getUserColumns(handleDelete, deletingId, !readOnly)

    return (
        <div className="w-full space-y-4">
            <div className="flex items-center justify-end py-4">
                {!readOnly && <UserDialog type="add" />}
            </div>
            <DataTable columns={columns} data={data} searchKey="name" placeholder="Search name..." />
        </div>
    )
}
