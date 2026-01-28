"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { resourceSchema, type ResourceFormValues } from "@/lib/validators/resource.schema"
import { Loader2, Plus, Pencil } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {Form,FormControl,FormDescription,FormField,FormItem,FormLabel,FormMessage} from "@/components/ui/form"
import {Select,SelectContent,SelectItem,SelectTrigger,SelectValue} from "@/components/ui/select"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface CategoryOption { categoryId: number; name: string }
interface BuildingOption { buildingId: number; name: string }

interface ResourceData {
  resourceId: number
  name: string
  description: string | null
  capacity: number | null
  floorNumber: number | null
  roomNumber: string | null
  requiresApproval: boolean
  isAvailable: boolean
  categoryId: number
  buildingId: number
}

interface ResourceDialogProps {
  categories: CategoryOption[]
  buildings: BuildingOption[]
  initialData?: ResourceData | null
}

export function ResourceDialog({ categories, buildings, initialData }: ResourceDialogProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  
  const isEditing = !!initialData

  const form = useForm<ResourceFormValues>({
    resolver: zodResolver(resourceSchema) as any,
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
      capacity: initialData?.capacity || 1,
      floorNumber: initialData?.floorNumber || 0,
      roomNumber: initialData?.roomNumber || "",
      requiresApproval: initialData?.requiresApproval || false,
      isAvailable: initialData?.isAvailable ?? true,
      categoryId: initialData?.categoryId || (undefined as unknown as number),
      buildingId: initialData?.buildingId || (undefined as unknown as number),
    },
  })


  useEffect(() => {
    if (open) {
      if (initialData) {
        form.reset({
          name: initialData.name,
          description: initialData.description || "",
          capacity: initialData.capacity || 1,
          floorNumber: initialData.floorNumber || 0,
          roomNumber: initialData.roomNumber || "",
          requiresApproval: initialData.requiresApproval,
          isAvailable: initialData.isAvailable,
          categoryId: initialData.categoryId,
          buildingId: initialData.buildingId,
        })
      } else {
        form.reset({
          name: "",
          description: "",
          capacity: 1,
          floorNumber: 0,
          roomNumber: "",
          requiresApproval: false,
          isAvailable: true,
          categoryId: undefined,
          buildingId: undefined,
        })
      }
    }
  }, [open, initialData, form])

  async function onSubmit(data: ResourceFormValues) {
    try {
      const url = isEditing 
        ? `/api/admin/resources/${initialData?.resourceId}` 
        : "/api/admin/resources"
      
      const method = isEditing ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!res.ok) {
        const err = await res.text()
        alert(`Error: ${err}`)
        return
      }

      setOpen(false)
      if (!isEditing) form.reset()
      router.refresh()
    } catch (error) {
      console.error(error)
      alert("Something went wrong")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
            <Button variant="outline" size="sm" className="h-9 px-3 bg-background hover:bg-accent">
               <Pencil className="mr-2 h-3.5 w-3.5" /> Edit
            </Button>
        ) : (
            <Button className="gap-2">
               <Plus className="h-4 w-4" /> Add Resource
            </Button>
        )}
      </DialogTrigger>
      
      {/* CHANGED: Added max-w and max-h classes for proper dialog scrolling */}
      <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="mb-4">
          <DialogTitle>{isEditing ? "Edit Resource" : "Add Resource"}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Resource Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. Main Conference Hall" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Category</FormLabel>
                    <Select 
                      onValueChange={(val) => field.onChange(Number(val))} 
                      value={field.value ? String(field.value) : ""}
                    >
                      <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        {categories.map((cat) => (
                           <SelectItem key={cat.categoryId} value={String(cat.categoryId)}>{cat.name}</SelectItem>
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
                  <FormItem className="flex-1">
                    <FormLabel>Building</FormLabel>
                    <Select 
                      onValueChange={(val) => field.onChange(Number(val))} 
                      value={field.value ? String(field.value) : ""}
                    >
                      <FormControl><SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger></FormControl>
                      <SelectContent>
                        {buildings.map((b) => (
                           <SelectItem key={b.buildingId} value={String(b.buildingId)}>{b.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-4">
               <FormField
                 control={form.control}
                 name="floorNumber"
                 render={({ field }) => (
                   <FormItem className="flex-1">
                     <FormLabel>Floor No.</FormLabel>
                     <FormControl>
                        <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                     </FormControl>
                     <FormMessage />
                   </FormItem>
                 )}
               />
               <FormField
                  control={form.control}
                  name="roomNumber"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Room No.</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. 101" {...field} value={field.value || ""} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
               />
            </div>

            <FormField
              control={form.control}
              name="capacity"
              render={({ field }) => (
                <FormItem className="w-full">
                  <FormLabel>Capacity</FormLabel>
                  <FormControl>
                    <Input type="number" {...field} onChange={e => field.onChange(Number(e.target.value))} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 gap-4 pt-2">
                <FormField
                  control={form.control}
                  name="requiresApproval"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Require Approval</FormLabel>
                        <FormDescription className="text-xs">Admins must approve bookings</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isAvailable"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Available for Booking</FormLabel>
                        <FormDescription className="text-xs">Turn off for maintenance</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />
            </div>

            <Button type="submit" className="w-full" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEditing ? "Update Resource" : "Create Resource"}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
} 