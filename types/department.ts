export interface Department {
    departmentId: number
    organizationId: number
    name: string
    isActive: boolean
    createdAt: Date

    Organization?: {
        name: string
    }
    User?: {
        name: string
        email: string
    }[]
    _count?: {
        User: number
    }
}
