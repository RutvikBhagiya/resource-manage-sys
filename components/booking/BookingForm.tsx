"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { CalendarIcon, Loader2, AlertCircle } from "lucide-react"
import { bookingCreateSchema, type BookingCreateInput, type BookingCreateFormValues } from "@/lib/validators/booking.schema"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage, } from "@/components/ui/form"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, } from "@/components/ui/select"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ResourceOption {
  resourceId: number
  name: string
  roomNumber: string | null
  requiresApproval: boolean
}

interface BookingFormProps {
  resources: ResourceOption[]
  userId: number
}

export function BookingForm({ resources, userId }: BookingFormProps) {
  const router = useRouter()
  const [serverError, setServerError] = useState<string | null>(null)

  const defaultResId = resources.length === 1 ? resources[0].resourceId : undefined

  const form = useForm<BookingCreateFormValues>({
    resolver: zodResolver(bookingCreateSchema),
    defaultValues: {
      resourceId: defaultResId,
      title: "",
      purpose: "",
      attendeesCount: 0,
    }
  })

  async function onSubmit(data: BookingCreateFormValues) {
    setServerError(null)

    try {

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      const result = await res.json()

      if (!res.ok || !result.success) {
        setServerError(result.message || "Failed to create booking")
        return
      }

      router.push("/user/bookings")
      router.refresh()
    } catch (error) {
      setServerError("Something went wrong. Please check your connection.")
    }
  }

  const selectedResourceId = form.watch("resourceId")
  const selectedResource = resources.find((r) => r.resourceId === selectedResourceId)

  return (
    <div className="max-w-2xl mx-auto">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

          {serverError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          )}

          <FormField
            control={form.control}
            name="resourceId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Select Resource</FormLabel>
                <Select
                  onValueChange={(val) => field.onChange(Number(val))}
                  defaultValue={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Choose a room or equipment" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {resources.map((res) => (
                      <SelectItem key={res.resourceId} value={res.resourceId.toString()}>
                        {res.name} {res.roomNumber && `(${res.roomNumber})`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedResource?.requiresApproval && (
                  <FormDescription className="text-amber-600 font-medium">
                  </FormDescription>
                )}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Event Title</FormLabel>
                <FormControl>
                  <Input placeholder="e.g., Weekly Team Sync" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="startDateTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Time</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value instanceof Date ? (() => {
                        const d = field.value;
                        const pad = (n: number) => n < 10 ? '0' + n : n;
                        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                      })() : ""}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        if (!isNaN(date.getTime())) {
                          field.onChange(date);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="endDateTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Time</FormLabel>
                  <FormControl>
                    <Input
                      type="datetime-local"
                      {...field}
                      value={field.value instanceof Date ? (() => {
                        const d = field.value;
                        const pad = (n: number) => n < 10 ? '0' + n : n;
                        return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
                      })() : ""}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        if (!isNaN(date.getTime())) {
                          field.onChange(date);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="purpose"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Purpose / Notes (Optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Briefly describe why you need this resource..."
                    className="resize-none"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting Request...
              </>
            ) : (
              "Submit Request"
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}