import { z } from "zod"

export const resourceCreateSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2),
  categoryId: z.number().int(),
  buildingId: z.number().int(),
  floorNumber: z.number().int().optional(),
  roomNumber: z.string().optional(),
  capacity: z.number().int().positive().optional(),
  description: z.string().optional(),
  requiresApproval: z.boolean().optional(),
  isAvailable: z.boolean().optional()
})

export const resourceUpdateSchema = resourceCreateSchema
.partial()
.refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
})