"use client"

import AuditTable from "@/components/audit/AuditTable"

export default function AuditLogsPage() {
    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-semibold">Audit Logs</h1>
            <p className="text-muted-foreground">Comprehensive log of all system activities.</p>
            <AuditTable />
        </div>
    )
}
