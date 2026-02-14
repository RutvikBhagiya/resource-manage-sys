"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { compartmentCreateSchema, compartmentUpdateSchema } from "@/lib/validators/storage.schema"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Compartment } from "@/types/storage"
import { UserSelect } from "./UserSelect"

interface CompartmentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    unitId: number
    compartment?: Compartment | null
    onSuccess: () => void
}

export function CompartmentDialog({ open, onOpenChange, unitId, compartment, onSuccess }: CompartmentDialogProps) {
    const isEditing = !!compartment
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm({
        defaultValues: {
            compartmentNumber: compartment?.compartmentNumber || "",
            capacity: compartment?.capacity || 0,
            description: compartment?.description || "",
            isAvailable: compartment?.isAvailable ?? true,
            assignedTo: compartment?.assignedTo || null
        }
    })

    // Reset form when dialog opens/closes or compartment changes
    useEffect(() => {
        if (open) {
            form.reset({
                compartmentNumber: compartment?.compartmentNumber || "",
                capacity: compartment?.capacity || 0,
                description: compartment?.description || "",
                isAvailable: compartment?.isAvailable ?? true,
                assignedTo: compartment?.assignedTo || undefined
            })
        }
    }, [open, compartment, form])

    const onSubmit = async (values: any) => {
        setIsLoading(true)
        try {
            const url = isEditing
                ? `/api/admin/compartments/${compartment.compartmentId}`
                : `/api/admin/storage-units/${unitId}/compartments`

            const method = isEditing ? "PATCH" : "POST"

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })

            if (!res.ok) throw new Error("Failed to save compartment")

            toast.success(`Compartment ${isEditing ? "updated" : "created"} successfully`)
            onSuccess()
            onOpenChange(false)
        } catch (error) {
            console.error(error)
            toast.error("Something went wrong")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>{isEditing ? "Edit Compartment" : "Add Compartment"}</DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Update compartment details." : "Create a new compartment for this unit."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="compartmentNumber"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Compartment Number</FormLabel>
                                    <FormControl>
                                        <Input placeholder="A-101" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="capacity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Capacity</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="isAvailable"
                                render={({ field }) => (
                                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm mt-6">
                                        <div className="space-y-0.5">
                                            <FormLabel>Available</FormLabel>
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

                        <FormField
                            control={form.control}
                            name="assignedTo"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assigned To</FormLabel>
                                    <FormControl>
                                        <UserSelect
                                            value={field.value}
                                            onChange={(val) => field.onChange(val)}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Details about this compartment..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={isLoading}>{isLoading ? "Saving..." : "Save"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
