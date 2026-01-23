import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import Link from "next/link"

export default async function UserBookingsPage() {
  const session = await getServerSession(authOptions)

  const bookings = await prisma.booking.findMany({
    where: { userId: Number(session!.user.id) },
    include: {
      Resource: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-cyan-500 dark:from-violet-400 dark:to-cyan-400">
            My Bookings
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Manage your scheduled resources</p>
        </div>
        <Link
          href="/user/bookings/new"
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-violet-600 text-white font-semibold shadow-lg shadow-violet-500/20 hover:bg-violet-700 hover:shadow-violet-500/30 transition-all hover:-translate-y-0.5 active:translate-y-0"
        >
          New Booking +
        </Link>
      </div>

      <div className="grid gap-4">
        {bookings.length === 0 ? (
          <div className="p-8 text-center rounded-[2rem] bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-white/10 border-dashed text-slate-500">
            No bookings found. Start by creating one!
          </div>
        ) : (
          bookings.map((b) => (
            <div key={b.bookingId} className="group relative p-6 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-xl border border-white/60 dark:border-white/10 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200">{b.Resource.name}</h3>
                  <p className="text-sm text-slate-500">{new Date(b.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold ${b.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                    b.status === 'PENDING' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                      'bg-rose-500/10 text-rose-600 dark:text-rose-400'
                  }`}>
                  {b.status}
                </span>
              </div>

              <div className="mt-4 flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">From:</span>
                  {new Date(b.startDateTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
                <div className="w-px h-4 bg-slate-300 dark:bg-slate-700" />
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold">To:</span>
                  {new Date(b.endDateTime).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
