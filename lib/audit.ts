import { Prisma } from "@/generated/prisma/client"
import { AuditAction, AuditEntity } from "@/generated/prisma/enums"

// Map model names to AuditEntity enum
const MODEL_TO_ENTITY: Record<string, AuditEntity> = {
    Organization: "ORGANIZATION",
    User: "USER",
    Resource: "RESOURCE",
    Booking: "BOOKING",
    MaintenanceLog: "MAINTENANCE",
    MaintenanceSchedule: "MAINTENANCE", // Map both to MAINTENANCE entity
    Department: "DEPARTMENT",
    Building: "BUILDING",
    ResourceCategory: "RESOURCE_CATEGORY",
    ResourceAmenity: "RESOURCE_AMENITY",
    ResourceAvailability: "RESOURCE_AVAILABILITY",
    StorageUnit: "STORAGE_UNIT",
    Compartment: "COMPARTMENT",
    BookingApproval: "BOOKING_APPROVAL",
    Notification: "NOTIFICATION",
    Account: "ACCOUNT",
    Session: "SESSION"
}

export function auditExtension(userId: number) {
    return Prisma.defineExtension((client) => {
        return client.$extends({
            query: {
                $allModels: {
                    async $allOperations({ model, operation, args, query }) {
                        const entity = MODEL_TO_ENTITY[model]

                        // If we don't track this model or operation, just execute
                        if (!entity || !["create", "update", "delete", "createMany", "updateMany", "deleteMany", "upsert"].includes(operation)) {
                            return query(args)
                        }

                        let action: AuditAction = "UPDATE" // Default
                        let oldData: any = null
                        let newData: any = null
                        let targetId: number | null = null

                        // Determine Action and Data
                        if (operation === "create" || operation === "createMany") {
                            action = "CREATE"
                            newData = (args as any).data
                        } else if (operation === "delete" || operation === "deleteMany") {
                            action = "DELETE"
                            // Capture old data for single delete
                            if (operation === "delete") {
                                try {
                                    const existing = await (client as any)[model].findUnique({
                                        where: args.where
                                    })
                                    if (existing) oldData = existing
                                } catch (e) {
                                    // Ignore fetch errors
                                }
                            }
                        } else if (operation === "update" || operation === "updateMany" || operation === "upsert") {
                            action = "UPDATE"
                            newData = (args as any).data

                            // Capture old data for single update
                            if (operation === "update") {
                                try {
                                    const existing = await (client as any)[model].findUnique({
                                        where: args.where
                                    })
                                    if (existing) oldData = existing
                                } catch (e) {
                                    // Ignore fetch errors
                                }
                            }
                        }

                        // Execute the query first
                        const result = await query(args)

                        try {
                            // Try to resolve entityId from result if possible (for single ops)
                            if (result && typeof result === "object" && "id" in result) {
                                targetId = (result as any).id
                            } else if (result && typeof result === "object" && "organizationId" in result) {
                                targetId = (result as any).organizationId // Handle Organization PK
                            } else if (result && typeof result === "object" && "bookingId" in result) {
                                targetId = (result as any).bookingId
                            } else if (result && typeof result === "object" && "resourceId" in result) {
                                targetId = (result as any).resourceId
                            }

                            // Create Audit Log
                            // Use a separate disconnected prisma instance or the original client to avoid infinite loops if we audited AuditLog (which we don't)
                            // But here we are safe because AuditLog is not in MODEL_TO_ENTITY.

                            // We need to use the base client to create the log, 
                            // but we are inside an extension. The 'client' arg is the *client instance being extended*.

                            // Simplest way: just use the context's client, but we must ensure we don't recurse.
                            // Since AuditLog model is NOT in MODEL_TO_ENTITY, it won't recurse.

                            // CAUTION: The 'client' object here is the *extended* client.
                            // However, since we checked MODEL_TO_ENTITY["AuditLog"] is undefined, recursion stops.

                            // We perform this asynchronously to not block the main response too much
                            await (client as any).auditLog.create({
                                data: {
                                    userId,
                                    action,
                                    entity,
                                    entityId: targetId ? Number(targetId) : null,
                                    oldData: oldData ? (oldData as any) : undefined,
                                    newData: newData ? (newData as any) : undefined,
                                }
                            })

                        } catch (error) {
                            console.error("Failed to create audit log", error)
                            // Swallow error to not fail the main request
                        }

                        return result
                    },
                },
            },
        })
    })
}
