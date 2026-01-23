"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Calendar, Clock, Building2, AlignLeft, CheckCircle2, AlertCircle } from "lucide-react"

interface Resource {
    resourceId: number;
    name: string;
    capacity: number | null;
    location?: string;
}

interface NewBookingFormProps {
    resources: Resource[];
}

export function NewBookingForm({ resources }: NewBookingFormProps) {
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState("")

    const [formData, setFormData] = useState({
        resourceId: "",
        title: "",
        purpose: "",
        startDateTime: "",
        endDateTime: "",
    })

    const calculateMinEndTime = () => {
        if (!formData.startDateTime) return ""
        return formData.startDateTime
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError("")

        try {
            const start = new Date(formData.startDateTime)
            const end = new Date(formData.endDateTime)

            if (end <= start) {
                setError("End time must be after start time")
                setLoading(false)
                return
            }

            const res = await fetch("/api/bookings", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    resourceId: Number(formData.resourceId),
                    title: formData.title,
                    purpose: formData.purpose,
                    startDateTime: start.toISOString(),
                    endDateTime: end.toISOString(),
                }),
            })

            if (!res.ok) {
                const msg = await res.text()
                throw new Error(msg || "Failed to create booking")
            }

            router.push("/user/bookings")
            router.refresh()
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="w-full max-w-2xl mx-auto space-y-6">

            {/* Error Message */}
            {error && (
                <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex items-center gap-3 animate-fade-in">
                    <AlertCircle className="size-5 shrink-0" />
                    <p className="text-sm font-medium">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Resource Selection */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                        Select Resource
                    </label>
                    <div className="relative group">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                        <select
                            required
                            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all appearance-none cursor-pointer"
                            value={formData.resourceId}
                            onChange={(e) => setFormData({ ...formData, resourceId: e.target.value })}
                        >
                            <option value="" disabled>Choose a resource...</option>
                            {resources.map((r) => (
                                <option key={r.resourceId} value={r.resourceId}>
                                    {r.name} {r.capacity ? `(${r.capacity} ppl)` : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Event Title */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                        Event Title
                    </label>
                    <div className="relative group">
                        <AlignLeft className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                        <input
                            required
                            type="text"
                            placeholder="e.g. Team Planning Meeting"
                            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all placeholder:text-slate-400"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        />
                    </div>
                </div>

                {/* Start Date & Time */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                        Start Time
                    </label>
                    <div className="relative group">
                        <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                        <input
                            required
                            type="datetime-local"
                            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all text-slate-600 dark:text-slate-300"
                            value={formData.startDateTime}
                            onChange={(e) => setFormData({ ...formData, startDateTime: e.target.value })}
                        />
                    </div>
                </div>

                {/* End Date & Time */}
                <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                        End Time
                    </label>
                    <div className="relative group">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                        <input
                            required
                            type="datetime-local"
                            min={calculateMinEndTime()}
                            className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all text-slate-600 dark:text-slate-300"
                            value={formData.endDateTime}
                            onChange={(e) => setFormData({ ...formData, endDateTime: e.target.value })}
                        />
                    </div>
                </div>

                {/* Purpose */}
                <div className="space-y-2 md:col-span-2">
                    <label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">
                        Purpose / Description
                    </label>
                    <textarea
                        rows={3}
                        placeholder="Briefly describe the purpose of this booking..."
                        className="w-full p-4 rounded-2xl bg-white/50 dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 outline-none focus:ring-4 focus:ring-violet-500/10 focus:border-violet-500 transition-all placeholder:text-slate-400 resize-none"
                        value={formData.purpose}
                        onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                    />
                </div>
            </div>

            {/* Submit Button */}
            <div className="pt-4 flex justify-end">
                <button
                    type="submit"
                    disabled={loading}
                    className="flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-600 text-white font-bold shadow-lg shadow-violet-500/25 hover:shadow-violet-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? (
                        <>Processing...</>
                    ) : (
                        <>
                            <CheckCircle2 className="size-5" />
                            Confirm Booking
                        </>
                    )}
                </button>
            </div>
        </form>
    )
}
