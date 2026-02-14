"use client"

import * as React from "react"
import { useEffect, useState } from "react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"

interface UserSelectProps {
    value?: number | null
    onChange: (value: number | null) => void
    className?: string
}

interface UserOption {
    id: number
    name: string
    email: string
}

export function UserSelect({ value, onChange, className }: UserSelectProps) {
    const [users, setUsers] = useState<UserOption[]>([])
    const [loading, setLoading] = useState(false)

    useEffect(() => {
        setLoading(true)
        fetch("/api/admin/users")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setUsers(data)
                } else {
                    setUsers(data.data || [])
                }
            })
            .catch(err => console.error(err))
            .finally(() => setLoading(false))
    }, [])

    return (
        <Select
            value={value !== null && value !== undefined ? String(value) : undefined}
            onValueChange={(val) => onChange(val ? Number(val) : null)}
        >
            <SelectTrigger className={cn("w-full", className)}>
                <SelectValue placeholder="Select user..." />
            </SelectTrigger>
            <SelectContent className="max-h-[300px] z-[9999]">
                {loading ? (
                    <div className="p-2 text-sm text-muted-foreground">Loading...</div>
                ) : users.length === 0 ? (
                    <div className="p-2 text-sm text-muted-foreground">No users found</div>
                ) : (
                    users.map((user) => (
                        <SelectItem key={user.id} value={String(user.id)}>
                            {user.name} ({user.email})
                        </SelectItem>
                    ))
                )}
            </SelectContent>
        </Select>
    )
}
