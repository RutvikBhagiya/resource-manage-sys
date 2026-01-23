import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils/cn"

interface StatsCardProps {
    title: string
    value: string
    icon: LucideIcon
    color: "violet" | "blue" | "fuchsia" | "emerald"
    trend?: string
}

export function StatsCard({ title, value, icon: Icon, color, trend }: StatsCardProps) {
    const colorStyles = {
        violet: "from-violet-500 to-indigo-500 shadow-violet-500/20",
        blue: "from-sky-500 to-blue-500 shadow-sky-500/20",
        fuchsia: "from-fuchsia-500 to-pink-500 shadow-fuchsia-500/20",
        emerald: "from-emerald-400 to-teal-500 shadow-emerald-500/20",
    }

    const iconColorStyles = {
        violet: "text-violet-500",
        blue: "text-sky-500",
        fuchsia: "text-fuchsia-500",
        emerald: "text-emerald-500",
    }

    const bgStyles = {
        violet: "bg-violet-500/10",
        blue: "bg-sky-500/10",
        fuchsia: "bg-fuchsia-500/10",
        emerald: "bg-emerald-500/10",
    }

    return (
        <div className="glass-card group relative overflow-hidden rounded-[1.5rem] p-6 transition-all hover:-translate-y-1 hover:shadow-2xl">
            <div className="flex justify-between items-start z-10 relative">
                <div>
                    <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">{title}</p>
                    <div className="mt-3">
                        <h3 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</h3>
                    </div>
                    {trend && (
                        <div className="mt-2 flex items-center gap-1.5 opacity-80">
                            <span className="flex items-center text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                {trend}
                            </span>
                        </div>
                    )}
                </div>

                <div className={cn("rounded-2xl p-3.5 shadow-lg transition-transform group-hover:scale-110", bgStyles[color])}>
                    <Icon className={cn("size-6", iconColorStyles[color])} />
                </div>
            </div>

            {/* Decor elements */}
            <div className={cn("absolute -bottom-6 -right-6 size-32 rounded-full bg-gradient-to-br opacity-20 blur-2xl transition-opacity group-hover:opacity-30", colorStyles[color])} />
        </div>
    )
}
