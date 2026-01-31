"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { columns, AuditLog } from "./columns"

export default function AuditTable() {
    const [data, setData] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/super-admin/audit-logs")
            .then((res) => res.json())
            .then((data) => {
                setData(data)
                setLoading(false)
            })
            .catch((err) => {
                console.error("Failed to fetch logs", err)
                setLoading(false)
            })
    }, [])

    if (loading) return <div>Loading logs...</div>

    return (
        <div className="w-full">
            <DataTable columns={columns} data={data} searchKey="action" placeholder="Search by action..." />
        </div>
    )
}
