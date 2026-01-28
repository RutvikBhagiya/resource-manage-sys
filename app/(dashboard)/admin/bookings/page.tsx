import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { BookingTable } from "@/components/booking/BookingTable"

const ITEMS_PER_PAGE = 10

export default async function BookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const { page } = await searchParams
  const currentPage = Number(page) || 1
  // Security Check: Prevent negative pages
  if (currentPage < 1) redirect("/admin/bookings?page=1")

  const skip = (currentPage - 1) * ITEMS_PER_PAGE

  const [bookings, totalCount] = await Promise.all([
    prisma.booking.findMany({
      where: { organizationId: session.user.organizationId },
      include: {
        User: { select: { name: true, email: true } },
        Resource: { select: { name: true, roomNumber: true } }
      },
      orderBy: { createdAt: "desc" },
      take: ITEMS_PER_PAGE,
      skip: skip,
    }),
    prisma.booking.count({
      where: { organizationId: session.user.organizationId }
    })
  ])

  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE)

  // Security Check: If user manually types ?page=100 and it's empty, redirect back
  // Only redirect if we actually have data (totalCount > 0) but went too far
  if (currentPage > totalPages && totalCount > 0) {
    redirect(`/admin/bookings?page=${totalPages}`)
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Bookings</h1>
      </div>

      <div className="space-y-4">
        <BookingTable data={bookings} mode="admin" />

        {/* INDUSTRIAL STANDARD PAGINATION LOGIC */}
        {/* Only show pagination bar if there is more than 1 page */}
        {totalPages > 1 && (
          <div className="flex items-center justify-end space-x-2 py-4 px-4 border bg-card rounded-xl shadow-sm">
            <div className="text-xs text-muted-foreground mr-auto">
              Page {currentPage} of {totalPages}
            </div>

            {/* PREVIOUS BUTTON */}
            {currentPage <= 1 ? (
              <Button variant="outline" size="sm" disabled>
                <ChevronLeft className="h-4 w-4 mr-2" /> Previous
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/bookings?page=${currentPage - 1}`}>
                  <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                </Link>
              </Button>
            )}

            {/* NEXT BUTTON */}
            {currentPage >= totalPages ? (
              <Button variant="outline" size="sm" disabled>
                Next <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button variant="outline" size="sm" asChild>
                <Link href={`/admin/bookings?page=${currentPage + 1}`}>
                  Next <ChevronRight className="h-4 w-4 ml-2" />
                </Link>
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}