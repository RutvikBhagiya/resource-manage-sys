import {z} from "zod"

export const resourceCategoryCreateSchema = z.object({
    name: z.string().min(2),
    description: z.string().optional(),
    icon: z.string().optional(),
    isActive: z.boolean().optional()
})

export const resourceCategoryUpdateSchema = resourceCategoryCreateSchema
.partial()
.refine(data => Object.keys(data).length > 0, {
    message: "At least one field must be provided",
})