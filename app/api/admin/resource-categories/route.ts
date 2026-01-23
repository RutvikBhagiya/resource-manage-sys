import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth" 
import { prisma } from "@/lib/prisma"
import { validate } from "@/lib/utils/validate"
import { buildingCreateSchema } from "@/lib/validators/building.schema"

export async function POST(req: Request) {
    try{
        const session = await getServerSession(authOptions)

        if (!session) {
            return new Response("Unauthorized", { status: 401 })
        }

        if(session.user.role !== "ADMIN"){
            return new Response("Forbidden", { status: 403 })
        }

        const json = await req.json()
        const result = validate(buildingCreateSchema, json)

        if(!result.success){
            return result.response
        }
        const data = result.data

        const resourceCategory = await prisma.resourceCategory.create({
            data: {
                ...data,
                organizationId: session.user.organizationId
            }
        })

        return Response.json(resourceCategory, {status:201})
    }
    catch (error) {
        console.error("Error creating resource category:", error);
        return Response.json("Failed to create resource category",{ status: 500 });
    }
}

export async function GET(){
    try{
        const resourceCategory = await prisma.resourceCategory.findMany();

        return Response.json(resourceCategory);
    }
    catch(error){
        console.error("Error fetching resource category:", error);
        return Response.json("Failed to fetch resource category",{status: 500})
    }
}