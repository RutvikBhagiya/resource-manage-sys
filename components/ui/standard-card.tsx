import { ReactNode } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface StandardCardProps {
    title: string
    subtitle?: string
    status?: {
        label: string
        variant?: "default" | "secondary" | "destructive" | "outline" | "completed" | "pending"
    }
    thumbnail?: ReactNode
    action?: ReactNode
    className?: string
    children?: ReactNode
}

export function StandardCard({
    title,
    subtitle,
    status,
    thumbnail,
    action,
    className,
    children
}: StandardCardProps) {
    return (
        <Card className={cn("overflow-hidden hover:shadow-md transition-shadow duration-200 border-none shadow-sm ring-1 ring-slate-900/5", className)}>
            <CardHeader className="p-4 pb-2 flex flex-row items-start justify-between space-y-0">
                <div className="flex gap-3 items-center">
                    {thumbnail && (
                        <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/10 text-primary">
                            {thumbnail}
                        </div>
                    )}
                    <div className="space-y-1">
                        <h3 className="font-semibold leading-none tracking-tight">{title}</h3>
                        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    {status && (
                        <Badge
                            variant={status.variant === "completed" ? "default" : status.variant === "pending" ? "secondary" : status.variant}
                            className={cn(
                                status.variant === "completed" && "bg-green-100 text-green-700 hover:bg-green-200 ring-green-600/20",
                                status.variant === "pending" && "bg-yellow-100 text-yellow-700 hover:bg-yellow-200 ring-yellow-600/20"
                            )}
                        >
                            {status.label}
                        </Badge>
                    )}
                    {action}
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                {children}
            </CardContent>
        </Card>
    )
}
