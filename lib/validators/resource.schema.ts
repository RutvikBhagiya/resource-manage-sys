import { z } from "zod"

export const resourceSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  categoryId: z.number({ error: "Category is required" }).min(1),
  buildingId: z.number({ error: "Building is required" }).min(1),
  floorNumber: z.number().optional(),
  roomNumber: z.string().optional(),
  capacity: z.number({ error: "Capacity is required" }).min(1),
  description: z.string().optional(),
  requiresApproval: z.boolean().default(false),
  isAvailable: z.boolean().default(true)
})

export const resourceUpdateSchema = resourceSchema.partial()
export type ResourceFormValues = z.infer<typeof resourceSchema>