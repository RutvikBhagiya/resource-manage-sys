"use client"

import { useState, useEffect } from "react"
import { Sidebar } from "@/components/layout/AppSidebar" 
import { Navbar } from "@/components/layout/AppNavbar"
import { cn } from "@/lib/utils"

interface DashboardShellProps {
  children: React.ReactNode
}

export function DashboardShell({ children }: DashboardShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth < 1024) setIsCollapsed(true)
    }
    
    checkMobile()
    
    window.addEventListener("resize", checkMobile)
    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const toggleCollapse = () => setIsCollapsed(!isCollapsed)

  return (
    <div className="relative min-h-screen bg-background flex overflow-hidden">
      
      <div className="hidden md:block">
        <Sidebar 
          isCollapsed={isCollapsed} 
          toggleCollapse={toggleCollapse} 
        />
      </div>
      <main 
        className={cn(
          "flex-1 flex flex-col min-h-screen transition-all duration-300 ease-in-out",
          isCollapsed ? "md:pl-24" : "md:pl-80"
        )}
      >
        <Navbar />

        <div className="flex-1 px-6 pb-6 animate-fade-in">
          {children}
        </div>
      </main>
    </div>
  )
}