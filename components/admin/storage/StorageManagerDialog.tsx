"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { StorageUnit } from "@/types/storage"
import { Plus, Archive, ChevronRight, Trash2 } from "lucide-react"
import { toast } from "sonner"
import { StorageUnitDialog } from "./StorageUnitDialog"
import { CompartmentManager } from "./CompartmentManager"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface StorageManagerDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    resourceId: number
    resourceName: string
}

export function StorageManagerDialog({ open, onOpenChange, resourceId, resourceName }: StorageManagerDialogProps) {
    const [units, setUnits] = useState<StorageUnit[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [activeUnit, setActiveUnit] = useState<StorageUnit | null>(null)
    const [isCreateOpen, setIsCreateOpen] = useState(false)

    const fetchUnits = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/admin/resources/${resourceId}/storage-units`)
            if (res.ok) {
                const json = await res.json()
                setUnits(json.data || [])
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load storage units")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (open && !activeUnit) {
            fetchUnits()
        }
    }, [open, resourceId, activeUnit])

    const [deleteUnitId, setDeleteUnitId] = useState<number | null>(null)

    const handleDeleteUnit = (id: number) => {
        setDeleteUnitId(id)
    }

    const confirmDeleteUnit = async () => {
        if (!deleteUnitId) return
        try {
            const res = await fetch(`/api/admin/storage-units/${deleteUnitId}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Storage unit deleted")
                fetchUnits()
            } else {
                toast.error("Failed to delete unit")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error deleting unit")
        } finally {
            setDeleteUnitId(null)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                {!activeUnit ? (
                    <>
                        <DialogHeader>
                            <DialogTitle>Storage Management: {resourceName}</DialogTitle>
                            <DialogDescription>
                                Manage storage units and compartments for this resource.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="flex justify-end my-4">
                            <Button onClick={() => setIsCreateOpen(true)} size="sm">
                                <Plus className="h-4 w-4 mr-2" /> New Storage Unit
                            </Button>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                            {isLoading ? (
                                <p className="col-span-full text-center py-10">Loading...</p>
                            ) : units.length === 0 ? (
                                <div className="col-span-full text-center py-10 border rounded-lg bg-muted/50">
                                    <Archive className="h-10 w-10 text-muted-foreground mx-auto mb-2" />
                                    <p className="text-muted-foreground">No storage units found.</p>
                                </div>
                            ) : (
                                units.map((unit) => (
                                    <Card key={unit.unitId} className="relative hover:border-primary/50 transition-colors">
                                        <CardHeader>
                                            <div className="flex justify-between items-start gap-2">
                                                <CardTitle className="leading-tight">{unit.name}</CardTitle>
                                                <Button size="icon" variant="ghost" className="h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50 shrink-0" onClick={(e) => { e.stopPropagation(); handleDeleteUnit(unit.unitId) }}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                            <CardDescription>{unit.type}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex justify-between items-center text-sm text-muted-foreground mb-4">
                                                <span>Metadata Count: {unit.totalCompartments}</span>
                                                <Badge variant="secondary">
                                                    {/* We can fetch actual count if relational, but for now relying on provided info or could use _count */}
                                                    {/* If _count was fetched in API */}
                                                    {/* @ts-ignore */}
                                                    {unit._count?.Compartment} Items
                                                </Badge>
                                            </div>
                                            <Button className="w-full flex justify-between group" variant="outline" onClick={() => setActiveUnit(unit)}>
                                                <span>Manage Items</span>
                                                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                            </Button>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>

                        <StorageUnitDialog
                            open={isCreateOpen}
                            onOpenChange={setIsCreateOpen}
                            resourceId={resourceId}
                            onSuccess={fetchUnits}
                        />
                    </>
                ) : (
                    <CompartmentManager
                        unitId={activeUnit.unitId}
                        unitName={activeUnit.name}
                        onBack={() => { setActiveUnit(null); fetchUnits() }} // Refresh unit list count on back
                    />
                )}
            </DialogContent>

            <div onClick={(e) => e.stopPropagation()}>
                <AlertDialog open={!!deleteUnitId} onOpenChange={(open) => !open && setDeleteUnitId(null)}>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete the storage unit
                                and all its compartments.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={confirmDeleteUnit} className="bg-red-600 hover:bg-red-700 pointer-events-auto">
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </Dialog>
    )
}
