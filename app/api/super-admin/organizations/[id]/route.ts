import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validate } from "@/lib/utils/validate"
import { organizationUpdateSchema } from "@/lib/validators/organization.schema"

export async function PATCH(req: Request,{params}: {params: Promise<{ id: string }>}) {
    try {
        const session = await getServerSession(authOptions)

        if (!session) {
            return new Response("Unauthorized", { status: 401 })
        }

        if (session.user.role !== "SUPER_ADMIN") {
            return new Response("Forbidden", { status: 403 })
        }

        const { id } = await params
        const organizationId = Number(id)

        if (isNaN(organizationId)) {
            return new Response("Invalid organization id", { status: 400 })
        }

        const organization = await prisma.organization.findUnique({
            where: { organizationId },
        })

        if (!organization) {
            return new Response("Organization not found", { status: 404 })
        }

        const json = await req.json()
        const result = validate(organizationUpdateSchema,json)

        if(!result.success){
            return result.response
        }

        const updateOrganization = await prisma.organization.update({
            where: { 
                organizationId,
             },
            data: result.data
        })

        return Response.json(updateOrganization)
    } 
    catch (error) {
        console.error("Error updating organization:", error)
        return new Response("Failed to update organization", { status: 500 })
    }
}


export async function DELETE(req: Request, {params}: {params:Promise<{id: String}>}){
    try{        
        const session = await getServerSession(authOptions)
        
        if(!session){
            return new Response("Unauthorized", { status: 401 })
        }

        if(session.user.role !== "SUPER_ADMIN"){
            return new Response("Forbidden", { status: 403 })            
        }
        
        const { id } = await params 
        const organizationId = Number(id)
        if (isNaN(organizationId)) {
            return new Response("Invalid organization id", { status: 400 })
        }

        const organization = await prisma.organization.findUnique({
            where: {organizationId},
            select: {organizationId:true},
        })

        if (!organization) {
            return new Response("Organization not found", { status: 404 })
        }

        await prisma.organization.update({
            where: { organizationId },
            data: { isActive: false },
        })
        return Response.json({ message: "Organization deleted successfully" })
    }
    catch(error){
        console.error("Error deleting organization:", error);
        return Response.json("Failed to delete organization",{status: 500})
    }
}
