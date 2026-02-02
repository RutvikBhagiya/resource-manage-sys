"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, Trash2 } from "lucide-react"
import { ResourceAmenity } from "@/types/resource-amenity"
import { AmenityDialog } from "./AmenityDialog"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface AmenityManagerDialogProps {
    resourceId: number
    resourceName: string
    open: boolean
    onOpenChange: (open: boolean) => void
}

export function AmenityManagerDialog({ resourceId, resourceName, open, onOpenChange }: AmenityManagerDialogProps) {
    const [amenities, setAmenities] = useState<ResourceAmenity[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isAddOpen, setIsAddOpen] = useState(false)
    const [deleteId, setDeleteId] = useState<number | null>(null)

    const fetchAmenities = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/admin/resource-amenities?resourceId=${resourceId}`)
            if (res.ok) {
                const data = await res.json()
                setAmenities(data)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load amenities")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (open) {
            fetchAmenities()
        }
    }, [open, resourceId])

    const handleCreate = () => {
        setIsAddOpen(true)
    }

    const handleDelete = (id: number) => {
        setDeleteId(id)
    }

    const confirmDelete = async () => {
        if (!deleteId) return

        try {
            const res = await fetch(`/api/admin/resource-amenities/${deleteId}`, {
                method: "DELETE",
            })

            if (!res.ok) {
                throw new Error("Failed to delete amenity")
            }

            toast.success("Amenity deleted successfully")
            fetchAmenities()
        } catch (error) {
            console.error(error)
            toast.error("Failed to delete amenity")
        } finally {
            setDeleteId(null)
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>{resourceName} - Amenities</span>
                            <Button size="sm" onClick={handleCreate}>
                                <Plus className="mr-2 h-4 w-4" /> Add Amenity
                            </Button>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 overflow-y-auto p-1">
                        {isLoading ? (
                            <div className="text-center py-8">Loading...</div>
                        ) : (
                            <div className="rounded-md border">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Quantity</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-[100px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {amenities.length > 0 ? (
                                            amenities.map((amenity) => (
                                                <TableRow key={amenity.amenityId}>
                                                    <TableCell className="font-medium">{amenity.name}</TableCell>
                                                    <TableCell>{amenity.type}</TableCell>
                                                    <TableCell>{amenity.quantity || "-"}</TableCell>
                                                    <TableCell>
                                                        <Badge variant={amenity.isWorking ? "default" : "destructive"}>
                                                            {amenity.isWorking ? "Working" : "Not Working"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                            onClick={() => handleDelete(amenity.amenityId)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                            <span className="sr-only">Delete</span>
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={5} className="h-24 text-center">
                                                    No amenities found for this resource.
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            <AmenityDialog
                open={isAddOpen}
                onOpenChange={setIsAddOpen}
                resourceId={resourceId}
                onSuccess={fetchAmenities}
            />

            <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Amenity</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this amenity? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    )
}
