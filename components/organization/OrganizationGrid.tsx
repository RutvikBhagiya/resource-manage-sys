"use client"

import { useEffect, useState } from "react"
import { toast } from "sonner"
import { Organization } from "@/types/organization"
import { OrganizationCard } from "./OrganizationCard"
import OrganizationDialog from "./OrganizationDialog"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export default function OrganizationGrid() {
    const [data, setData] = useState<Organization[]>([])
    const [search, setSearch] = useState("")
    const [deletingId, setDeletingId] = useState<number | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetch("/api/super-admin/organizations")
            .then((res) => res.json())
            .then((data) => {
                setData(data)
                setLoading(false)
            })
            .catch((err) => {
                console.error(err)
                setLoading(false)
            })
    }, [])

    const handleDelete = async (id: number) => {
        try {
            setDeletingId(id)

            const res = await fetch(`/api/super-admin/organizations/${id}`, {
                method: "DELETE",
            })
            if (!res.ok) throw new Error("Failed to delete")

            toast.success("Organization deleted successfully")
            setData((prev) => prev.filter((org) => org.organizationId !== id))
        } catch (err) {
            console.error(err)
            toast.error("Error deleting organization")
        } finally {
            setDeletingId(null)
        }
    }

    const filteredData = data.filter(org =>
        org.name.toLowerCase().includes(search.toLowerCase()) ||
        org.type.toLowerCase().includes(search.toLowerCase())
    )

    if (loading) return <div>Loading organizations...</div>

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search organizations..."
                        className="pl-8"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <OrganizationDialog type="add" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredData.map((org) => (
                    <OrganizationCard
                        key={org.organizationId}
                        organization={org}
                        onDelete={handleDelete}
                        isDeleting={deletingId === org.organizationId}
                    />
                ))}
                {filteredData.length === 0 && (
                    <div className="col-span-full text-center py-10 text-muted-foreground">
                        No organizations found.
                    </div>
                )}
            </div>
        </div>
    )
}
