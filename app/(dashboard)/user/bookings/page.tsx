import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"
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
    <div className="space-y-8 p-6"> 
      
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-cyan-500 dark:from-violet-400 dark:to-cyan-400">
            My Bookings
          </h1>
          <p className="text-muted-foreground mt-1">Manage your scheduled resources</p>
        </div>
        
        <Link
          href="/user/bookings/new"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 text-white font-semibold shadow-lg shadow-violet-500/20 hover:bg-violet-700 hover:shadow-violet-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          <span>New Booking</span>
          <span className="text-xl leading-none mb-0.5">+</span>
        </Link>
      </div>

      <div className="grid gap-4">
        <BookingTable 
          data={bookings} 
          mode="user"
        />
      </div>
    </div>
  )
}