import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { resourceCategoryUpdateSchema } from "@/lib/validators/resourceCategory.schema"
import { validate } from "@/lib/utils/validate"

export async function PATCH(req: Request, {params}: {params: Promise<{id:String}>}) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return new Response("Unauthorized", { status: 401 })
        }

        if (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN") {
            return new Response("Forbidden", { status: 403 })
        }

        const { id } = await params
        const categoryId = Number(id)

        if (isNaN(categoryId)) {
            return new Response("Invalid category id", { status: 400 })
        }

        const category = await prisma.resourceCategory.findUnique({
            where: { categoryId },
        })

        if (!category) {
            return new Response("Resource category not found", { status: 404 })
        }

        const json = await req.json()
        const result = await validate(resourceCategoryUpdateSchema,json)

        if(!result.success){
            return result.response
        }

        const updatedCategory = await prisma.resourceCategory.update({
            where: { 
                categoryId,
                organizationId: session.user.organizationId as number
             },
            data: result.data
        })

        return Response.json(updatedCategory)
    } 
    catch (error) {
        console.error("Error updating resource category:", error)
        return new Response("Failed to update resource category", { status: 500 })
    }
}

export async function DELETE(req: Request, {params}: {params:Promise<{id: String}>}){
    try{
        const { id } = await params 
        const session = await getServerSession(authOptions)
        
        if(!session){
            return new Response("Unauthorized", { status: 401 })
        }

        if(session.user.role !== "ADMIN"){
            return new Response("Forbidden", { status: 403 })            
        }
        
        const categoryId = Number(id)
        if (isNaN(categoryId)) {
            return new Response("Invalid resource category id", { status: 400 })
        }

        const resourceCategory = await prisma.resourceCategory.findUnique({
            where: {categoryId},
            select: {organizationId:true},
        })

        if (!resourceCategory) {
            return new Response("Resource category not found", { status: 404 })
        }
        if (session.user.role === "ADMIN" && resourceCategory.organizationId !== session.user.organizationId) {
            return new Response("Forbidden", { status: 403 })
        }

        await prisma.resourceCategory.update({
            where: { categoryId },
            data: { isActive: false },
        })
        
        return Response.json({ message: "Resource category deleted successfully" })
    }
    catch(error){
        console.error("Error deleting resource category:", error);
        return Response.json("Failed to delete resource category",{status: 500})
    }
}