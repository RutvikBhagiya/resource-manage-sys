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
import { toast } from "sonner"
import { Department } from "@/types/department"
import { Switch } from "@/components/ui/switch"

const formSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters"),
    isActive: z.boolean(),
})

type DepartmentFormValues = z.infer<typeof formSchema>

interface User {
    id: number
    name: string
}

interface DepartmentDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    department?: Department | null
    onSuccess: () => void
}

export function DepartmentDialog({ open, onOpenChange, department, onSuccess }: DepartmentDialogProps) {
    const [isLoading, setIsLoading] = useState(false)

    const form = useForm<DepartmentFormValues>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: "",
            isActive: true,
        },
    })

    useEffect(() => {
        if (open) {
            if (department) {
                form.reset({
                    name: department.name,
                    isActive: department.isActive,
                })
            } else {
                form.reset({
                    name: "",
                    isActive: true,
                })
            }
        }
    }, [open, department, form])

    async function onSubmit(data: DepartmentFormValues) {
        setIsLoading(true)
        try {
            const url = department
                ? `/api/admin/departments/${department.departmentId}`
                : "/api/admin/departments"

            const method = department ? "PATCH" : "POST"

            const body = {
                name: data.name,
                isActive: data.isActive,
            }

            const res = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
            })

            if (!res.ok) {
                throw new Error("Failed to save department")
            }

            toast.success(`Department ${department ? "updated" : "created"} successfully`)
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
                    <DialogTitle>{department ? "Edit Department" : "Add Department"}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Department Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Engineering" {...field} />
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
                                            Enable or disable this department
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
