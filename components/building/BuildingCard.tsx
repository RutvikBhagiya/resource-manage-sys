"use client"

import { StandardCard } from "@/components/ui/standard-card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Building, Layers } from "lucide-react"
import { Building as BuildingType } from "@/types/building"

interface BuildingCardProps {
    building: BuildingType
    onEdit: (building: BuildingType) => void
    onDelete: (buildingId: number) => void
}

export function BuildingCard({ building, onEdit, onDelete }: BuildingCardProps) {
    return (
        <StandardCard
            title={building.name}
            status={{
                label: building.isActive ? "Active" : "Inactive",
                variant: building.isActive ? "completed" : "destructive"
            }}
            thumbnail={<Building className="h-5 w-5" />}
            action={
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(building)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    {building.isActive && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                            onClick={() => onDelete(building.buildingId)}
                        >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                        </Button>
                    )}
                </div>
            }
        >
            <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Layers className="h-4 w-4" />
                    <span>Floors: <span className="font-medium text-foreground">{building.totalFloors || 0}</span></span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Building className="h-4 w-4" />
                    <span>Resources: <span className="font-medium text-foreground">{building._count?.Resource || 0}</span></span>
                </div>
            </div>
        </StandardCard>
    )
}
