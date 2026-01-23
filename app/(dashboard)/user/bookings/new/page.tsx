import { prisma } from "@/lib/prisma"
import { NewBookingForm } from "@/components/bookings/NewBookingForm"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function NewBookingPage() {
  const session = await getServerSession(authOptions)

  if (!session || session.user.role !== "USER") {
    redirect("/login")
  }

  const resources = await prisma.resource.findMany({
    where: {
      isActive: true,
      isAvailable: true,
      organizationId: session.user.organizationId,
    },
    select: {
      resourceId: true,
      name: true,
      capacity: true,
      roomNumber: true,
      buildingId: true,
    }
  })

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-cyan-500 dark:from-violet-400 dark:to-cyan-400">
          Book a Resource
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Schedule a room or equipment for your upcoming activities.
        </p>
      </div>

      <div className="p-6 md:p-8 rounded-[2rem] bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-xl">
        <NewBookingForm resources={resources} />
      </div>
    </div>
  )
}
