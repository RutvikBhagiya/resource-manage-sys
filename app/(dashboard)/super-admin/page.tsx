import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { StatsCard } from "@/components/dashboard/StatsCard"
import { Users, Building2, CalendarCheck, Activity } from "lucide-react"

export default async function SuperAdminDashboard() {
  const session = await getServerSession(authOptions)
  if (!session) return null

  const [orgCount, userCount, bookingsCount] = await Promise.all([
    prisma.organization.count(),
    prisma.user.count(),
    prisma.booking.count(),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome back, here's what's happening today.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        <StatsCard 
          title="Total Organizations" 
          value={orgCount}
          icon={Building2}
          description="Active registered entities"
          trend={{ value: 12, label: "this month" }}
        />

        <StatsCard 
          title="Total Users" 
          value={userCount}
          icon={Users}
          description="Across all organizations"
        />

        <StatsCard 
          title="Total Bookings" 
          value={bookingsCount}
          icon={CalendarCheck}
          description="All time requests"
          trend={{ value: -5, label: "from last week" }}
        />

        <StatsCard 
          title="System Status" 
          value="Healthy"
          icon={Activity}
          description="All services operational"
          className="border-l-4 border-l-emerald-500"
        />

      </div>
      
    </div>
  )
}