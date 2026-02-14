"use client"

import { ColumnDef } from "@tanstack/react-table"
import { format } from "date-fns"
import { BookingStatus } from "@/generated/prisma/enums"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { BookingActions } from "@/components/booking/BookingActions"
import { CancelBookingButton } from "@/components/booking/CancelBookingButton"

import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Info } from "lucide-react"

export interface BookingData {
    bookingId: number
    title: string
    startDateTime: string | Date
    endDateTime: string | Date
    status: BookingStatus
    purpose?: string | null
    User?: { name: string; email: string }
    Resource?: { name: string; roomNumber?: string | null }
    BookingApproval?: {
        status: string
        comments?: string | null
        approvedAt?: string | Date | null
    } | null
}

const getStatusColor = (status: BookingStatus) => {
    switch (status) {
        case "APPROVED": return "bg-green-100 text-green-700 border-green-200"
        case "REJECTED": return "bg-red-100 text-red-700 border-red-200"
        case "PENDING": return "bg-amber-100 text-amber-700 border-amber-200"
        default: return "bg-slate-100 text-slate-700"
    }
}

export const getBookingColumns = (mode: "admin" | "user"): ColumnDef<BookingData>[] => {
    const columns: ColumnDef<BookingData>[] = [
        {
            accessorKey: "Resource.name", // Access nested data for filtering if needed, though accessorFn is safer for display
            id: "resource",
            header: "Resource",
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="font-medium">{row.original.Resource?.name || "Unknown"}</span>
                    <span className="text-xs text-muted-foreground">{row.original.Resource?.roomNumber}</span>
                </div>
            ),
        },
        {
            accessorKey: "title",
            header: "Event",
            cell: ({ row }) => (
                <div className="flex flex-col max-w-[150px]">
                    <span className="truncate font-medium">{row.original.title}</span>
                    <span className="truncate text-xs text-muted-foreground">{row.original.purpose || "No details"}</span>
                </div>
            ),
        },
        {
            id: "schedule",
            header: "Schedule",
            accessorFn: (row) => row.startDateTime, // For sorting by date
            cell: ({ row }) => (
                <div className="flex flex-col text-sm">
                    <span>{format(new Date(row.original.startDateTime), "MMM d, yyyy")}</span>
                    <span className="text-xs text-muted-foreground">
                        {format(new Date(row.original.startDateTime), "h:mm a")} - {format(new Date(row.original.endDateTime), "h:mm a")}
                    </span>
                </div>
            ),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => {
                const status = row.original.status
                const approval = row.original.BookingApproval

                return (
                    <div className="flex items-center gap-2">
                        <Badge variant="outline" className={cn("capitalize shadow-none", getStatusColor(status))}>
                            {status.toLowerCase()}
                        </Badge>
                        {status === "REJECTED" && approval?.comments && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-4 w-4 text-red-500" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Reason: {approval.comments}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                        {status === "APPROVED" && approval?.approvedAt && (
                            <TooltipProvider>
                                <Tooltip>
                                    <TooltipTrigger>
                                        <Info className="h-4 w-4 text-green-600/50" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>Approved on {format(new Date(approval.approvedAt), "MMM d, h:mm a")}</p>
                                    </TooltipContent>
                                </Tooltip>
                            </TooltipProvider>
                        )}
                    </div>
                )
            },
        },
        {
            id: "actions",
            header: "Actions",
            cell: ({ row }) => {
                const booking = row.original

                if (mode === "admin" && booking.status === "PENDING") {
                    return <BookingActions bookingId={booking.bookingId} />
                }

                if (mode === "user" && booking.status === "PENDING") {
                    return <CancelBookingButton bookingId={booking.bookingId} />
                }

                return null
            },
        },
    ]

    // Add Requester column only for admin
    if (mode === "admin") {
        columns.splice(2, 0, {
            id: "requester",
            header: "Requester",
            accessorFn: (row) => row.User?.name,
            cell: ({ row }) => (
                <div className="flex flex-col">
                    <span className="text-sm">{row.original.User?.name}</span>
                    <span className="text-xs text-muted-foreground">{row.original.User?.email}</span>
                </div>
            ),
        })
    }

    return columns
}
