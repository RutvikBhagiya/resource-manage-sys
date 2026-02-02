"use client"

import { useState, useEffect } from "react"
import { BuildingCard } from "./BuildingCard"
import { BuildingDialog } from "./BuildingDialog"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import {AlertDialog,AlertDialogCancel,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle} from "@/components/ui/alert-dialog"
import { Building } from "@/types/building"

export function BuildingGrid() {
    const [buildings, setBuildings] = useState<Building[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedBuilding, setSelectedBuilding] = useState<Building | null>(null)
    const [deleteId, setDeleteId] = useState<number | null>(null)

    const fetchBuildings = async () => {
        try {
            const res = await fetch("/api/admin/buildings")
            if (res.ok) {
                const data = await res.json()
                setBuildings(data)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load buildings")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchBuildings()
    }, [])

    const handleCreate = () => {
        setSelectedBuilding(null)
        setIsDialogOpen(true)
    }

    const handleEdit = (building: Building) => {
        setSelectedBuilding(building)
        setIsDialogOpen(true)
    }

    const handleDeleteClick = (id: number) => {
        setDeleteId(id)
    }

    const confirmDelete = async () => {
        if (!deleteId) return
        setIsDeleting(true)
        try {
            const res = await fetch(`/api/admin/buildings/${deleteId}`, {
                method: "DELETE",
            })
            if (res.ok) {
                toast.success("Building active status updated")
                setDeleteId(null)
                fetchBuildings()
            } else {
                toast.error("Failed to update building status")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error updating building status")
        } finally {
            setIsDeleting(false)
        }
    }

    if (isLoading) {
        return <div className="p-4 text-center">Loading buildings...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Buildings</h2>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Add Building
                </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {buildings.map((building) => (
                    <BuildingCard
                        key={building.buildingId}
                        building={building}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                ))}
            </div>

            {buildings.length === 0 && (
                <div className="text-center py-12 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    <p className="text-muted-foreground">No buildings found. Create one to get started.</p>
                </div>
            )}

            <BuildingDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                building={selectedBuilding}
                onSuccess={fetchBuildings}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will deactivate the building. You can reactivate it later if needed.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <Button
                            variant="destructive"
                            disabled={isDeleting}
                            onClick={async (e) => {
                                e.preventDefault()
                                await confirmDelete()
                            }}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {isDeleting ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Deactivating...
                                </>
                            ) : (
                                "Deactivate"
                            )}
                        </Button>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
