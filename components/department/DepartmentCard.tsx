"use client"

import { StandardCard } from "@/components/ui/standard-card"
import { Button } from "@/components/ui/button"
import { Edit, Trash2, Users } from "lucide-react"
import { Department } from "@/types/department"

interface DepartmentCardProps {
    department: Department
    onEdit: (department: Department) => void
    onDelete: (departmentId: number) => void
}

export function DepartmentCard({ department, onEdit, onDelete }: DepartmentCardProps) {
    return (
        <StandardCard
            title={department.name}
            status={{
                label: department.isActive ? "Active" : "Inactive",
                variant: department.isActive ? "completed" : "destructive"
            }}
            thumbnail={<Users className="h-5 w-5" />}
            action={
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => onEdit(department)}>
                        <Edit className="h-4 w-4" />
                        <span className="sr-only">Edit</span>
                    </Button>
                    {department.isActive && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10"
                            onClick={() => onDelete(department.departmentId)}
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
                    <Users className="h-4 w-4" />
                    <span>Members: <span className="font-medium text-foreground">{department._count?.User || 0}</span></span>
                </div>
            </div>
        </StandardCard>
    )
}
