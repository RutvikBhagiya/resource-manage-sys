"use client"

import { useState, useEffect, useRef } from "react"
import { Bell, Check, Info, AlertTriangle, XCircle } from "lucide-react"
import { NotificationType } from "@/generated/prisma/enums"
import { formatDistanceToNow } from "date-fns"

interface Notification {
  notificationId: number
  title: string
  message: string
  type: NotificationType
  isRead: boolean
  createdAt: string
}

export function NotificationDropdown() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const dropdownRef = useRef<HTMLDivElement>(null)

  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications")
      if (res.ok) {
        const data = await res.json()
        setNotifications(data)
        setUnreadCount(data.filter((n: Notification) => !n.isRead).length)
      }
    } catch (error) {
      console.error("Failed to fetch notifications")
    }
  }

  useEffect(() => {
    fetchNotifications()

    const interval = setInterval(fetchNotifications, 60000)
    return () => clearInterval(interval)
  }, [])

  const markAllAsRead = async () => {
    if (unreadCount === 0) return

    setUnreadCount(0)
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))

    const unreadIds = notifications
      .filter(n => !n.isRead)
      .map(n => n.notificationId)

    if (unreadIds.length > 0) {
      try {
        await fetch("/api/notifications", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationIds: unreadIds })
        })
      } catch (error) {
        console.error("Failed to mark notifications as read")
      }
    }
  }

  const toggleDropdown = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const getIcon = (type: NotificationType) => {
    switch (type) {
      case "SUCCESS": return <Check className="size-4 text-green-500" />
      case "ERROR": return <XCircle className="size-4 text-red-500" />
      case "WARNING": return <AlertTriangle className="size-4 text-yellow-500" />
      default: return <Info className="size-4 text-blue-500" />
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative rounded-2xl bg-white/40 dark:bg-white/5 p-3 text-slate-500 dark:text-slate-400 transition-all hover:bg-white/60 dark:hover:bg-white/10 hover:text-violet-600 dark:hover:text-violet-400 hover:shadow-lg hover:shadow-violet-500/10 hover:-translate-y-0.5"
      >
        <Bell className="size-5" />

        {unreadCount > 0 && (
          <span className="absolute right-3 top-3 size-2.5 rounded-full bg-rose-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 origin-top-right rounded-2xl bg-white dark:bg-slate-900 shadow-xl ring-1 ring-black/5 dark:ring-white/10 focus:outline-none z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Notifications</h3>
            <div className="flex gap-2 items-center">
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {notifications.length} recent
              </span>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-violet-600 hover:text-violet-700 font-medium"
                >
                  Mark all read
                </button>
              )}
            </div>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 dark:text-gray-400 text-sm">
                No notifications yet.
              </div>
            ) : (
              notifications.map((item) => (
                <div
                  key={item.notificationId}
                  className={`px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/5 transition border-b border-gray-100 dark:border-gray-800 last:border-0 ${!item.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                >
                  <div className="flex gap-3">
                    <div className="mt-1 shrink-0">
                      {getIcon(item.type)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {item.message}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-2">
                        {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}