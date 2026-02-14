"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export function CancelBookingButton({ bookingId }: { bookingId: number }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCancel = async () => {
    setIsLoading(true);
    try {
      // FIX: Changed method from "POST" to "PATCH" to match your API
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: "PATCH",
      });

      if (!res.ok) {
        // Optional: Get the exact error message from server for debugging
        const errorText = await res.text();
        console.error("Cancel failed:", errorText);
        throw new Error(errorText || "Failed to cancel");
      }

      toast.success("Booking cancelled successfully");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Error canceling booking");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button
          disabled={isLoading}
          className="text-red-600 hover:text-red-800 text-xs font-medium underline disabled:opacity-50"
        >
          {isLoading ? "Canceling..." : "Cancel Request"}
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel Booking Request</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to cancel this booking request? This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Keep Booking</AlertDialogCancel>
          <AlertDialogAction onClick={handleCancel} className="bg-red-600 hover:bg-red-700 text-white">
            Yes, Cancel It
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}