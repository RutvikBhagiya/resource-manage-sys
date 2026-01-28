import { z } from "zod"
import { Role } from "@/generated/prisma/enums"

export const userCreateSchema = z.object({
  name: z.string().min(2),
  email: z.email(),
  password: z.string().min(8, "Password must be at least 8 characters"),
  phone: z.string().max(20).optional(),
  departmentId: z.number().int().optional(),
  role: z.enum(Role),
  organizationId: z.number().int()
})

export const userUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  phone: z.string().max(20).optional(),
  departmentId: z.number().int().nullable().optional(),
  role: z.enum(Role).optional(),
  isActive: z.boolean().optional()
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(8, "Current password is required"),
  newPassword: z.string().min(8, "New password must be at least 8 characters")
})