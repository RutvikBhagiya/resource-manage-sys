"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

export type AuditLog = {
    id: number
    action: string
    entity: string
    entityId: number | null
    createdAt: string
    User: {
        name: string
        email: string
    } | null
    oldData: any
    newData: any
}

export const columns: ColumnDef<AuditLog>[] = [
    {
        accessorKey: "createdAt",
        header: "Date",
        cell: ({ row }) => new Date(row.getValue("createdAt")).toLocaleString(),
    },
    {
        accessorKey: "User.name",
        header: "User",
        cell: ({ row }) => {
            const user = row.original.User
            return user ? (
                <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                </div>
            ) : "System/Unknown"
        }
    },
    {
        accessorKey: "action",
        header: "Action",
        cell: ({ row }) => (
            <span className={`font-bold ${row.getValue("action") === "CREATE" ? "text-green-600" :
                    row.getValue("action") === "DELETE" ? "text-red-600" : "text-blue-600"
                }`}>
                {row.getValue("action")}
            </span>
        ),
    },
    {
        accessorKey: "entity",
        header: "Entity",
        cell: ({ row }) => `${row.getValue("entity")} #${row.original.entityId || 'N/A'}`,
    },
    {
        id: "changes",
        header: "Changes",
        cell: ({ row }) => {
            const log = row.original
            return (
                <Dialog>
                    <DialogTrigger asChild>
                        <Button variant="outline" size="sm">View Details</Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                        <DialogHeader>
                            <DialogTitle>{log.action} - {log.entity}</DialogTitle>
                            <DialogDescription>
                                Detailed changes for {log.entity} #{log.entityId} performed by {log.User?.name || 'Unknown'} on {new Date(log.createdAt).toLocaleString()}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <div className="border rounded-md p-4">
                                <h4 className="font-semibold mb-2 text-red-600">Old Data</h4>
                                <ScrollArea className="h-[300px] w-full rounded-md border p-2">
                                    <pre className="text-xs">{log.oldData ? JSON.stringify(log.oldData, null, 2) : "No previous data"}</pre>
                                </ScrollArea>
                            </div>
                            <div className="border rounded-md p-4">
                                <h4 className="font-semibold mb-2 text-green-600">New Data</h4>
                                <ScrollArea className="h-[300px] w-full rounded-md border p-2">
                                    <pre className="text-xs">{log.newData ? JSON.stringify(log.newData, null, 2) : "No new data"}</pre>
                                </ScrollArea>
                            </div>
                        </div>
                    </DialogContent>
                </Dialog>
            )
        }
    }
]
