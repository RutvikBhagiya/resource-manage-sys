import { z } from "zod"

export const resourceAmenityCreateSchema = z.object({
    resourceId: z.number({ error: "Resource is required" }).min(1),
    name: z.string().min(2, "Name must be at least 2 characters"),
    type: z.string().min(2, "Type is required"),
    quantity: z.number().int().positive().optional(),
    isWorking: z.boolean().optional().default(true)
})
