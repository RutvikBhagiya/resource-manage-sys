export interface Organization {
  organizationId: number
  name: string
  type: string
  email: string | null
  phone: string | null
  address: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}