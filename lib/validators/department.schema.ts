import { z } from "zod"

export const departmentCreateSchema = z.object({
  name: z.string().min(2),
  organizationId: z.number().int().positive().optional(),
  headUserId: z.number().int().positive().optional(),
  isActive: z.boolean().optional()
})

export const departmentUpdateSchema = departmentCreateSchema
.partial()
.refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
})