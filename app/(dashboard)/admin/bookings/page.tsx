import { prisma } from "@/lib/prisma"
import { BookingStatus } from "@/generated/prisma/enums"
import ApproveRejectButtons from "@/components/admin/approve-reject-buttons"

export default async function AdminBookingsPage() {
  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      User: { select: { name: true, email: true } },
      Resource: { select: { name: true } },
    },
  })

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Bookings</h1>

      <table className="w-full border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2">User</th>
            <th className="p-2">Resource</th>
            <th className="p-2">From</th>
            <th className="p-2">To</th>
            <th className="p-2">Status</th>
            <th className="p-2">Action</th>
          </tr>
        </thead>

        <tbody>
          {bookings.map((b) => (
            <tr key={b.bookingId} className="border-t">
              <td className="p-2">{b.User.name}</td>
              <td className="p-2">{b.Resource.name}</td>
              <td className="p-2">{b.startDateTime.toLocaleString()}</td>
              <td className="p-2">{b.endDateTime.toLocaleString()}</td>
              <td className="p-2">{b.status}</td>
              <td className="p-2">
                {b.status === BookingStatus.PENDING && (
                  <ApproveRejectButtons bookingId={b.bookingId} />
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
