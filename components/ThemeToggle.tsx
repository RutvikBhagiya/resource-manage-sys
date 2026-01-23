"use client"

import { useEffect, useState } from "react"
import { useTheme } from "next-themes"
import { Moon, Sun } from "lucide-react"

export function ThemeToggle() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <button
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      className="relative flex items-center justify-center p-2 rounded-xl text-slate-500 transition-all hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 hover:text-violet-600 dark:hover:text-violet-400"
      aria-label="Toggle theme"
    >
      <div className="relative size-5">
        <Sun className={`absolute inset-0 size-5 transition-all duration-500 rotate-0 scale-100 dark:-rotate-90 dark:scale-0 text-amber-500`} />
        <Moon className={`absolute inset-0 size-5 transition-all duration-500 rotate-90 scale-0 dark:rotate-0 dark:scale-100 text-violet-400`} />
      </div>
    </button>
  )
}
