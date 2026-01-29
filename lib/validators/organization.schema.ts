import { z } from "zod"
import { OrganizationType } from "@/generated/prisma/enums"

export const organizationCreateSchema = z.object({
    name: z.string({ error: "Name is required" })
        .min(3, { error: "Name must be at least 3 characters" })
        .max(200, { error: "Name must be less than 200 characters" }),

    type: z.enum(OrganizationType,{error: "Organization type must be required"}),
    email: z.string().optional(),
    phone: z.string().max(20).optional(),
    address: z.string().optional()
});

export const organizationUpdateSchema = z.object({
    name: z.string({ error: "Name is required" })   
        .min(3, { error: "Name must be at least 3 characters" })
        .max(200, { error: "Name must be less than 200 characters" }),

    // type: z.enum(OrganizationType,{error: "Organization type must be required"}),
    type: z.enum(OrganizationType).optional(),
    email: z.string().optional().or(z.literal("")),
    phone: z.string().max(20).optional().or(z.literal("")),
    address: z.string().optional().or(z.literal("")),
    isActive: z.boolean().optional()
})