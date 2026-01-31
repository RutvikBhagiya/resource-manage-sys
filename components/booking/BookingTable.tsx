"use client"

import { DataTable } from "@/components/ui/data-table"
import { getBookingColumns, BookingData } from "@/components/booking/columns"

interface BookingTableProps {
  data: BookingData[]
  mode: "admin" | "user"
}

export function BookingTable({ data, mode }: BookingTableProps) {
  const columns = getBookingColumns(mode)

  return (
    <DataTable columns={columns} data={data} searchKey="title" placeholder="Search event..." />
  )
}