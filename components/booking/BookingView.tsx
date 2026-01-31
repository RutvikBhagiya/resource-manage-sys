"use client"

import { useState } from "react"
import { BookingTable } from "@/components/booking/BookingTable"
import { BookingCalendar, CalendarEvent } from "@/components/booking/BookingCalendar"
import { Button } from "@/components/ui/button"
import { CalendarIcon, ListIcon } from "lucide-react"
import Link from "next/link"
import { PaginationControls } from "@/components/ui/pagination-controls"

interface BookingViewProps {
    initialBookings: any[]
    calendarEvents: CalendarEvent[]
    mode: "admin" | "user"
    pagination?: {
        currentPage: number
        totalPages: number
        baseUrl: string
    }
}

export function BookingView({ initialBookings, calendarEvents, mode, pagination }: BookingViewProps) {
    const [viewMode, setViewMode] = useState<"list" | "calendar">("calendar")

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                {mode === "user" ? (
                    <div>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-cyan-500 dark:from-violet-400 dark:to-cyan-400">
                            My Bookings
                        </h1>
                        <p className="text-muted-foreground mt-1">Manage your scheduled resources</p>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
                    </div>
                )}

                <div className="flex items-center gap-2">
                    <div className="bg-muted p-1 rounded-lg flex items-center">
                        <Button
                            variant={viewMode === "list" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("list")}
                            className="gap-2 h-8 text-xs font-medium"
                        >
                            <ListIcon className="h-4 w-4" />
                            List
                        </Button>
                        <Button
                            variant={viewMode === "calendar" ? "secondary" : "ghost"}
                            size="sm"
                            onClick={() => setViewMode("calendar")}
                            className="gap-2 h-8 text-xs font-medium"
                        >
                            <CalendarIcon className="h-4 w-4" />
                            Calendar
                        </Button>
                    </div>

                    {mode === "user" && (
                        <Link
                            href="/user/bookings/new"
                            className="inline-flex items-center gap-2 px-6 py-2 rounded-xl bg-violet-600 text-white font-semibold shadow-lg shadow-violet-500/20 hover:bg-violet-700 hover:shadow-violet-500/30 transition-all text-sm"
                        >
                            New Booking
                        </Link>
                    )}
                </div>
            </div>

            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {viewMode === "list" ? (
                    <>
                        <BookingTable data={initialBookings} mode={mode} />
                        {pagination && (
                            <div className="mt-4">
                                <PaginationControls
                                    currentPage={pagination.currentPage}
                                    totalPages={pagination.totalPages}
                                    baseUrl={pagination.baseUrl} // Pass dynamic URL
                                />
                            </div>
                        )}
                    </>
                ) : (
                    <BookingCalendar events={calendarEvents} />
                )}
            </div>
        </div>
    )
}

