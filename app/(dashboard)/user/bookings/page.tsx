import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { BookingTable } from "@/components/booking/BookingTable"
import { redirect } from "next/navigation"

export default async function UserBookingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const bookings = await prisma.booking.findMany({
    where: {
      userId: Number(session.user.id)
    },
    include: {
      Resource: {
        select: {
          name: true,
          roomNumber: true
        }
      },
    },
    orderBy: {
      createdAt: "desc"
    }
  })

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">My Bookings</h1>
      </div>
      <BookingTable data={bookings} mode="user" />
    </div>
  )
}