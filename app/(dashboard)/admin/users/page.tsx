"use client"

import UserTable from "@/components/user/UserTable"

export default function AdminUsersPage() {
    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-semibold">Organization Users</h1>
            <p className="text-muted-foreground">Manage users within your organization.</p>
            <UserTable apiEndpoint="/api/admin/users" />
        </div>
    )
}
