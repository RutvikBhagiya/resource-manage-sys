"use client"

import { useState, useEffect } from "react"
import { DepartmentCard } from "./DepartmentCard"
import { DepartmentDialog } from "./DepartmentDialog"
import { Button } from "@/components/ui/button"
import { Plus, Loader2 } from "lucide-react"
import { toast } from "sonner"
import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"
import { Department } from "@/types/department"

interface DepartmentGridProps {
    initialData?: Department[]
}

export function DepartmentGrid({ initialData }: DepartmentGridProps) {
    const [departments, setDepartments] = useState<Department[]>(initialData || [])
    const [isLoading, setIsLoading] = useState(!initialData)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isDialogOpen, setIsDialogOpen] = useState(false)
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null)
    const [deleteId, setDeleteId] = useState<number | null>(null)

    const fetchDepartments = async () => {
        try {
            const res = await fetch("/api/admin/departments")
            if (res.ok) {
                const data = await res.json()
                setDepartments(data)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load departments")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (!initialData) {
            fetchDepartments()
        }
    }, [initialData])

    const handleCreate = () => {
        setSelectedDepartment(null)
        setIsDialogOpen(true)
    }

    const handleEdit = (dept: Department) => {
        setSelectedDepartment(dept)
        setIsDialogOpen(true)
    }

    const handleDeleteClick = (id: number) => {
        setDeleteId(id)
    }

    const confirmDelete = async () => {
        if (!deleteId) return
        setIsDeleting(true)
        try {
            const res = await fetch(`/api/admin/departments/${deleteId}`, {
                method: "DELETE",
            })
            if (res.ok) {
                toast.success("Department active status updated")
                setDeleteId(null)
                fetchDepartments()
            } else {
                toast.error("Failed to update department status")
            }
        } catch (error) {
            console.error(error)
            toast.error("Error updating department status")
        } finally {
            setIsDeleting(false)
        }
    }

    if (isLoading) {
        return <div className="p-4 text-center">Loading departments...</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold tracking-tight">Departments</h2>
                <Button onClick={handleCreate}>
                    <Plus className="mr-2 h-4 w-4" /> Add Department
                </Button>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {departments.map((dept) => (
                    <DepartmentCard
                        key={dept.departmentId}
                        department={dept}
                        onEdit={handleEdit}
                        onDelete={handleDeleteClick}
                    />
                ))}
            </div>

            {departments.length === 0 && (
                <div className="text-center py-12 border rounded-lg bg-slate-50 dark:bg-slate-900/50">
                    <p className="text-muted-foreground">No departments found. Create one to get started.</p>
                </div>
            )}

            <DepartmentDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                department={selectedDepartment}
                onSuccess={fetchDepartments}
            />

            <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                            This will deactivate the department. You can reactivate it later if needed.
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
