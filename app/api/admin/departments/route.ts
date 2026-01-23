import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { validate } from "@/lib/utils/validate"
import { departmentCreateSchema } from "@/lib/validators/department.schema"

export async function POST(req : Request){
    try{
        const session = await getServerSession(authOptions)

        if(!session){
            return new Response("Unauthorized",{status:401})
        }

        if(session.user.role !== "ADMIN"){
            return new Response("Forbidden", {status:403})
        }

        const json = await req.json()
        const result = validate(departmentCreateSchema, json)

        if(!result.success){
            return result.response
        }
        const data = result.data

        const department = await prisma.department.create({
            data : {
                ...data,
                organizationId: session?.user.organizationId
            }
        })

        return Response.json(department, {status:201})
    }
    catch(error){
        console.error("Error Creating department:", error);
        return Response.json("Failed to create department",{status: 500})
    }
}

export async function GET(){
    try{
        const departments = await prisma.department.findMany()

        return Response.json(departments)
    }
    catch(error){
        console.error("Error fetching departments:", error);
        return Response.json("Failed to fetch departments",{status: 500})
    }
}