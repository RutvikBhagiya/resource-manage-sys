"use client"

import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { format } from "date-fns"
import { BookingStatus } from "@/generated/prisma/enums"
import { cn } from "@/lib/utils"
import { CancelBookingButton } from "@/components/booking/CancelBookingButton"
import { BookingActions } from "@/components/booking/BookingActions"

interface BookingData {
  bookingId: number
  title: string
  startDateTime: string | Date
  endDateTime: string | Date
  status: BookingStatus
  purpose?: string | null
  User?: { name: string; email: string }
  Resource?: { name: string; roomNumber?: string | null }
}

interface BookingTableProps {
  data: BookingData[]
  mode: "admin" | "user" 
}

export function BookingTable({ data, mode }: BookingTableProps) {
  
  const getStatusColor = (status: BookingStatus) => {
    switch (status) {
      case "APPROVED": return "bg-green-100 text-green-700 border-green-200"
      case "REJECTED": return "bg-red-100 text-red-700 border-red-200"
      case "PENDING": return "bg-amber-100 text-amber-700 border-amber-200"
      default: return "bg-slate-100 text-slate-700"
    }
  }

  const showRequester = mode === "admin"

  return (
    <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            <TableHead>Resource</TableHead>
            <TableHead>Event</TableHead>
            {showRequester && <TableHead>Requester</TableHead>}
            <TableHead>Schedule</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell colSpan={showRequester ? 6 : 5} className="h-24 text-center text-muted-foreground">
                No bookings found.
              </TableCell>
            </TableRow>
          ) : (
            data.map((booking) => (
              <TableRow key={booking.bookingId} className="group transition-colors hover:bg-muted/50">
                <TableCell className="font-medium">
                   <div className="flex flex-col">
                     <span>{booking.Resource?.name || "Unknown"}</span>
                     <span className="text-xs text-muted-foreground">{booking.Resource?.roomNumber}</span>
                   </div>
                </TableCell>

                <TableCell>
                  <div className="flex flex-col max-w-[150px]">
                    <span className="truncate font-medium">{booking.title}</span>
                    <span className="truncate text-xs text-muted-foreground">{booking.purpose || "No details"}</span>
                  </div>
                </TableCell>

                {showRequester && (
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-sm">{booking.User?.name}</span>
                      <span className="text-xs text-muted-foreground">{booking.User?.email}</span>
                    </div>
                  </TableCell>
                )}

                <TableCell className="whitespace-nowrap">
                  <div className="flex flex-col text-sm">
                    <span>{format(new Date(booking.startDateTime), "MMM d, yyyy")}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(booking.startDateTime), "h:mm a")} - {format(new Date(booking.endDateTime), "h:mm a")}
                    </span>
                  </div>
                </TableCell>

                <TableCell>
                  <Badge variant="outline" className={cn("capitalize shadow-none", getStatusColor(booking.status))}>
                    {booking.status.toLowerCase()}
                  </Badge>
                </TableCell>

                <TableCell className="text-right">
                  {/* ADMIN LOGIC */}
                  {mode === "admin" && booking.status === "PENDING" && (
                    <BookingActions bookingId={booking.bookingId} />
                  )}

                  {/* USER LOGIC */}
                  {mode === "user" && booking.status === "PENDING" && (
                    <CancelBookingButton bookingId={booking.bookingId} />
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}