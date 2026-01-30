"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export default function ApproveRejectButtons({ bookingId }: { bookingId: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleAction(type: "approve" | "reject") {
    setLoading(true)

    let body: any = undefined

    if (type === "reject") {
      const reason = prompt("Reason for rejection?")
      if (!reason || reason.length < 3) {
        toast.error("Rejection reason must be at least 3 characters")
        setLoading(false)
        return
      }

      body = JSON.stringify({ reason })
    }

    await fetch(`/api/admin/bookings/${bookingId}/${type}`, {
      method: "POST",
      headers: body
        ? { "Content-Type": "application/json" }
        : undefined,
      body,
    })

    setLoading(false)
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      <button
        onClick={() => handleAction("approve")}
        disabled={loading}
        className="bg-green-600 text-white px-3 py-1 rounded"
      >
        Approve
      </button>

      <button
        onClick={() => handleAction("reject")}
        disabled={loading}
        className="bg-red-600 text-white px-3 py-1 rounded"
      >
        Reject
      </button>
    </div>
  )
}
