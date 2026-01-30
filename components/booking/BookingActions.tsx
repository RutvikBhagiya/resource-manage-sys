"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RejectModal } from "./RejectModal";

interface BookingActionsProps {
  bookingId: number;
}

export function BookingActions({ bookingId }: BookingActionsProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleApprove = async () => {
    if (!confirm("Are you sure you want to approve this booking?")) return;

    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/approve`, {
        method: "POST",
      });

      if (!res.ok) {
        const errorText = await res.text();
        toast.error(`Error: ${errorText}`);
        return;
      }

      toast.success("Booking approved successfully");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReject = async (reason: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/bookings/${bookingId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });

      if (!res.ok) {
        toast.error("Failed to reject booking.");
        return;
      }

      toast.success("Booking rejected successfully");
      setIsModalOpen(false);
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex justify-end gap-2">
        <button
          onClick={handleApprove}
          disabled={isLoading}
          className="px-3 py-1 text-xs font-semibold text-green-700 bg-green-50 rounded hover:bg-green-100 border border-green-200 transition disabled:opacity-50"
        >
          {isLoading ? "Processing..." : "Approve"}
        </button>

        <button
          onClick={() => setIsModalOpen(true)}
          disabled={isLoading}
          className="px-3 py-1 text-xs font-semibold text-red-700 bg-red-50 rounded hover:bg-red-100 border border-red-200 transition disabled:opacity-50"
        >
          Reject
        </button>
      </div>

      <RejectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleReject}
        isLoading={isLoading}
      />
    </>
  );
}