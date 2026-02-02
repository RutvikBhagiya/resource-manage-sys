export interface ResourceCategory {
    categoryId: number
    organizationId: number
    name: string
    description?: string
    icon?: string
    isActive: boolean
    createdAt: Date

    Organization?: {
        name: string
    }
    _count?: {
        Resource: number
    }
}
