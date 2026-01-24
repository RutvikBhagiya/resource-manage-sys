"use client"

import { Search, Menu } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { ThemeToggle } from "@/components/ThemeToggle"
import { NotificationDropdown } from "@/components/layout/NotificationDropdown"

export function Navbar() {
    const { name, role, image, isAuthenticated } = useAuth()

    const userName = name || "Guest User"
    const userRole = role || "Visitor"
    const userImage = image || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=8b5cf6&color=fff`

    return (
        <header className="sticky top-4 z-30 mx-6 mb-8">
            <div className="glass flex h-20 items-center justify-between gap-4 rounded-[2rem] px-8 transition-all">
                {/* Mobile Menu */}
                <button className="md:hidden p-2 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors">
                    <Menu className="size-6" />
                </button>

                {/* Left Side: Welcome & Search */}
                <div className="flex flex-1 items-center gap-6">
                    <div className="hidden md:flex flex-col">
                        <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100">
                            Welcome Back, {userName.split(" ")[0]}
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Manage your resources efficiently</p>
                    </div>

                    <div className="relative hidden w-full max-w-md md:block group">
                        <Search className="absolute left-4 top-1/2 size-5 -translate-y-1/2 text-slate-400 transition-colors group-hover:text-violet-500" />
                        <input
                            type="text"
                            placeholder="Search anything..."
                            className="h-12 w-full rounded-2xl border border-slate-200/50 dark:border-white/10 bg-white/40 dark:bg-slate-900/40 pl-12 pr-4 text-sm text-slate-700 dark:text-slate-200 placeholder-slate-400 outline-none transition-all focus:border-violet-500/50 focus:bg-white/60 dark:focus:bg-slate-900/60 focus:ring-4 focus:ring-violet-500/10 focus:shadow-lg"
                        />
                    </div>
                </div>

                {/* Right Side: Actions */}
                <div className="flex items-center gap-3">
                    <ThemeToggle />

                    {/* 2. REPLACED STATIC BUTTON WITH SMART DROPDOWN */}
                    <NotificationDropdown />

                    {/* User Profile */}
                    <div className="flex items-center gap-3 pl-6 border-l border-slate-200 dark:border-white/10">
                        <div className="text-right hidden lg:block">
                            <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{userName}</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase tracking-wide">{userRole}</p>
                        </div>
                        <div className="group relative cursor-pointer">
                            <div className="size-12 rounded-2xl bg-gradient-to-tr from-violet-500 to-cyan-500 p-[2px] shadow-lg shadow-violet-500/20 transition-transform group-hover:scale-105">
                                <div className="size-full rounded-[14px] bg-white dark:bg-slate-900 p-0.5">
                                    <img src={userImage} alt="User" className="size-full rounded-[12px] object-cover" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    )
}