import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Package, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function UserDashboard() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  const [activeBookingsCount, resourcesCount] = await Promise.all([
    prisma.booking.count({
      where: { userId: Number(session.user.id), status: "PENDING" }
    }),
    prisma.resource.count({
      where: { organizationId: session.user.organizationId ?? -1, isActive: true }
    })
  ])

  return (
    <div className="p-8 space-y-8">
      {/* Welcome Section */}
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-indigo-600 dark:from-violet-400 dark:to-indigo-400">
          Welcome back, {session.user.name?.split(" ")[0]}
        </h1>
        <p className="text-muted-foreground text-lg">
          What would you like to book today?
        </p>
      </div>

      {/* Stats / Quick Actions */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/user/resources">
          <Card className="hover:shadow-lg transition-all cursor-pointer border-dashed border-2 hover:border-solid hover:border-violet-500/50">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Available Resources</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{resourcesCount}</div>
              <p className="text-xs text-muted-foreground">Browse all rooms & equipment</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/user/bookings">
          <Card className="hover:shadow-lg transition-all cursor-pointer">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
              <Calendar className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{activeBookingsCount}</div>
              <p className="text-xs text-muted-foreground">View your active status</p>
            </CardContent>
          </Card>
        </Link>

        <Card className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white border-none shadow-xl">
          <CardContent className="pt-6">
            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-lg font-bold">Quick Book</h3>
                <p className="text-violet-100 text-sm">Need a resource right now?</p>
              </div>
              <Link href="/user/resources">
                <button className="w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Plus className="h-4 w-4" />
                  Book New Resource
                </button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
