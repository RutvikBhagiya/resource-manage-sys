"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { storageUnitCreateSchema } from "@/lib/validators/storage.schema"
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
import { toast } from "sonner"
import { StorageUnit } from "@/types/storage"

interface StorageUnitDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    resourceId: number
    onSuccess: () => void
}

export function StorageUnitDialog({ open, onOpenChange, resourceId, onSuccess }: StorageUnitDialogProps) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm({
        defaultValues: {
            name: "",
            type: "Shelf",
            totalCompartments: 0
        }
    })

    const onSubmit = async (values: any) => {
        setIsLoading(true)
        try {
            const res = await fetch(`/api/admin/resources/${resourceId}/storage-units`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
            })

            if (!res.ok) throw new Error("Failed to create storage unit")

            toast.success("Storage unit created successfully")
            form.reset()
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
                    <DialogTitle>Add Storage Unit</DialogTitle>
                    <DialogDescription>
                        Create a new storage unit (e.g., Cabinet, Shelf) for this resource.
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="Cabinet A" {...field} />
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
                                        <Input placeholder="Shelf, Locker, Box..." {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="totalCompartments"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Total Compartments (Info only)</FormLabel>
                                    <FormControl>
                                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
                            <Button type="submit" disabled={isLoading}>{isLoading ? "Creating..." : "Create"}</Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
