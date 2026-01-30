import { z } from "zod"
import { Role } from "@/generated/prisma/enums"

export const userCreateSchema = z.object({
  name: z.string({ error: "Name is required" })
    .min(3, { error: "Name must be at least 3 characters" })
    .max(100, { error: "Name must be less than 100 characters" }),

  email: z.string({ error: "Email is required" })
    .email({ error: "Invalid email address" }),

  password: z.string({ error: "Password is required" })
    .min(6, { error: "Password must be at least 6 characters" }),

  role: z.enum(Role, { error: "Role is required" }),

  organizationId: z.number().optional().nullable(),

  // Optional details
  phone: z.string().max(20).optional().nullable(),
  image: z.string().url().optional().nullable(),
});

export const userUpdateSchema = z.object({
  name: z.string().min(3).max(100).optional(),
  email: z.string().email().optional(),
  password: z.string().min(6).optional().or(z.literal("")), // Optional password update
  role: z.enum(Role).optional(),
  organizationId: z.number().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  image: z.string().url().optional().nullable(),
  isActive: z.boolean().optional(),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters")
});