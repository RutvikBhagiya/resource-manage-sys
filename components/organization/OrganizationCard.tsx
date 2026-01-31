"use client"

import { Organization } from "@/types/organization"
import { StandardCard } from "@/components/ui/standard-card"
import { Button } from "@/components/ui/button"
import { Building2, Mail, MapPin, Phone, Trash2, Edit } from "lucide-react"
import OrganizationDialog from "@/components/organization/OrganizationDialog"
import {AlertDialog,AlertDialogAction,AlertDialogCancel,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogHeader,AlertDialogTitle,AlertDialogTrigger} from "@/components/ui/alert-dialog"

interface OrganizationCardProps {
    organization: Organization
    onDelete: (id: number) => void
    isDeleting: boolean
}

export function OrganizationCard({ organization, onDelete, isDeleting }: OrganizationCardProps) {
    return (
        <StandardCard
            title={organization.name}
            subtitle={organization.type}
            status={{
                label: organization.isActive ? "Active" : "Inactive",
                variant: organization.isActive ? "completed" : "secondary"
            }}
            thumbnail={<Building2 className="h-5 w-5" />}
            action={
                <div className="flex gap-1">
                    <OrganizationDialog organization={organization} type="edit" trigger={<Button variant="ghost" size="icon" className="h-8 w-8"><Edit className="h-4 w-4" /></Button>} />
                    <AlertDialog>
                        <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Delete Organization?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently delete {organization.name} and all its resources. This action cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction onClick={() => onDelete(organization.organizationId)} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                                    {isDeleting ? "Deleting..." : "Delete"}
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
            }
        >
            <div className="grid gap-2 text-sm text-muted-foreground mt-2">
                <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 opacity-70" />
                    <span className="truncate">{organization.email || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 opacity-70" />
                    <span>{organization.phone || "-"}</span>
                </div>
                <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 opacity-70" />
                    <span className="truncate">{organization.address || "-"}</span>
                </div>
            </div>
        </StandardCard>
    )
}
