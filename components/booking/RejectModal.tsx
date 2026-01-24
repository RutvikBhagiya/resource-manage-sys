"use client";

import { useState } from "react";

interface RejectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  isLoading: boolean;
}

export function RejectModal({ isOpen, onClose, onConfirm, isLoading }: RejectModalProps) {
  const [reason, setReason] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 backdrop-blur-sm">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 mx-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Reject Booking</h3>
        <p className="text-sm text-gray-500 mb-4">
          Please provide a reason for rejection. This will be sent to the requester.
        </p>
        
        <textarea
          className="w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
          rows={4}
          placeholder="e.g., Room is under maintenance, conflicting schedule..."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={isLoading}
        />

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(reason)}
            disabled={!reason.trim() || isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center"
          >
            {isLoading ? "Rejecting..." : "Confirm Rejection"}
          </button>
        </div>
      </div>
    </div>
  );
}