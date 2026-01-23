import { z } from "zod"

export const buildingCreateSchema = z.object({
  name: z.string().min(2),
  organizationId: z.number().int().positive().optional(),
  code: z.string().optional(),
  address: z.string().optional(),
  totalFloors: z.number().int().positive().optional(),
  isActive: z.boolean().optional()
})

export const buildingUpdateSchema = buildingCreateSchema
.partial()
.refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
})