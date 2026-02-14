"use client"

import { useState, useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { toast } from "sonner"
import { Loader2, Trash2, Plus, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"

const formSchema = z.object({
    dayOfWeek: z.enum(["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format (HH:mm)"),
}).refine((data) => {
    const [startH, startM] = data.startTime.split(':').map(Number)
    const [endH, endM] = data.endTime.split(':').map(Number)
    return (startH * 60 + startM) < (endH * 60 + endM)
}, {
    message: "End time must be after start time",
    path: ["endTime"],
})

type Availability = {
    availabilityId: number
    dayOfWeek: string
    startTime: string
    endTime: string
    isAvailable: boolean
}

interface ResourceAvailabilityManagerProps {
    resourceId: number
}

export function ResourceAvailabilityManager({ resourceId }: ResourceAvailabilityManagerProps) {
    const [availabilities, setAvailabilities] = useState<Availability[]>([])
    const [loading, setLoading] = useState(false)
    const [adding, setAdding] = useState(false)

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            dayOfWeek: "MONDAY",
            startTime: "09:00",
            endTime: "17:00",
        }
    })

    const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]

    const fetchAvailability = async () => {
        setLoading(true)
        try {
            const res = await fetch(`/api/admin/resources/${resourceId}/availability`)
            if (res.ok) {
                const data = await res.json()
                setAvailabilities(data)
            }
        } catch (error) {
            toast.error("Failed to fetch availability")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (resourceId) {
            fetchAvailability()
        }
    }, [resourceId])

    const onSubmit = async (values: z.infer<typeof formSchema>) => {
        setAdding(true)
        try {
            const res = await fetch(`/api/admin/resources/${resourceId}/availability`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values)
            })

            if (!res.ok) {
                const error = await res.text()
                throw new Error(error || "Failed to add availability")
            }

            toast.success("Availability rule added")
            fetchAvailability()
            form.reset({
                dayOfWeek: values.dayOfWeek, // Keep same day for convenience
                startTime: "09:00",
                endTime: "17:00",
            })
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message)
            } else {
                toast.error("Failed to add availability rule")
            }
        } finally {
            setAdding(false)
        }
    }

    const handleDelete = async (id: number) => {
        try {
            const res = await fetch(`/api/admin/resources/${resourceId}/availability/${id}`, {
                method: "DELETE"
            })
            if (!res.ok) throw new Error("Failed to delete")

            toast.success("Availability rule removed")
            fetchAvailability()
        } catch (error) {
            toast.error("Failed to delete availability")
        }
    }

    const formatTime = (isoString: string) => {
        try {
            const d = new Date(isoString)
            const hours = d.getUTCHours()
            const minutes = d.getUTCMinutes()
            const ampm = hours >= 12 ? 'PM' : 'AM'
            const fHours = hours % 12 || 12
            const fMinutes = minutes < 10 ? '0' + minutes : minutes
            return `${fHours}:${fMinutes} ${ampm}`
        } catch (e) {
            return isoString
        }
    }

    return (
        <div className="space-y-6">
            <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Plus className="h-4 w-4" /> Add Availability Rule
                </h3>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="dayOfWeek"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Day</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select day" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {days.map(day => (
                                                    <SelectItem key={day} value={day}>{day.charAt(0) + day.slice(1).toLowerCase()}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="endTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <Button type="submit" disabled={adding} className="w-full md:w-auto">
                            {adding ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Plus className="mr-2 h-4 w-4" />}
                            Add Rule
                        </Button>
                    </form>
                </Form>
            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Current Availability
                </h3>
                {loading ? (
                    <div className="flex justify-center p-8"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
                ) : availabilities.length === 0 ? (
                    <div className="text-center p-8 border border-dashed rounded-lg text-muted-foreground">
                        No availability rules set. Resource is assumed to be unavailable or fully available depending on default logic.
                    </div>
                ) : (
                    <div className="grid gap-2">
                        {availabilities.map((item) => (
                            <div key={item.availabilityId} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors group">
                                <div className="flex items-center gap-4">
                                    <Badge variant="outline" className="w-24 justify-center bg-background/50">
                                        {item.dayOfWeek.charAt(0) + item.dayOfWeek.slice(1).toLowerCase()}
                                    </Badge>
                                    <div className="flex items-center gap-2 text-sm font-medium">
                                        <span>{formatTime(item.startTime)}</span>
                                        <span className="text-muted-foreground">→</span>
                                        <span>{formatTime(item.endTime)}</span>
                                    </div>
                                </div>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-all"
                                    onClick={() => handleDelete(item.availabilityId)}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
