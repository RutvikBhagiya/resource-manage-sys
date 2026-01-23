"use client"

import { signOut } from "next-auth/react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils/cn"
import { LayoutDashboard, Package, Calendar, Settings, LogOut, Building2, Users, FileText, ChevronLeft, ChevronRight, Loader2, Shield } from "lucide-react"

interface SidebarProps {
    isCollapsed: boolean;
    toggleCollapse: () => void;
}

const sidebarLinks = [
    {
        title: "Dashboard",
        href: "/user/dashboard",
        icon: LayoutDashboard,
        roles: ["USER"],
    },
    {
        title: "Platform Admin",
        href: "/super-admin/dashboard",
        icon: Shield,
        roles: ["SUPER_ADMIN"],
    },
    {
        title: "Organization",
        href: "/admin/dashboard",
        icon: Building2,
        roles: ["ADMIN"],
    },
    {
        title: "Resources",
        href: "/resources/dashboard",
        icon: Package,
        roles: ["USER", "STAFF", "ADMIN", "SUPER_ADMIN"],
    },
    {
        title: "Bookings",
        href: "/admin/bookings",
        icon: Calendar,
        roles: ["USER", "STAFF", "ADMIN", "SUPER_ADMIN"],
    },
    {
        title: "Staff Portal",
        href: "/dashboard/staff",
        icon: Users,
        roles: ["STAFF"],
    },
    {
        title: "Users",
        href: "/dashboard/users",
        icon: Users,
        roles: ["SUPER_ADMIN", "ADMIN"],
    },
    {
        title: "Reports",
        href: "/dashboard/reports",
        icon: FileText,
        roles: ["ADMIN", "SUPER_ADMIN"],
    },
]

