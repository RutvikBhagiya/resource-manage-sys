import { Role } from "@/generated/prisma/enums"

export interface User {
    id: string
    name: string
    email: string
    role: Role
    organizationId: number | null
    phone: string | null
    image: string | null
    isActive: boolean
    createdAt: string
    updatedAt: string
    Organization?: {
        name: string
        type: string
    }
}
