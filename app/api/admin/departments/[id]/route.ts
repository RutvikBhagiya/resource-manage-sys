import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validate } from "@/lib/utils/validate"
import { departmentUpdateSchema } from "@/lib/validators/department.schema"

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
        const departmentId = Number(id)

        if (isNaN(departmentId)) {
            return new Response("Invalid department id", { status: 400 })
        }

        const department = await prisma.department.findUnique({
            where: { departmentId },
        })

        if (!department) {
            return new Response("Department not found", { status: 404 })
        }

        const json = await req.json()
        const result = await validate(departmentUpdateSchema,json)

        if(!result.success){
            return result.response
        }

        const updatedDepartment = await prisma.department.update({
            where: { 
                departmentId,
                organizationId: session.user.organizationId as number,
             },
            data: result.data
        })

        return Response.json(updatedDepartment)
    } 
    catch (error) {
        console.error("Error updating department:", error)
        return new Response("Failed to update department", { status: 500 })
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
        const departmentId = Number(id)
        if (isNaN(departmentId)) {
            return new Response("Invalid department id", { status: 400 })
        }

        const department = await prisma.department.findUnique({
            where: {departmentId},
            select: {organizationId:true},
        })

        if (!department) {
            return new Response("Department not found", { status: 404 })
        }
        if (session.user.role === "ADMIN" && department.organizationId !== session.user.organizationId) {
            return new Response("Forbidden", { status: 403 })
        }

        await prisma.department.update({
            where: { departmentId },
            data: { isActive: false },
        })
        return Response.json({ message: "Department deleted successfully" })
    }
    catch(error){
        console.error("Error deleting department:", error);
        return Response.json("Failed to delete department",{status: 500})
    }
}
