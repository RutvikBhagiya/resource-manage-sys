import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CalendarDays, CheckCircle2, Clock, Building2 } from "lucide-react"

export default async function AdminDashboardPage() {
  const session = await getServerSession(authOptions)
  if (!session) redirect("/login")

  const orgId = session.user.organizationId

  // 1. Fetch Key Metrics in Parallel (Fast)
  const [
    totalResources, 
    pendingBookings, 
    activeBookings, 
    todaysBookingsCount
  ] = await Promise.all([
    // Count Total Resources
    prisma.resource.count({ where: { organizationId: orgId, isActive: true } }),
    
    // Count Pending Approvals
    prisma.booking.count({ where: { organizationId: orgId, status: "PENDING" } }),
    
    // Count Approved Future Bookings
    prisma.booking.count({ 
      where: { 
        organizationId: orgId, 
        status: "APPROVED",
        endDateTime: { gte: new Date() } // Future only
      } 
    }),

    // Count Bookings Happening TODAY
    prisma.booking.count({
      where: {
        organizationId: orgId,
        status: "APPROVED",
        startDateTime: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)), // Start of today
            lt: new Date(new Date().setHours(23, 59, 59, 999)) // End of today
        }
      }
    })
  ])

  // 2. Fetch Recent Pending Requests (for a mini-list)
  const recentRequests = await prisma.booking.findMany({
    where: { organizationId: orgId, status: "PENDING" },
    take: 5,
    orderBy: { createdAt: "desc" },
    include: {
        User: { select: { name: true, email: true } },
        Resource: { select: { name: true } }
    }
  })

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
      
      {/* METRIC CARDS */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Resources</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalResources}</div>
            <p className="text-xs text-muted-foreground">Rooms & Equipment active</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingBookings}</div>
            <p className="text-xs text-muted-foreground">Requires your attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Upcoming Bookings</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeBookings}</div>
            <p className="text-xs text-muted-foreground">Scheduled for the future</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Schedule</CardTitle>
            <CalendarDays className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{todaysBookingsCount}</div>
            <p className="text-xs text-muted-foreground">Events happening today</p>
          </CardContent>
        </Card>
      </div>

      {/* RECENT ACTIVITY SECTION */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Booking Requests</CardTitle>
          </CardHeader>
          <CardContent>
            {recentRequests.length === 0 ? (
                <p className="text-sm text-muted-foreground">No pending requests.</p>
            ) : (
                <div className="space-y-4">
                    {recentRequests.map((req) => (
                        <div key={req.bookingId} className="flex items-center justify-between border-b pb-2 last:border-0">
                            <div>
                                <p className="font-medium text-sm">{req.title}</p>
                                <p className="text-xs text-muted-foreground">{req.User.name} • {req.Resource.name}</p>
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {new Date(req.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}