"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}

export function RejectModal({ isOpen, onClose, onConfirm, isLoading }: RejectModalProps) {
  const [reason, setReason] = useState("");

  const handleOpenChange = (open: boolean) => {
    if (!open && !isLoading) onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reject Booking</DialogTitle>
          <DialogDescription>
            Please provide a reason for rejection. This will be sent to the requester.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <Textarea
            placeholder="e.g., Room is under maintenance, conflicting schedule..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            disabled={isLoading}
            className="resize-none"
            rows={4}
          />
        </div>

        <DialogFooter className="sm:justify-end gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim() || isLoading}
          >
            {isLoading ? "Rejecting..." : "Confirm Rejection"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}