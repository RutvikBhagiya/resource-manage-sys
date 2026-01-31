import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { BookingView } from "@/components/booking/BookingView"

const ITEMS_PER_PAGE = 10

export default async function BookingsPage({searchParams,}: {searchParams: Promise<{ page?: string }>}) {

  const session = await getServerSession(authOptions)
  if (!session?.user?.organizationId) redirect("/login")
  const orgId = session.user.organizationId

  const { page } = await searchParams
  const currentPage = Number(page) || 1
  
  if (currentPage < 1) redirect("/admin/bookings?page=1")

  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  const [bookings, totalCount, allBookings] = await Promise.all([
    prisma.booking.findMany({
      where: { organizationId: orgId },
      include: {
        User: { select: { name: true, email: true } },
        Resource: { select: { name: true, roomNumber: true } }
      },
      orderBy: { createdAt: "desc" },
      take: ITEMS_PER_PAGE,
      skip: skip,
    }),
    prisma.booking.count({
      where: { organizationId: orgId }
    }),
    
    prisma.booking.findMany({
      where: { organizationId: orgId },
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

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  if (currentPage > totalPages && totalCount > 0) {
    redirect(`/admin/bookings?page=${totalPages}`)
  }

  const calendarEvents = allBookings.map(b => ({
    id: b.bookingId,
    title: b.title,
    start: b.startDateTime,
    end: b.endDateTime,
    resource: b.Resource.name,
    user: b.User.name,
    status: b.status
  }))

  return (
    <div className="p-6 space-y-6">
      <BookingView
        initialBookings={bookings}
        calendarEvents={calendarEvents}
        mode="admin"
        pagination={{
          currentPage,
          totalPages,
          baseUrl: "/admin/bookings"
        }}
      />
    </div>
  )
}