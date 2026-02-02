"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Plus, Edit, Trash2 } from "lucide-react"
import { ResourceCategory } from "@/types/resource-category"
import { CategoryDialog } from "./CategoryDialog"
import { toast } from "sonner"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

export function CategoryManagerDialog() {
    const [open, setOpen] = useState(false)
    const [categories, setCategories] = useState<ResourceCategory[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [isEditOpen, setIsEditOpen] = useState(false)
    const [selectedCategory, setSelectedCategory] = useState<ResourceCategory | null>(null)
    const [deleteId, setDeleteId] = useState<number | null>(null)

    const fetchCategories = async () => {
        setIsLoading(true)
        try {
            const res = await fetch("/api/admin/resource-categories")
            if (res.ok) {
                const data = await res.json()
                setCategories(data)
            }
        } catch (error) {
            console.error(error)
            toast.error("Failed to load categories")
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (open) {
            fetchCategories()
        }
    }, [open])

    const handleCreate = () => {
        setSelectedCategory(null)
        setIsEditOpen(true)
    }

    const handleEdit = (category: ResourceCategory) => {
        setSelectedCategory(category)
        setIsEditOpen(true)
    }

    const handleDelete = (id: number) => {
        setDeleteId(id)
    }

    const confirmDelete = async () => {
        if (!deleteId) return

        try {
            const res = await fetch(`/api/admin/resource-categories/${deleteId}`, {
                method: "DELETE",
            })

            if (!res.ok) {
                throw new Error("Failed to delete category")
            }

            toast.success("Category deleted successfully")
            fetchCategories()
        } catch (error) {
            console.error(error)
            toast.error("Failed to delete category")
        } finally {
            setDeleteId(null)
        }
    }

    return (
        <>
            <Dialog open={open} onOpenChange={setOpen}>
                <DialogTrigger asChild>
                    <Button variant="outline">Manage Categories</Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col">
                    <DialogHeader>
                        <DialogTitle className="flex items-center justify-between">
                            <span>Resource Categories</span>
                            <Button size="sm" onClick={handleCreate}>
                                <Plus className="mr-2 h-4 w-4" /> Add Category
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
                                            <TableHead>Description</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="w-[100px]">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {categories.length > 0 ? (
                                            categories.map((category) => (
                                                <TableRow key={category.categoryId}>
                                                    <TableCell className="font-medium">{category.name}</TableCell>
                                                    <TableCell className="max-w-[300px] truncate" title={category.description || ""}>
                                                        {category.description || "-"}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Badge variant={category.isActive ? "default" : "secondary"}>
                                                            {category.isActive ? "Active" : "Inactive"}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex items-center gap-2">
                                                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(category)}>
                                                                <Edit className="h-4 w-4" />
                                                                <span className="sr-only">Edit</span>
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                                onClick={() => handleDelete(category.categoryId)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                                <span className="sr-only">Delete</span>
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={4} className="h-24 text-center">
                                                    No categories found.
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

            <CategoryDialog
                open={isEditOpen}
                onOpenChange={setIsEditOpen}
                category={selectedCategory}
                onSuccess={fetchCategories}
            />

            <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Category</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this category? This action cannot be undone.
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
