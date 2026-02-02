"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import { Building } from "@/types/building"

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    totalFloors: z.string().refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Must be a positive number"),
    isActive: z.boolean(),
})

interface BuildingFormValues {
    name: string
    totalFloors: string
    isActive: boolean
}

interface BuildingDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    building?: Building | null
    onSuccess: () => void
}

export function BuildingDialog({ open, onOpenChange, building, onSuccess }: BuildingDialogProps) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<BuildingFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            totalFloors: "1",
            isActive: true,
        },
    })

    useEffect(() => {
        if (open) {
            if (building) {
                form.reset({
                    name: building.name,
                    totalFloors: building.totalFloors?.toString() || "1",
                    isActive: building.isActive,
                })
            } else {
                form.reset({
                    name: "",
                    totalFloors: "1",
                    isActive: true,
                })
            }
        }
    }, [open, building, form])

    async function onSubmit(data: BuildingFormValues) {
        setIsLoading(true)
        try {
            const url = building
                ? `/api/admin/buildings/${building.buildingId}`
                : "/api/admin/buildings"

            const method = building ? "PATCH" : "POST"

            const body = {
                ...data,
                totalFloors: Number(data.totalFloors)
            }

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })

            if (!res.ok) {
                throw new Error("Failed to save building")
            }

            toast.success(`Building ${building ? "updated" : "created"} successfully`)
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
                    <DialogTitle>{building ? "Edit Building" : "Add Building"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Building Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Main Block" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="totalFloors"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total Floors</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="isActive"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">Active Status</FormLabel>
                                        <div className="text-sm text-muted-foreground">
                                            Enable or disable this building
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