export function Sidebar({ isCollapsed, toggleCollapse }: SidebarProps) {
    const pathname = usePathname()
    const { role, organizationName, organizationType, status } = useAuth()

    // Default fallback or loading state
    const userRole = role?.toUpperCase() || "USER"
    const orgName = organizationName || "Loading..."
    const orgType = organizationType || "..."

    return (
        <aside
            className={cn(
                "fixed left-4 top-4 bottom-4 z-40 rounded-[2rem] border transition-all duration-500 ease-[cubic-bezier(0.25,1,0.5,1)]",
                // Glass effect
                "bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border-white/40 dark:border-white/10 shadow-2xl",
                isCollapsed ? "w-20" : "w-72"
            )}
        >
            {/* Collapse Toggle Button */}
            <button
                onClick={toggleCollapse}
                className="absolute -right-3 top-10 flex size-7 items-center justify-center rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-md text-slate-500 hover:text-violet-600 transition-colors z-50 focus:outline-none"
            >
                {isCollapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </button>

            <div className="flex h-full flex-col p-4">
                {/* Logo & Organization */}
                <div className={cn("flex items-center border-b border-black/5 dark:border-white/10 mb-2 transition-all duration-500 shrink-0", isCollapsed ? "h-20 justify-center" : "h-20 px-2")}>
                    <Link href="/dashboard" className="flex items-center gap-3 group relative overflow-hidden">
                        <div className="relative size-10 shrink-0 flex items-center justify-center rounded-xl bg-gradient-to-tr from-violet-600 to-cyan-500 shadow-lg shadow-violet-500/20 group-hover:scale-110 transition-transform duration-500">
                            <div className="absolute inset-[2px] rounded-[10px] bg-white/20 backdrop-blur-sm" />
                            <Package className="relative z-10 size-5 text-white" />
                        </div>

                        <div className={cn(
                            "flex flex-col transition-all duration-300 overflow-hidden whitespace-nowrap",
                            isCollapsed ? "w-0 opacity-0" : "w-40 opacity-100 ml-2"
                        )}>
                            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-cyan-500 dark:from-violet-400 dark:to-cyan-400 truncate">
                                {status === "loading" ? "Loading..." : orgName}
                            </span>
                            <span className="text-[10px] font-bold tracking-wider text-slate-500 dark:text-slate-400 uppercase truncate">
                                {status === "loading" ? "..." : orgType}
                            </span>
                        </div>

                        {/* Hover Tooltip for Logo when collapsed */}
                        {isCollapsed && (
                            <div className="absolute left-14 top-1/2 -translate-y-1/2 hidden group-hover:block z-50 pl-2">
                                <div className="rounded-lg bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold px-3 py-1.5 shadow-xl whitespace-nowrap animate-fade-in flex flex-col gap-0.5">
                                    <span>{orgName}</span>
                                    <span className="text-[10px] opacity-70 font-normal">{orgType}</span>
                                </div>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Navigation - Conditional Scrolling */}
                <div className={cn(
                    "flex-1 py-6",
                    // If collapsed, use visible overflow so tooltips show. If expanded, use scroll.
                    isCollapsed ? "overflow-visible" : "overflow-y-auto no-scrollbar"
                )}>
                    <nav className="space-y-2">
                        {sidebarLinks.map((link) => {
                            const Icon = link.icon

                            // Dynamic Link Handling for User Bookings
                            let validHref = link.href;
                            if (link.title === "Bookings" && userRole === "USER") {
                                validHref = "/user/bookings";
                            }

                            // Handle exact match for root dashboard, and prefix match for other routes
                            const isActive = validHref === "/dashboard"
                                ? pathname === "/dashboard"
                                : pathname?.startsWith(validHref)

                            if (!link.roles.includes(userRole)) return null

                            return (
                                <Link
                                    key={link.title}
                                    href={validHref}
                                    className={cn(
                                        "group relative flex items-center rounded-2xl transition-all duration-300",
                                        isCollapsed ? "justify-center px-0 py-3.5" : "gap-3 px-4 py-3.5",
                                        isActive
                                            ? "text-violet-700 dark:text-violet-200 bg-white/60 dark:bg-white/10 shadow-md shadow-violet-500/5"
                                            : "text-slate-700 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-white/40 dark:hover:bg-white/5"
                                    )}
                                >
                                    {isActive && (
                                        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-violet-500/10 to-cyan-500/10 dark:from-violet-500/20 dark:to-cyan-500/20 opacity-100 transition-opacity" />
                                    )}

                                    <Icon className={cn("size-5 transition-all duration-300 shrink-0", isActive ? "text-violet-600 dark:text-violet-300 scale-110" : "text-slate-500 dark:text-slate-400 group-hover:scale-110 group-hover:text-slate-700 dark:group-hover:text-slate-300")} />

                                    <span className={cn(
                                        "relative z-10 whitespace-nowrap transition-all duration-300 font-semibold",
                                        isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100"
                                    )}>
                                        {link.title}
                                    </span>

                                    {isActive && !isCollapsed && (
                                        <div className="absolute right-3 size-2 rounded-full bg-gradient-to-r from-violet-500 to-cyan-500 shadow-[0_0_10px_rgba(139,92,246,0.5)] animate-pulse" />
                                    )}

                                    {/* Tooltip for Collapsed State */}
                                    {isCollapsed && (
                                        <div className="absolute left-full top-1/2 -translate-y-1/2 hidden group-hover:block z-50 pl-4">
                                            <div className="rounded-xl bg-slate-900 dark:bg-white px-4 py-2 text-sm font-bold text-white dark:text-slate-900 shadow-xl whitespace-nowrap animate-slide-up">
                                                {link.title}
                                                {/* Arrow */}
                                                <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-y-4 border-r-4 border-l-0 border-y-transparent border-r-slate-900 dark:border-r-white lg:block hidden" />
                                            </div>
                                        </div>
                                    )}
                                </Link>
                            )
                        })}
                    </nav>
                </div>

                {/* Footer Controls */}
                <div className="mt-auto pt-4 border-t border-black/5 dark:border-white/10 space-y-3 shrink-0">


                    <Link
                        href="/dashboard/settings"
                        className={cn(
                            "group relative flex items-center rounded-2xl py-3 text-sm font-semibold text-slate-700 dark:text-slate-400 transition-all hover:bg-white/40 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-slate-200 hover:shadow-sm overflow-hidden",
                            isCollapsed ? "justify-center px-0" : "gap-3 px-4"
                        )}
                    >
                        <Settings className="size-5 shrink-0 text-slate-500 dark:text-slate-400 transition-transform group-hover:rotate-90 group-hover:text-slate-700 dark:group-hover:text-slate-300" />
                        <span className={cn("whitespace-nowrap transition-all duration-300", isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100")}>Settings</span>

                        {isCollapsed && (
                            <div className="absolute left-full top-1/2 -translate-y-1/2 hidden group-hover:block z-50 pl-4">
                                <div className="rounded-xl bg-slate-900 dark:bg-white px-4 py-2 text-sm font-bold text-white dark:text-slate-900 shadow-xl whitespace-nowrap animate-slide-up">
                                    Settings
                                    <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-y-4 border-r-4 border-l-0 border-y-transparent border-r-slate-900 dark:border-r-white lg:block hidden" />
                                </div>
                            </div>
                        )}
                    </Link>

                    <button
                        onClick={() => signOut({ callbackUrl: "/login" })}
                        className={cn(
                            "group relative flex w-full items-center rounded-2xl py-3 text-sm font-semibold text-rose-600/80 dark:text-rose-500/80 transition-all hover:bg-rose-500/10 hover:text-rose-700 dark:hover:text-rose-400 hover:shadow-sm overflow-hidden",
                            isCollapsed ? "justify-center px-0" : "gap-3 px-4"
                        )}
                    >
                        <LogOut className="size-5 shrink-0 transition-transform group-hover:-translate-x-1" />
                        <span className={cn("whitespace-nowrap transition-all duration-300", isCollapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100")}>Sign Out</span>

                        {isCollapsed && (
                            <div className="absolute left-full top-1/2 -translate-y-1/2 hidden group-hover:block z-50 pl-4">
                                <div className="rounded-xl bg-rose-600 text-white px-4 py-2 text-sm font-bold shadow-xl whitespace-nowrap animate-slide-up">
                                    Sign Out
                                    <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 border-y-4 border-r-4 border-l-0 border-y-transparent border-r-rose-600 lg:block hidden" />
                                </div>
                            </div>
                        )}
                    </button>
                </div>
            </div>
        </aside>
    )
}
