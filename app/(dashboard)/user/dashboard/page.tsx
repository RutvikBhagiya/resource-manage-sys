import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { CancelBookingButton } from "@/components/booking/CancelBookingButton";
import { format } from "date-fns";
import Link from "next/link";
import { Plus } from "lucide-react";

export default async function UserBookingsPage() {
  const session = await getServerSession(authOptions);
  if (!session) return null;

  // 1. Fetch My Bookings
  const bookings = await prisma.booking.findMany({
    where: {
      userId: Number(session.user.id), // Security: Only my data
    },
    include: {
      Resource: {
        select: { name: true, roomNumber: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header with "New Booking" Action */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Bookings</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Track and manage your resource requests
          </p>
        </div>
        <Link 
          href="/user/bookings/new" 
          className="inline-flex items-center px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium rounded-lg transition-colors shadow-sm shadow-violet-500/30"
        >
          <Plus className="size-4 mr-2" />
          New Request
        </Link>
      </div>

      {/* Booking List */}
      <div className="bg-white dark:bg-slate-900 shadow-sm rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800">
            <thead className="bg-gray-50 dark:bg-slate-800/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date & Time
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Purpose
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-slate-900">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    You haven't made any bookings yet.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.bookingId} className="hover:bg-gray-50 dark:hover:bg-slate-800/50 transition-colors">
                    {/* Resource */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {booking.Resource.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {booking.Resource.roomNumber || "General Resource"}
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {format(new Date(booking.startDateTime), "MMM d, yyyy")}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {format(new Date(booking.startDateTime), "h:mm a")} - {format(new Date(booking.endDateTime), "h:mm a")}
                      </div>
                    </td>

                    {/* Purpose (Truncated) */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white max-w-[200px] truncate" title={booking.purpose || ""}>
                        {booking.title}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 max-w-[200px] truncate">
                        {booking.purpose || "No description provided"}
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <BookingStatusBadge status={booking.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      {booking.status === "PENDING" && (
                        <CancelBookingButton bookingId={booking.bookingId} />
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}