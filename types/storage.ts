export interface StorageUnit {
    unitId: number
    resourceId: number
    name: string
    type: string
    totalCompartments: number
    createdAt: string | Date

    Compartment?: Compartment[]
}

export interface Compartment {
    compartmentId: number
    unitId: number
    compartmentNumber: string
    capacity?: number | null
    isAvailable: boolean
    assignedTo?: number | null
    description?: string | null

    // Optional relations if we fetch them
    User?: {
        id: number
        name: string
        email: string
    } | null
}
