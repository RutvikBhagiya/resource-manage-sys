import UserTable from "@/components/user/UserTable"

export default function UsersPage() {
    return (
        <div className="p-6 space-y-4">
            <h1 className="text-2xl font-semibold">Users Management</h1>
            <UserTable />
        </div>
    )
}
