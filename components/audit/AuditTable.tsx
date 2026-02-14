"use client"

import { useEffect, useState } from "react"
import { DataTable } from "@/components/ui/data-table"
import { columns, AuditLog } from "./columns"

interface AuditTableProps {
    initialData: AuditLog[]
}

export default function AuditTable({ initialData }: AuditTableProps) {
    const [data, setData] = useState<AuditLog[]>(initialData)




    return (
        <div className="w-full">
            <DataTable columns={columns} data={data} searchKey="action" placeholder="Search by action..." />
        </div>
    )
}
