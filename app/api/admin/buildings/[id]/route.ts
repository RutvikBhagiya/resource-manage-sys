import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validate } from "@/lib/utils/validate"
import { buildingUpdateSchema } from "@/lib/validators/building.schema"

export async function PATCH(req: Request,{params}: {params: Promise<{ id: string }>}) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return new Response("Unauthorized", { status: 401 })
        }

        if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
            return new Response("Forbidden", { status: 403 })
        }

        const { id } = await params
        const buildingId = Number(id)

        if (isNaN(buildingId)) {
            return new Response("Invalid building id", { status: 400 })
        }

        const building = await prisma.building.findUnique({
            where: { buildingId },
        })

        if (!building) {
            return new Response("Building not found", { status: 404 })
        }

        const json = await req.json()
        const result = validate(buildingUpdateSchema,json)

        if(!result.success){
            return result.response
        }

        const updatedBuilding = await prisma.building.update({
            where: { 
                buildingId,
                organizationId: session.user.organizationId as number,
             },
            data: result.data
        })

        return Response.json(updatedBuilding)
    } 
    catch (error) {
        console.error("Error updating building:", error)
        return new Response("Failed to update building", { status: 500 })
    }
}


export async function DELETE(req: Request, {params}: {params:Promise<{id: String}>}){
    try{        
        const session = await getServerSession(authOptions)
        
        if(!session){
            return new Response("Unauthorized", { status: 401 })
        }

        if(session.user.role !== "ADMIN"){
            return new Response("Forbidden", { status: 403 })            
        }
        
        const { id } = await params 
        const buildingId = Number(id)
        if (isNaN(buildingId)) {
            return new Response("Invalid building id", { status: 400 })
        }

        const building = await prisma.building.findUnique({
            where: {buildingId},
            select: {organizationId:true},
        })

        if (!building) {
            return new Response("Building not found", { status: 404 })
        }
        if (session.user.role === "ADMIN" && building.organizationId !== session.user.organizationId) {
            return new Response("Forbidden", { status: 403 })
        }

        await prisma.building.update({
            where: { buildingId },
            data: { isActive: false },
        })
        return Response.json({ message: "Building deleted successfully" })
    }
    catch(error){
        console.error("Error deleting building:", error);
        return Response.json("Failed to delete building",{status: 500})
    }
}
