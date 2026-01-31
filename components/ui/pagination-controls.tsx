"use client"

import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"

interface PaginationControlsProps {
    currentPage: number
    totalPages: number
    baseUrl: string
}

export function PaginationControls({ currentPage, totalPages, baseUrl }: PaginationControlsProps) {
    if (totalPages <= 1) return null

    return (
        <div className="flex items-center justify-end space-x-2 py-4 px-4 border bg-card rounded-xl shadow-sm">
            <div className="text-xs text-muted-foreground mr-auto">
                Page {currentPage} of {totalPages}
            </div>

            {/* PREVIOUS BUTTON */}
            {currentPage <= 1 ? (
                <Button variant="outline" size="sm" disabled>
                    <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                </Button>
            ) : (
                <Button variant="outline" size="sm" asChild>
                    <Link href={`${baseUrl}?page=${currentPage - 1}`}>
                        <ChevronLeft className="h-4 w-4 mr-2" /> Previous
                    </Link>
                </Button>
            )}

            {/* NEXT BUTTON */}
            {currentPage >= totalPages ? (
                <Button variant="outline" size="sm" disabled>
                    Next <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
            ) : (
                <Button variant="outline" size="sm" asChild>
                    <Link href={`${baseUrl}?page=${currentPage + 1}`}>
                        Next <ChevronRight className="h-4 w-4 ml-2" />
                    </Link>
                </Button>
            )}
        </div>
    )
}
