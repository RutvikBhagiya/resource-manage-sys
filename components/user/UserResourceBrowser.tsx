"use client"

import { useState } from "react"
import { Resource } from "@/types/resource"
import { ResourceCard } from "@/components/user/ResourceCard"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, FilterX } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { BookingForm } from "@/components/booking/BookingForm"

interface UserResourceBrowserProps {
    resources: Resource[]
    buildings: { buildingId: number, name: string }[]
    departments: { departmentId: number, name: string }[]
    userId: number
}

export function UserResourceBrowser({ resources, buildings, departments, userId }: UserResourceBrowserProps) {
    const [search, setSearch] = useState("")
    const [selectedBuilding, setSelectedBuilding] = useState<string>("all")
    const [selectedCategory, setSelectedCategory] = useState<string>("all") 
    
    const categories = Array.from(new Set(resources.map(r => r.ResourceCategory?.name).filter(Boolean)))

    const [bookingResource, setBookingResource] = useState<Resource | null>(null)

    const filteredResources = resources.filter(resource => {
        const matchesSearch = resource.name.toLowerCase().includes(search.toLowerCase()) ||
            resource.description?.toLowerCase().includes(search.toLowerCase())
        const matchesBuilding = selectedBuilding === "all" || resource.Building?.name === selectedBuilding
        const matchesCategory = selectedCategory === "all" || resource.ResourceCategory?.name === selectedCategory

        return matchesSearch && matchesBuilding && matchesCategory
    })

    const handleBook = (resource: Resource) => {
        setBookingResource(resource)
    }

    const clearFilters = () => {
        setSearch("")
        setSelectedBuilding("all")
        setSelectedCategory("all")
    }

    return (
        <div className="space-y-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-card/50 p-4 rounded-xl border shadow-sm backdrop-blur-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search resources..."
                        className="pl-9 bg-background"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Select value={selectedBuilding} onValueChange={setSelectedBuilding}>
                    <SelectTrigger className="w-full md:w-[200px] bg-background">
                        <SelectValue placeholder="Building" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Buildings</SelectItem>
                        {buildings.map(b => (
                            <SelectItem key={b.buildingId} value={b.name}>{b.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-full md:w-[200px] bg-background">
                        <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Categories</SelectItem>
                        {categories.map(c => (
                            <SelectItem key={c} value={String(c)}>{c}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
                {(search || selectedBuilding !== "all" || selectedCategory !== "all") && (
                    <Button variant="ghost" size="icon" onClick={clearFilters} title="Clear Filters">
                        <FilterX className="h-4 w-4" />
                    </Button>
                )}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredResources.map(resource => (
                    <ResourceCard
                        key={resource.resourceId}
                        resource={resource}
                        onBook={handleBook}
                    />
                ))}
            </div>

            {filteredResources.length === 0 && (
                <div className="text-center py-20 bg-muted/20 rounded-xl border border-dashed">
                    <p className="text-muted-foreground">No resources found matching your filters.</p>
                    <Button variant="link" onClick={clearFilters} className="mt-2">Clear all filters</Button>
                </div>
            )}

            {/* Booking Dialog */}
            <Dialog open={!!bookingResource} onOpenChange={(open) => !open && setBookingResource(null)}>
                <DialogContent
                    className="max-w-2xl"
                    onInteractOutside={(e) => e.preventDefault()}
                >
                    <DialogHeader>
                        <DialogTitle>Book {bookingResource?.name}</DialogTitle>
                    </DialogHeader>
                    {bookingResource && (
                        <BookingForm
                            userId={userId}
                            resources={[{
                                resourceId: bookingResource.resourceId,
                                name: bookingResource.name,
                                roomNumber: bookingResource.roomNumber || null,
                                requiresApproval: bookingResource.requiresApproval
                            }]}
                            
                            key={bookingResource.resourceId}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
