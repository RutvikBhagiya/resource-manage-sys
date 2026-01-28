export interface Resource {
  resourceId: number
  name: string
  capacity?: number | null
  requiresApproval: boolean
  createdAt: string
  Building: {
    name: string
  }
  ResourceCategory: {
    name: string
  }
}
