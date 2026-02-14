"use client"

import { Resource } from "@/types/resource"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MapPin, Users, Calendar, ChevronDown, ChevronUp, Box } from "lucide-react"
import { useState } from "react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { cn } from "@/lib/utils"

interface ResourceCardProps {
    resource: Resource
    onBook: (resource: Resource) => void
}

export function ResourceCard({ resource, onBook }: ResourceCardProps) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <Card className="flex flex-col h-full hover:shadow-lg transition-all duration-300 border-muted">
            <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                    <div>
                        <h3 className="font-bold text-lg leading-tight">{resource.name}</h3>
                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {resource.Building?.name || "Unknown Building"}
                            {resource.floorNumber && ` • Floor ${resource.floorNumber}`}
                            {resource.roomNumber && ` • Room ${resource.roomNumber}`}
                        </p>
                    </div>
                    <Badge variant={resource.isAvailable ? "default" : "destructive"}>
                        {resource.isAvailable ? "Available" : "Unavailable"}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="flex-1 pb-3">
                <div className="grid grid-cols-2 gap-3 mb-4">
                    <div className="bg-muted/30 p-2 rounded-lg flex flex-col items-center justify-center text-center">
                        <Users className="h-4 w-4 text-violet-500 mb-1" />
                        <span className="text-xs text-muted-foreground">Capacity</span>
                        <span className="font-semibold text-sm">{resource.capacity || "-"}</span>
                    </div>
                    <div className="bg-muted/30 p-2 rounded-lg flex flex-col items-center justify-center text-center">
                        <Box className="h-4 w-4 text-amber-500 mb-1" />
                        <span className="text-xs text-muted-foreground">Category</span>
                        <span className="font-semibold text-sm truncate w-full px-1">{resource.ResourceCategory?.name || "-"}</span>
                    </div>
                </div>

                {resource.ResourceAmenity && resource.ResourceAmenity.length > 0 && (
                    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-2">
                        <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-muted-foreground">Amenities ({resource.ResourceAmenity.length})</h4>
                            <CollapsibleTrigger asChild>
                                <Button variant="ghost" size="sm" className="w-9 p-0">
                                    {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    <span className="sr-only">Toggle</span>
                                </Button>
                            </CollapsibleTrigger>
                        </div>
                        <CollapsibleContent className="space-y-2 animate-in slide-in-from-top-2">
                            <div className="flex flex-wrap gap-1">
                                {resource.ResourceAmenity.map((amenity) => (
                                    <Badge key={amenity.amenityId} variant="outline" className="text-xs font-normal">
                                        {amenity.name} {amenity.quantity && `(${amenity.quantity})`}
                                    </Badge>
                                ))}
                            </div>
                        </CollapsibleContent>
                    </Collapsible>
                )}

                {resource.description && (
                    <p className="text-xs text-muted-foreground mt-3 line-clamp-2" title={resource.description}>
                        {resource.description}
                    </p>
                )}
            </CardContent>

            <CardFooter className="pt-0">
                <Button
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20"
                    onClick={() => onBook(resource)}
                    disabled={!resource.isAvailable}
                >
                    <Calendar className="mr-2 h-4 w-4" />
                    {resource.isAvailable ? "Book Now" : "Currently Unavailable"}
                </Button>
            </CardFooter>
        </Card>
    )
}
