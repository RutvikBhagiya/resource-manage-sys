"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { RejectModal } from "@/components/booking/RejectModal"

export default function ApproveRejectButtons({ bookingId }: { bookingId: number }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)

  async function handleAction(type: "approve" | "reject", reason?: string) {
    setLoading(true)
    try {
      const body = type === "reject" && reason ? JSON.stringify({ reason }) : undefined

      const res = await fetch(`/api/admin/bookings/${bookingId}/${type}`, {
        method: "POST",
        headers: body ? { "Content-Type": "application/json" } : undefined,
        body,
      })

      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.message || data.error || "Action failed")
      }

      toast.success(data.message || `Booking ${type}d successfully`)
      setShowRejectModal(false)
      router.refresh()
    } catch (error: any) {
      console.error(error)
      toast.error(error.message || "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex gap-2 justify-end">
      <Button
        variant="default"
        className="bg-green-600 hover:bg-green-700 text-white"
        onClick={() => handleAction("approve")}
        disabled={loading}
      >
        {loading ? "Processing..." : "Approve"}
      </Button>

      <Button
        variant="destructive"
        onClick={() => setShowRejectModal(true)}
        disabled={loading}
      >
        Reject
      </Button>

      <RejectModal
        isOpen={showRejectModal}
        onClose={() => setShowRejectModal(false)}
        onConfirm={(reason) => handleAction("reject", reason)}
        isLoading={loading}
      />
    </div>
  )
}
