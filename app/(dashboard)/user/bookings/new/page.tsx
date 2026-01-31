import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { BookingForm } from "@/components/booking/BookingForm"
import { redirect } from "next/navigation"

export default async function NewBookingPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.organizationId) redirect("/login")

  const resources = await prisma.resource.findMany({
    where: {
      organizationId: session.user.organizationId,
      isActive: true,
      isAvailable: true
    },
    select: {
      resourceId: true,
      name: true,
      roomNumber: true,
      requiresApproval: true
    },
    orderBy: {
      name: 'asc'
    }
  })

  return (
    <div className="max-w-3xl mx-auto py-10 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold tracking-tight">New Booking Request</h1>
        <p className="text-muted-foreground mt-2">
          Select a resource and time slot. Some resources may require approval.
        </p>
      </div>

      <div className="bg-card border rounded-xl p-6 shadow-sm">
        <BookingForm
          resources={resources}
          userId={Number(session.user.id)}
        />
      </div>
    </div>
  )
}