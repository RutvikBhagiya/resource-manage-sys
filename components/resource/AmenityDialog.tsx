"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Resource } from "@/types/resource"

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    type: z.string().min(2, "Type is required"),
    quantity: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Quantity must be positive"),
    isWorking: z.boolean(),
    resourceId: z.string().min(1, "Resource is required"),
})

interface AmenityFormValues {
    name: string
    type: string
    quantity: string
    isWorking: boolean
    resourceId: string
}

interface AmenityDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    resourceId?: number
    onSuccess: () => void
}

export function AmenityDialog({ open, onOpenChange, resourceId, onSuccess }: AmenityDialogProps) {
    const [isLoading, setIsLoading] = useState(false)
    const [resources, setResources] = useState<Resource[]>([])

    const form = useForm<AmenityFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            type: "",
            quantity: "1",
            isWorking: true,
            resourceId: resourceId ? resourceId.toString() : "",
        },
    })

    useEffect(() => {
        if (resourceId) {
            form.setValue("resourceId", resourceId.toString())
        }
    }, [resourceId, form])

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const res = await fetch("/api/admin/resources")
                if (res.ok) {
                    const data = await res.json()
                    setResources(data)
                }
            } catch (error) {
                console.error("Failed to load resources", error)
            }
        }
        if (open && !resourceId) {
            fetchResources()
        }
    }, [open, resourceId])

    useEffect(() => {
        if (open) {
            form.reset({
                name: "",
                type: "",
                quantity: "1",
                isWorking: true,
                resourceId: resourceId ? resourceId.toString() : "",
            })
        }
    }, [open, resourceId, form])

    async function onSubmit(data: AmenityFormValues) {
        setIsLoading(true)
        try {
            const url = "/api/admin/resource-amenities"
            const method = "POST"

            const body = {
                ...data,
                quantity: Number(data.quantity),
                resourceId: Number(data.resourceId)
            }

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })

            if (!res.ok) {
                throw new Error("Failed to save amenity")
            }

            toast.success("Amenity created successfully")
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
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Add Amenity</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        {!resourceId && (
                            <FormField
                                control={form.control}
                                name="resourceId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Resource</FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            defaultValue={field.value}
                                            value={field.value}
                                        >
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a resource" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {resources.map((resource) => (
                                                    <SelectItem key={resource.resourceId} value={resource.resourceId.toString()}>
                                                        {resource.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        )}

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Amenity Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Projector" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Type</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Electrical" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isWorking"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Working Status</FormLabel>
                                        <div className="text-sm text-muted-foreground">
                                            Is this amenity currently functional?
                                        </div>
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
