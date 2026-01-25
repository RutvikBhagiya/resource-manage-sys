"use client"

import { Search, Menu } from "lucide-react"
import { useAuth } from "@/hooks/useAuth"
import { ThemeToggle } from "@/components/ThemeToggle"
import { NotificationDropdown } from "@/components/layout/NotificationDropdown"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Sidebar } from "./AppSidebar"

export function Navbar() {
  const { name, role, image } = useAuth()
  const userName = name || "Guest"
  const userInitials = userName.split(" ").map(n => n[0]).join("").slice(0, 2).toUpperCase()

  return (
    <header className="sticky top-4 z-30 mx-6 mb-8">
      <div className="flex h-20 items-center justify-between gap-4 rounded-3xl border bg-card/50 backdrop-blur-xl px-6 shadow-sm">
        
        {/* Mobile Menu (Sheet) */}
        <div className="md:hidden">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-80">
               {/* Reusing Sidebar for Mobile */}
               <Sidebar isCollapsed={false} toggleCollapse={() => {}} />
            </SheetContent>
          </Sheet>
        </div>

        {/* Left: Welcome & Search */}
        <div className="flex flex-1 items-center gap-6">
          <div className="hidden md:block">
            <h2 className="text-lg font-bold tracking-tight">
              Welcome, {userName.split(" ")[0]}
            </h2>
            <p className="text-xs text-muted-foreground">Manage your resources</p>
          </div>

          <div className="relative hidden w-full max-w-sm md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input 
              placeholder="Search anything..." 
              className="pl-9 rounded-2xl bg-background/50 border-muted focus-visible:ring-primary" 
            />
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <NotificationDropdown />

          <div className="hidden h-8 w-[1px] bg-border lg:block" />

          {/* User Profile */}
          <div className="flex items-center gap-3">
            <div className="text-right hidden lg:block">
              <p className="text-sm font-medium leading-none">{userName}</p>
              <p className="text-xs text-muted-foreground uppercase">{role || "VISITOR"}</p>
            </div>
            
            <Avatar className="h-10 w-10 border-2 border-primary/10">
              <AvatarImage src={image || ""} alt={userName} />
              <AvatarFallback className="bg-primary/10 text-primary font-bold">
                {userInitials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  )
}