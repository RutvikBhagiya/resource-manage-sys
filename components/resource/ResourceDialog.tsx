"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Resource } from "@/types/resource"
import { ResourceCategory } from "@/types/resource-category"
import { Building } from "@/types/building"


const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    categoryId: z.string().min(1, "Category is required"),
    buildingId: z.string().min(1, "Building is required"),

    floorNumber: z.string().optional(),
    roomNumber: z.string().optional(),
    capacity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Capacity must be positive"),
    description: z.string().optional(),
    requiresApproval: z.boolean(),
    isAvailable: z.boolean(),
})

interface ResourceFormValues {
    name: string
    categoryId: string
    buildingId: string
    floorNumber?: string
    roomNumber?: string
    capacity: string
    description?: string
    requiresApproval: boolean
    isAvailable: boolean
}

interface ResourceDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    resource?: Resource | null
    onSuccess: () => void
}

export function ResourceDialog({ open, onOpenChange, resource, onSuccess }: ResourceDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [categories, setCategories] = useState<ResourceCategory[]>([])
    const [buildings, setBuildings] = useState<Building[]>([])

    const form = useForm<ResourceFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            categoryId: "",
            buildingId: "",
            floorNumber: "0",
            roomNumber: "",
            capacity: "1",
            description: "",
            requiresApproval: false,
            isAvailable: true,
        },
    })

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [catsRes, bldsRes] = await Promise.all([
                    fetch("/api/admin/resource-categories"),
                    fetch("/api/admin/buildings")
                ])

                if (catsRes.ok) {
                    setCategories(await catsRes.json())
                }
                if (bldsRes.ok) {
                    setBuildings(await bldsRes.json())
                }
            } catch (error) {
                console.error("Failed to load options", error)
            }
        }
        if (open) fetchData()
    }, [open])

    useEffect(() => {
        if (open) {
            if (resource) {
                form.reset({
                    name: resource.name,
                    categoryId: resource.categoryId.toString(),
                    buildingId: resource.buildingId.toString(),
                    floorNumber: resource.floorNumber?.toString() || "0",
                    roomNumber: resource.roomNumber || "",
                    capacity: resource.capacity?.toString() || "1",
                    description: resource.description || "",
                    requiresApproval: resource.requiresApproval,
                    isAvailable: resource.isAvailable,
                })
            } else {
                form.reset({
                    name: "",
                    categoryId: "",
                    buildingId: "",
                    floorNumber: "0",
                    roomNumber: "",
                    capacity: "1",
                    description: "",
                    requiresApproval: false,
                    isAvailable: true,
                })
            }
        }
    }, [open, resource, form])

    async function onSubmit(data: ResourceFormValues) {
        setIsLoading(true)
        try {
            const url = resource
                ? `/api/admin/resources/${resource.resourceId}`
                : "/api/admin/resources"

            const method = resource ? "PATCH" : "POST"

            // Convert string IDs back to number
            const body = {
                ...data,
                categoryId: Number(data.categoryId),
                buildingId: Number(data.buildingId),
                capacity: Number(data.capacity),
                floorNumber: data.floorNumber ? Number(data.floorNumber) : undefined
            }

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })

            if (!res.ok) {
                throw new Error("Failed to save resource")
            }

            toast.success(`Resource ${resource ? "updated" : "created"} successfully`)
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            toast.error("Something went wrong")
            console.error(error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl">
                <DialogHeader>
                    <DialogTitle>{resource ? "Edit Resource" : "Add Resource"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Resource Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Conference Room A" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="capacity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Capacity</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="categoryId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Category" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {categories.map(cat => (
                                                    <SelectItem key={cat.categoryId} value={cat.categoryId.toString()}>
                                                        {cat.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="buildingId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Building</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Building" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {buildings.map(bld => (
                                                    <SelectItem key={bld.buildingId} value={bld.buildingId.toString()}>
                                                        {bld.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="floorNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Floor Number</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="roomNumber"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Room Number</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. 101" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Description..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="requiresApproval"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Approval Required</FormLabel>
                                            <div className="text-xs text-muted-foreground">Admin approval for booking</div>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="isAvailable"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                        <div className="space-y-0.5">
                                            <FormLabel className="text-base">Access Status</FormLabel>
                                            <div className="text-xs text-muted-foreground">Available for booking</div>
                                        </div>
                                        <FormControl>
                                            <Switch
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                            />
                                        </FormControl>
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isLoading}>
                                {isLoading ? "Saving..." : "Save"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
