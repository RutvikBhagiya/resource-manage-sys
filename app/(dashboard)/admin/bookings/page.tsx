import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BookingStatusBadge } from "@/components/booking/BookingStatusBadge";
import { BookingActions } from "@/components/booking/BookingActions";
import { format } from "date-fns";

export default async function AdminBookingsPage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") return null;

  const bookings = await prisma.booking.findMany({
    where: {
      organizationId: session.user.organizationId,
    },
    include: {
      User: {
        select: { name: true, email: true }
      },
      Resource: {
        select: { name: true, roomNumber: true }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Booking Management</h1>
        <div className="text-sm text-gray-500">
          Viewing {bookings.length} requests
        </div>
      </div>

      <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Resource
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Requester
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Schedule
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-500">
                    No bookings found.
                  </td>
                </tr>
              ) : (
                bookings.map((booking) => (
                  <tr key={booking.bookingId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {booking.Resource.name}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.Resource.roomNumber ? `Unit: ${booking.Resource.roomNumber}` : 'General Resource'}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{booking.User.name}</div>
                      <div className="text-xs text-gray-500">{booking.User.email}</div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {format(new Date(booking.startDateTime), "MMM d, yyyy")}
                      </div>
                      <div className="text-xs text-gray-500">
                        {format(new Date(booking.startDateTime), "h:mm a")} - {format(new Date(booking.endDateTime), "h:mm a")}
                      </div>
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <BookingStatusBadge status={booking.status} />
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      {booking.status === "PENDING" ? (
                        <BookingActions bookingId={booking.bookingId} />
                      ) : (
                        <span className="text-gray-400 text-xs">
                          {booking.status.charAt(0) + booking.status.slice(1).toLowerCase()}
                        </span>
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