export interface Resource {
  resourceId: number
  name: string
  capacity?: number | null
  requiresApproval: boolean
  building: {
    name: string
  }
  category: {
    name: string
  }
}
