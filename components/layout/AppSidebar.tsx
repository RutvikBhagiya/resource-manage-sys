"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { signOut } from "next-auth/react"
import { useAuth } from "@/hooks/useAuth"
import { cn } from "@/lib/utils"
import { LayoutDashboard, Package, Calendar, LogOut, Building2, Users, ChevronLeft, ChevronRight, Logs, Settings, Landmark, Building } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

const SIDEBAR_ITEMS = [
  { title: "Dashboard", href: "/", icon: LayoutDashboard, roles: ["USER", "ADMIN", "SUPER_ADMIN", "STAFF"] },
  { title: "Organizations", href: "/super-admin/organizations", icon: Building2, roles: ["SUPER_ADMIN"] },
  { title: "Departments", href: "/admin/departments", icon: Landmark, roles: ["ADMIN"] },
  { title: "Buildings", href: "/admin/buildings", icon: Building, roles: ["ADMIN"] },
  { title: "Resources", href: "/admin/resources", icon: Package, roles: ["USER", "STAFF", "ADMIN"] },
  { title: "Bookings", href: "/bookings", icon: Calendar, roles: ["USER", "STAFF", "ADMIN"] },
  { title: "Staff Portal", href: "/staff", icon: Users, roles: ["STAFF"] },
  { title: "Users", href: "/admin/users", icon: Users, roles: ["SUPER_ADMIN", "ADMIN"] },
  { title: "Logs", href: "/super-admin/logs", icon: Logs, roles: ["SUPER_ADMIN"] },
  { title: "Settings", href: "/settings", icon: Settings, roles: ["USER", "ADMIN", "SUPER_ADMIN", "STAFF"] },
]

interface SidebarProps {
  isCollapsed: boolean
  toggleCollapse: () => void
}

export function Sidebar({ isCollapsed, toggleCollapse }: SidebarProps) {
  const pathname = usePathname()
  const { role, organizationName } = useAuth()
  const userRole = role?.toUpperCase() || "USER"

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "fixed left-4 top-4 bottom-4 z-40 flex flex-col border bg-card/50 backdrop-blur-xl shadow-xl transition-all duration-300 rounded-3xl",
          isCollapsed ? "w-20" : "w-72"
        )}
      >
        <Button
          variant="outline"
          size="icon"
          onClick={toggleCollapse}
          className="absolute -right-3 top-8 h-8 w-8 rounded-full shadow-md z-50 bg-background"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>

        <div className={cn("flex h-20 items-center px-6 transition-all", isCollapsed && "justify-center px-0")}>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg">
              <Package className="h-5 w-5" />
            </div>
            {!isCollapsed && (
              <div className="flex flex-col overflow-hidden">
                <span className="truncate font-bold text-lg leading-none">{userRole === "SUPER_ADMIN" ? "RESORA" : organizationName || "Loading..."}</span>
                <span className="truncate text-xs text-muted-foreground">{userRole === "SUPER_ADMIN" ? "Platform Admin" : "Management System"}</span>
              </div>
            )}
          </div>
        </div>

        <Separator className="opacity-50" />

        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-2 no-scrollbar">
          {SIDEBAR_ITEMS.map((item) => {
            if (!item.roles.includes(userRole)) return null

            let href = item.href

            if (item.title === "Dashboard" && userRole === "USER") href = "/user"
            if (item.title === "Dashboard" && userRole === "ADMIN") href = "/admin"
            if (item.title === "Dashboard" && userRole === "STAFF") href = "/staff"
            if (item.title === "Dashboard" && userRole === "SUPER_ADMIN") href = "/super-admin"
            if (item.title === "Bookings" && userRole === "USER") href = "/user/bookings"
            if (item.title === "Resources" && userRole === "USER") href = "/user/resources"
            if (item.title === "Bookings" && userRole === "ADMIN") href = "/admin/bookings"
            if (item.title === "Users" && userRole === "SUPER_ADMIN") href = "/super-admin/users"

            const isActive = item.title === "Dashboard"
              ? pathname === href
              : pathname === href || pathname?.startsWith(href + "/")

            return (
              <Tooltip key={item.title}>
                <TooltipTrigger asChild>
                  <Link
                    href={href}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "hover:bg-muted text-muted-foreground hover:text-foreground",
                      isCollapsed && "justify-center px-0"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isActive && "text-primary-foreground")} />
                    {!isCollapsed && <span>{item.title}</span>}
                  </Link>
                </TooltipTrigger>
                {isCollapsed && <TooltipContent side="right">{item.title}</TooltipContent>}
              </Tooltip>
            )
          })}
        </div>

        <Separator className="opacity-50" />

        <div className="p-3 space-y-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                className={cn("w-full justify-start gap-3 rounded-xl", isCollapsed && "justify-center px-0")}
                onClick={() => signOut({ callbackUrl: "/login" })}
              >
                <LogOut className="h-5 w-5 text-destructive" />
                {!isCollapsed && <span className="text-destructive">Sign Out</span>}
              </Button>
            </TooltipTrigger>
            {isCollapsed && <TooltipContent side="right">Sign Out</TooltipContent>}
          </Tooltip>
        </div>
      </aside>
    </TooltipProvider>
  )
}