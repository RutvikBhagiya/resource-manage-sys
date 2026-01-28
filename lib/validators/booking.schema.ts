import { z } from "zod"
import { BookingPriority } from "@/generated/prisma/enums"


// --- 1. Booking Creation Schema ---
export const bookingCreateSchema = z.object({
  resourceId: z.number({ error: "Resource ID must be a number" })
    .int()
    .positive(),

  title: z.string({ error: "Title is required" })
    .min(3, { error: "Title must be at least 3 characters" })
    .max(200, { error: "Title must be less than 200 characters" }),

  purpose: z.string().optional(),

  startDateTime: z.coerce.date({ error: "Invalid start date format" }),
  endDateTime: z.coerce.date({ error: "Invalid end date format" }),

  attendeesCount: z.number().int().nonnegative().optional(),

  priority: z.enum(BookingPriority).optional()
})
  .refine((data) => {
    const start = new Date(data.startDateTime);
    const end = new Date(data.endDateTime);
    return end > start;
  }, {
    message: "End time must be after start time",
    path: ["endDateTime"]
  });

// --- 2. Booking Rejection Schema ---
export const bookingRejectSchema = z.object({
  bookingId: z.number({ error: "Booking ID is required" })
    .int()
    .positive(),

  reason: z.string({ error: "Rejection reason is required" })
    .min(5, { error: "Reason must be at least 5 characters" })
    .max(500, { error: "Reason is too long" })
});

export type BookingCreateInput = z.infer<typeof bookingCreateSchema>
export type BookingCreateFormValues = z.input<typeof bookingCreateSchema>
export type BookingRejectInput = z.infer<typeof bookingRejectSchema>