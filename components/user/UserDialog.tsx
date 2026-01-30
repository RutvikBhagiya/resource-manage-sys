"use client"

import { useState, useEffect } from "react"
import { User } from "@/types/user"
import { Organization } from "@/types/organization"
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
    const [name, setName] = useState(user?.name ?? "")
    const [email, setEmail] = useState(user?.email ?? "")
    const [password, setPassword] = useState("")
    const [role, setRole] = useState<string>(user?.role ?? "USER")
    const [organizationId, setOrganizationId] = useState<string>(user?.organizationId?.toString() ?? "")
    const [phone, setPhone] = useState(user?.phone ?? "")
    const [organizations, setOrganizations] = useState<Organization[]>([])
    const [loading, setLoading] = useState(false)
    const [open, setOpen] = useState(false)

    useEffect(() => {
        fetch("/api/super-admin/organizations")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setOrganizations(data)
            })
            .catch(err => console.error("Failed to fetch organizations", err))
    }, [])

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        const body: any = {
            name,
            email,
            role,
            phone,
            organizationId: organizationId ? Number(organizationId) : null,
        }

        if (password) {
            body.password = password
        }

        try {
            if (type === "edit") {
                await fetch(`/api/super-admin/users/${user?.id}`, {
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
                await fetch(`/api/super-admin/users`, {
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

                        <div className="grid gap-2">
                            <Label>Phone</Label>
                            <Input value={phone} onChange={e => setPhone(e.target.value)} />
                        </div>
                    </div>

                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" disabled={loading}>{type === "edit" ? "Save" : "Add"}</Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
