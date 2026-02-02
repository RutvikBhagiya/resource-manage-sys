import { ResourceCategory } from "./resource-category"
import { Building } from "./building"
import { ResourceAmenity } from "./resource-amenity"

export interface Resource {
  resourceId: number
  organizationId: number
  categoryId: number
  buildingId: number
  name: string
  floorNumber?: number
  roomNumber?: string
  capacity?: number
  description?: string
  requiresApproval: boolean
  isAvailable: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date

  ResourceCategory?: ResourceCategory
  Building?: Building
  ResourceAmenity?: ResourceAmenity[]
}
