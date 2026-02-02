export interface Building {
    buildingId: number
    organizationId: number
    name: string
    totalFloors: number
    isActive: boolean
    createdAt: Date

    Organization?: {
        name: string
    }
    _count?: {
        Resource: number
    }
}
