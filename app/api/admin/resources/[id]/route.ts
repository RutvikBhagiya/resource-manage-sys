import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { resourceUpdateSchema } from "@/lib/validators/resource.schema"
import { validate } from "@/lib/utils/validate"

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
        const resourceId = Number(id)

        if (isNaN(resourceId)) {
            return new Response("Invalid resource id", { status: 400 })
        }

        const resource = await prisma.resource.findUnique({
            where: { resourceId },
        })

        if (!resource) {
            return new Response("Resource not found", { status: 404 })
        }

        const json = await req.json()
        const result = await validate(resourceUpdateSchema,json)

        if(!result.success){
            return result.response
        }

        const updatedResource = await prisma.resource.update({
            where: { 
                resourceId,
                organizationId: session.user.organizationId,
             },
            data: result.data
        })

        return Response.json(updatedResource)
    } 
    catch (error) {
        console.error("Error updating resource:", error)
        return new Response("Failed to update resource", { status: 500 })
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
        const resourceId = Number(id)
        if (isNaN(resourceId)) {
            return new Response("Invalid resource id", { status: 400 })
        }

        const resource = await prisma.resource.findUnique({
            where: {resourceId},
            select: {organizationId:true},
        })

        if (!resource) {
            return new Response("Resource not found", { status: 404 })
        }
        if (session.user.role === "ADMIN" && resource.organizationId !== session.user.organizationId) {
            return new Response("Forbidden", { status: 403 })
        }

        await prisma.resource.update({
            where: { resourceId },
            data: { isActive: false },
        })

        return Response.json({ message: "Resource deleted successfully" })
    }
    catch(error){
        console.error("Error deleting resource:", error);
        return Response.json("Failed to delete resource",{status: 500})
    }
}