import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validate } from "@/lib/utils/validate"
import { bookingCreateSchema } from "@/lib/validators/booking.schema"
import { BookingStatus } from "@/generated/prisma/enums"
import { auditExtension } from "@/lib/audit"
import { successResponse, errorResponse } from "@/lib/api-response"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return errorResponse("Unauthorized", 401)

        const json = await req.json()
        const result = validate(bookingCreateSchema, json)
        if (!result.success) return errorResponse("Validation failed", 400, result.response)

        const data = result.data

        // Convert to Date Object
        const startDateTime = new Date(data.startDateTime);
        const endDateTime = new Date(data.endDateTime);

        if (startDateTime >= endDateTime) {
            return errorResponse("End time must be after start time", 400)
        }

        const resource = await prisma.resource.findUnique({
            where: { resourceId: data.resourceId },
            select: {
                requiresApproval: true,
                organizationId: true,
                isActive: true,
                name: true
            }
        });

        if (!resource || !resource.isActive) {
            return errorResponse("Resource not found or inactive", 404);
        }

        //Ensure User is from Resource's Organization 
        if (resource.organizationId !== session.user.organizationId) {
            return errorResponse("You cannot book resources from another organization", 403);
        }

        const conflict = await prisma.booking.findFirst({
            where: {
                resourceId: data.resourceId,
                status: {
                    notIn: [BookingStatus.CANCELLED, BookingStatus.REJECTED] // Ignore cancelled/rejected bookings
                },
                AND: [
                    { startDateTime: { lt: endDateTime } },
                    { endDateTime: { gt: startDateTime } }
                ]
            }
        });

        if (conflict) {
            return errorResponse("Resource is already booked for this time slot", 409);
        }

        // Check Resource Availability
        const dayOfWeekMap = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
        const dayOfWeek = dayOfWeekMap[startDateTime.getDay()];

        const availabilityRules = await prisma.resourceAvailability.findMany({
            where: {
                resourceId: data.resourceId,
                dayOfWeek: dayOfWeek as any // Cast to enum
            }
        });

        // If rules exist, ensuring the booking falls within one of them
        // If no rules exist, we assume it's NOT available (or fully available depending on policy, but usually strict)
        // Let's assume strict: if rules exist, must match. If no rules, maybe default to 9-5 or unavailable?
        // Based on previous conv, user wants to "set the time of availability", implying it's restricted.
        // So if no rules for that day => Not available.

        let isWithinAvailability = false;

        if (availabilityRules.length > 0) {
            // Helper to get minutes from midnight for comparison
            // Booking times are Local (from User Input parsed by Server)
            const getLocalMinutes = (date: Date) => date.getHours() * 60 + date.getMinutes();
            // Rule times are stored as UTC (e.g. 09:00Z) so we use UTC getters to retrieve "09:00"
            const getRuleMinutes = (date: Date) => date.getUTCHours() * 60 + date.getUTCMinutes();

            const bookingStartMins = getLocalMinutes(startDateTime);
            const bookingEndMins = getLocalMinutes(endDateTime);

            for (const rule of availabilityRules) {
                const ruleStartMins = getRuleMinutes(rule.startTime);
                const ruleEndMins = getRuleMinutes(rule.endTime);

                if (bookingStartMins >= ruleStartMins && bookingEndMins <= ruleEndMins) {
                    isWithinAvailability = true;
                    break;
                }
            }

            if (!isWithinAvailability) {
                return errorResponse(`Resource is not available at this time.`, 400);
            }

        } else {
            // If no rules are set for this day, is it closed?
            // Usually yes for a "Resource Management System" where you define availability.
            // But if I enforce strictly, existing resources without rules become unusable.
            // Let's check if the resource has ANY availability rules.
            // If it has rules for other days but not today -> Closed today.
            // If it has NO rules at all -> Maybe fully open? Or Closed?
            // Let's assume strict for now as that's safer.
            const anyRules = await prisma.resourceAvailability.findFirst({
                where: { resourceId: data.resourceId }
            });

            if (anyRules) {
                // It has rules, but none for today -> Closed today
                return errorResponse(`Resource is not available on ${dayOfWeek}`, 400);
            }
            // If NO rules exist at all, we might allow it (legacy behavior) or block it. 
            // Given the user explicitly asked to "implement that table ... to set the time", 
            // it suggests we should respect it. I'll allow if NO rules exist to prevent breaking everything immediately,
            // but if rules exist, strict enforcement.
        }

        const initialStatus = resource.requiresApproval ? BookingStatus.PENDING : BookingStatus.APPROVED;

        const extendedPrisma = prisma.$extends(auditExtension(Number(session.user.id)))
        const booking = await extendedPrisma.booking.create({
            data: {
                organizationId: session.user.organizationId,
                resourceId: data.resourceId,
                userId: Number(session.user.id),
                title: data.title,
                purpose: data.purpose,
                startDateTime: startDateTime,
                endDateTime: endDateTime,
                attendeesCount: data.attendeesCount,
                priority: data.priority,
                status: initialStatus,
                BookingApproval: resource.requiresApproval ? {
                    create: {
                        status: "PENDING"
                    }
                } : undefined
            }
        })

        return successResponse(booking, "Booking created successfully", 201)
    }
    catch (error) {
        console.error("Create booking error:", error)
        return errorResponse("Failed to create booking", 500, error)
    }
}

export async function GET() {
    try {
        const session = await getServerSession(authOptions)
        if (!session) return errorResponse("Unauthorized", 401)

        const bookings = await prisma.booking.findMany({
            where: { userId: Number(session.user.id) },
            include: {
                Resource: {
                    select: {
                        name: true,
                        roomNumber: true
                    }
                }
            },
            orderBy: { createdAt: "desc" },
        })

        return successResponse(bookings, "Bookings retrieved successfully")
    }
    catch (error) {
        console.error("Error retrieving bookings:", error);
        return errorResponse("Failed to retrieve bookings", 500, error)
    }
}
