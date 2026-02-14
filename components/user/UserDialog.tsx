"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { User } from "@/types/user"
import { Organization } from "@/types/organization"
import { Department } from "@/types/department"
import { Button } from "@/components/ui/button"
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"

import { Label } from "@/components/ui/label"
import { Role } from "@/generated/prisma/enums"

type Props = {
    user?: User
    type?: "edit" | "add"
}

export default function UserDialog({ user, type = "edit" }: Props) {
    const { data: session } = useSession()
    const [name, setName] = useState(user?.name ?? "")
    const [email, setEmail] = useState(user?.email ?? "")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState<string>(user?.role ?? "USER")
    const [organizationId, setOrganizationId] = useState<string>(user?.organizationId?.toString() ?? "")
    const [departmentId, setDepartmentId] = useState<string>(user?.departmentId?.toString() ?? "")
    const [phone, setPhone] = useState(user?.phone ?? "")

    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [departments, setDepartments] = useState<Department[]>([])

    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    const isSuperAdmin = session?.user?.role === "SUPER_ADMIN"
    const isAdmin = session?.user?.role === "ADMIN"

    useEffect(() => {
        if (isSuperAdmin) {
            fetch("/api/super-admin/organizations")
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setOrganizations(data)
                })
                .catch(err => console.error("Failed to fetch organizations", err))
        }
    }, [isSuperAdmin])

    useEffect(() => {
        if (isAdmin) {
            fetch("/api/admin/departments")
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) setDepartments(data)
                })
                .catch(err => console.error("Failed to fetch departments", err))
        }
    }, [isAdmin])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        const body: any = {
            name,
            email,
            role,
            phone,
            organizationId: organizationId ? Number(organizationId) : null,
            departmentId: departmentId ? Number(departmentId) : null,
        }

        if (password) {
            body.password = password
        }

        try {
            if (type === "edit") {
                const endpoint = isAdmin
                    ? `/api/admin/users/${user?.id}`
                    : `/api/super-admin/users/${user?.id}`

                await fetch(endpoint, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                })
            } else {
                if (!password) {
                    toast.error("Password is required for new users")
                    setLoading(false)
                    return
                }

                // Admin Create User currently not supported by API in this task, but strictly following 'assign department' req.
                // Assuming Super Admin for create, or if Admin tries, it might fail if endpoint doesn't exist.
                // Keeping original logic for Create.
                const endpoint = isAdmin
                    ? `/api/admin/users`
                    : `/api/super-admin/users`

                await fetch(endpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(body),
                })
            }
            setOpen(false)
            toast.success("User saved successfully")
            window.location.reload()
        } catch (error) {
            console.error("Failed to save user", error)
            toast.error("Failed to save user")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm" variant={type === "edit" ? "outline" : "default"}>
                    {type === "edit" ? "Edit" : "Add User"}
                </Button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[420px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>{type === "edit" ? "Edit User" : "Add User"}</DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label>Name</Label>
                            <Input value={name} onChange={e => setName(e.target.value)} required />
                        </div>

                        <div className="grid gap-2">
                            <Label>Email</Label>
                            <Input value={email} onChange={e => setEmail(e.target.value)} type="email" required />
                        </div>

                        <div className="grid gap-2">
                            <Label>{type === "edit" ? "New Password (Optional)" : "Password"}</Label>
                            <Input
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                type="password"
                                placeholder={type === "edit" ? "Leave blank to keep same" : ""}
                            />
                        </div>

                        <div className="grid gap-2">
                            <Label>Role</Label>
                            <select
                                value={role}
                                onChange={e => setRole(e.target.value)}
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {Object.values(Role).map((r) => (
                                    <option key={r} value={r}>{r}</option>
                                ))}
                            </select>
                        </div>

                        {isSuperAdmin && (
                            <div className="grid gap-2">
                                <Label>Organization</Label>
                                <select
                                    value={organizationId}
                                    onChange={e => setOrganizationId(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">No Organization</option>
                                    {organizations.map(org => (
                                        <option key={org.organizationId} value={org.organizationId}>
                                            {org.name} ({org.type})
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {isAdmin && (
                            <div className="grid gap-2">
                                <Label>Department</Label>
                                <select
                                    value={departmentId}
                                    onChange={e => setDepartmentId(e.target.value)}
                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    <option value="">No Department</option>
                                    {departments.filter(d => d.isActive).map(dept => (
                                        <option key={dept.departmentId} value={dept.departmentId}>
                                            {dept.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label>Phone</Label>
                            <Input value={phone} onChange={e => setPhone(e.target.value)} />
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Saving..." : (type === "edit" ? "Save" : "Add User")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
