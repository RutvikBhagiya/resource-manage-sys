import { StatsCard } from "@/components/dashboard/StatsCard"
import { Calendar, Clock, AlertCircle } from "lucide-react"

export default function UserDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-zinc-100">My Dashboard</h1>
                <p className="text-zinc-400">Manage your bookings and view resource availability.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                <StatsCard
                    title="My Bookings"
                    value="3"
                    icon={Calendar}
                    color="violet"
                />
                <StatsCard
                    title="Upcoming"
                    value="Today, 2:00 PM"
                    icon={Clock}
                    color="blue"
                />
                <StatsCard
                    title="Pending Approval"
                    value="1"
                    icon={AlertCircle}
                    color="fuchsia"
                />
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
                <h3 className="mb-4 text-lg font-semibold text-zinc-100">Quick Actions</h3>
                <button className="rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors">
                    Book a Resource
                </button>
            </div>
        </div>
    )
}
