export interface ResourceAmenity {
    amenityId: number
    resourceId: number
    name: string
    type: string
    quantity?: number
    isWorking: boolean

    Resource?: {
        name: string
    }
}
