import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { BookingView } from "@/components/booking/BookingView"
import { redirect } from "next/navigation"

export default async function UserBookingsPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  const [bookings, calendarData] = await Promise.all([
    prisma.booking.findMany({
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
    }),
    prisma.booking.findMany({
      where: {
        userId: Number(session.user.id)
      },
      select: {
        bookingId: true,
        title: true,
        startDateTime: true,
        endDateTime: true,
        status: true,
        User: { select: { name: true } },
        Resource: { select: { name: true } }
      },
      orderBy: { startDateTime: 'desc' },
      take: 1000
    })
  ])

  const calendarEvents = calendarData.map(b => ({
    id: b.bookingId,
    title: b.title,
    start: b.startDateTime,
    end: b.endDateTime,
    resource: b.Resource.name,
    user: b.User.name,
    status: b.status
  }))

  return (
    <div className="space-y-8 p-6">
      <BookingView
        initialBookings={bookings}
        calendarEvents={calendarEvents}
        mode="user"
      />
    </div>
  )
}