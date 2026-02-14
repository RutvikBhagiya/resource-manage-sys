"use client"

import { useEffect, useState } from "react"
import { Compartment } from "@/types/storage"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Edit, Plus, Trash2, User } from "lucide-react"
import { toast } from "sonner"
import { CompartmentDialog } from "./CompartmentDialog"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"

interface CompartmentManagerProps {
    unitId: number
    unitName: string
    onBack: () => void
}

export function CompartmentManager({ unitId, unitName, onBack }: CompartmentManagerProps) {
    const [compartments, setCompartments] = useState<Compartment[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedCompartment, setSelectedCompartment] = useState<Compartment | null>(null)

    const fetchCompartments = async () => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/admin/storage-units/${unitId}/compartments`)
            if (res.ok) {
                const json = await res.json()
                setCompartments(json.data || [])
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load compartments")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchCompartments()
    }, [unitId])

    const handleDelete = async (id: number) => {
        if (!confirm("Are you sure you want to delete this compartment?")) return
        try {
            const res = await fetch(`/api/admin/compartments/${id}`, { method: "DELETE" })
            if (res.ok) {
                toast.success("Compartment deleted")
                fetchCompartments()
            } else {
                toast.error("Failed to delete")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error deleting compartment")
        }
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <h3 className="text-lg font-medium">Compartments</h3>
                        <p className="text-sm text-muted-foreground">Managing {unitName}</p>
                    </div>
                </div>
                <Button onClick={() => { setSelectedCompartment(null); setIsDialogOpen(true) }} size="sm">
                    <Plus className="h-4 w-4 mr-2" /> Add Compartment
                </Button>
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Number</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Capacity</TableHead>
                            <TableHead>Assigned To</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24">Loading...</TableCell>
                            </TableRow>
                        ) : compartments.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                    No compartments found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            compartments.map((comp) => (
                                <TableRow key={comp.compartmentId}>
                                    <TableCell className="font-medium">{comp.compartmentNumber}</TableCell>
                                    <TableCell>
                                        <Badge variant={comp.isAvailable ? "outline" : "secondary"}>
                                            {comp.isAvailable ? "Available" : "In Use"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>{comp.capacity || "-"}</TableCell>
                                    <TableCell>
                                        {comp.User ? (
                                            <div className="flex items-center gap-2">
                                                <User className="h-3 w-3 text-muted-foreground" />
                                                <span className="text-sm">{comp.User.name}</span>
                                            </div>
                                        ) : "-"}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <div className="flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => { setSelectedCompartment(comp); setIsDialogOpen(true) }}>
                                                <Edit className="h-4 w-4" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(comp.compartmentId)}>
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            <CompartmentDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                unitId={unitId}
                compartment={selectedCompartment}
                onSuccess={fetchCompartments}
            />
        </div>
    )
}
