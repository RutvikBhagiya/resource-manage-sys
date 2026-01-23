"use client"

import { useState } from "react"
import { Sidebar } from "@/components/dashboard/Sidebar"
import { Navbar } from "@/components/dashboard/Navbar"
import { cn } from "@/lib/utils/cn"

export function DashboardShell({ children }: { children: React.ReactNode }) {
    const [isCollapsed, setIsCollapsed] = useState(false)

    return (
        <div className="min-h-screen bg-transparent transition-colors duration-300 font-sans">
            <Sidebar isCollapsed={isCollapsed} toggleCollapse={() => setIsCollapsed(!isCollapsed)} />

            <div
                className={cn(
                    "transition-all duration-500 ease-in-out",
                    isCollapsed ? "pl-28" : "pl-80"
                )}
            >
                <Navbar />
                <main className="min-h-[calc(100vh-8rem)] p-8 pt-0 animate-fade-in">
                    {children}
                </main>
            </div>
        </div>
    )
}
