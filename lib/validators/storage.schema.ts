import { z } from "zod"

export const storageUnitCreateSchema = z.object({
    resourceId: z.number().int().positive(),
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    type: z.string().min(2, "Type is required").max(100),
    totalCompartments: z.number().int().min(0).default(0),
})

export const compartmentCreateSchema = z.object({
    unitId: z.number().int().positive(),
    compartmentNumber: z.string().min(1, "Compartment Number is required").max(50),
    capacity: z.number().int().min(0).optional().nullable(),
    description: z.string().max(500).optional().nullable(),
    isAvailable: z.boolean().default(true),
})

export const compartmentUpdateSchema = z.object({
    compartmentNumber: z.string().min(1).max(50).optional(),
    capacity: z.number().int().min(0).optional().nullable(),
    isAvailable: z.boolean().optional(),
    assignedTo: z.number().int().optional().nullable(),
    description: z.string().max(500).optional().nullable(),
})
