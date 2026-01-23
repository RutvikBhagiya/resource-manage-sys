"use client"

import { useRouter } from "next/navigation"
import { useState } from "react"

export function CancelBookingButton({ bookingId }: { bookingId: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function cancelBooking() {
    setLoading(true)

    await fetch("/api/bookings/cancel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ bookingId }),
    })

    setLoading(false)
    router.refresh()
  }

  return (
    <button
      onClick={cancelBooking}
      disabled={loading}
      className="bg-red-600 text-white px-3 py-1 rounded"
    >
      Cancel
    </button>
  )
}
