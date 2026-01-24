"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { BookingStatus } from "@/generated/prisma/enums";

interface ResourceOption {
  resourceId: number;
  name: string;
  roomNumber: string | null;
  requiresApproval: boolean;
}

interface BookingFormProps {
  resources: ResourceOption[];
  userId: number;
}

export function BookingForm({ resources }: BookingFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    resourceId: "", 
    title: "",
    purpose: "",
    startDateTime: "",
    endDateTime: "",
    attendeesCount: 0,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!formData.resourceId) {
      setError("Please select a resource.");
      setIsLoading(false);
      return;
    }

    const start = new Date(formData.startDateTime);
    const end = new Date(formData.endDateTime);

    if (end <= start) {
      setError("End time must be after start time.");
      setIsLoading(false);
      return;
    }

    try {
      const payload = {
        resourceId: Number(formData.resourceId),
        title: formData.title,
        purpose: formData.purpose,
        startDateTime: start.toISOString(), 
        endDateTime: end.toISOString(),
        attendeesCount: Number(formData.attendeesCount) || 0,
      };

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorMsg = await res.text();
        if (res.status === 409) {
          setError("CONFLICT: This time slot is already booked. Please choose another time.");
        } else {
          setError(`Failed: ${errorMsg}`);
        }
        return;
      }

      router.push("/user/bookings"); 
      router.refresh(); 

    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const selectedResource = resources.find(r => r.resourceId === Number(formData.resourceId));

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 max-w-2xl mx-auto">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Request a Resource</h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-sm rounded border border-red-200">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Select Resource</label>
          <select
            name="resourceId"
            value={formData.resourceId}
            onChange={handleChange}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            required
          >
            <option value="">-- Choose a resource --</option>
            {resources.map((res) => (
              <option key={res.resourceId} value={res.resourceId}>
                {res.name} {res.roomNumber ? `(${res.roomNumber})` : ""}
              </option>
            ))}
          </select>
          {selectedResource?.requiresApproval && (
            <p className="text-xs text-yellow-600 mt-1">
              Note: This resource requires Admin approval.
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Event Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g., Team Weekly Sync"
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
            required
            minLength={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
            <input
              type="datetime-local"
              name="startDateTime"
              value={formData.startDateTime}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
            <input
              type="datetime-local"
              name="endDateTime"
              value={formData.endDateTime}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Purpose / Notes</label>
          <textarea
            name="purpose"
            value={formData.purpose}
            onChange={handleChange}
            rows={3}
            className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 transition"
          >
            {isLoading ? "Submitting Request..." : "Submit Request"}
          </button>
        </div>
      </form>
    </div>
  );
}