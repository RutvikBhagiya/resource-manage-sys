import { StatsCard } from "@/components/dashboard/StatsCard"
import { Users, Building2, Calendar, Activity } from "lucide-react"

export default function AdminDashboard() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Dashboard Overview</h1>
                <p className="text-slate-500 dark:text-slate-400">Welcome back, Super-Admin. Here's what's happening today.</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                <StatsCard
                    title="Total Users"
                    value="1,234"
                    icon={Users}
                    color="violet"
                    trend="+12% this month"
                />
                <StatsCard
                    title="Total Resources"
                    value="45"
                    icon={Building2}
                    color="blue"
                    trend="+3 new"
                />
                <StatsCard
                    title="Active Bookings"
                    value="28"
                    icon={Calendar}
                    color="fuchsia"
                    trend="8 pending approval"
                />
                <StatsCard
                    title="System Status"
                    value="98%"
                    icon={Activity}
                    color="emerald"
                    trend="All systems operational"
                />
            </div>

            {/* Recent Activity and Charts would go here */}
            <div className="grid gap-6 lg:grid-cols-2">
                <div className="glass-card rounded-2xl p-6">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">Recent Bookings</h3>
                    <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-12">No recent bookings</div>
                </div>
                <div className="glass-card rounded-2xl p-6">
                    <h3 className="mb-4 text-lg font-semibold text-slate-800 dark:text-white">Resource Usage</h3>
                    <div className="text-sm text-slate-500 dark:text-slate-400 text-center py-12">Chart placeholder</div>
                </div>
            </div>
        </div>
    )
}
