import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth" 
import { prisma } from "@/lib/prisma"
import { validate } from "@/lib/utils/validate"
import { resourceCreateSchema } from "@/lib/validators/resource.schema"

export async function POST(req: Request) {
    try{
        const session = await getServerSession(authOptions)

        if(!session){
            return new Response("Unauthorized", { status: 401 })
        }

        if (session.user.role !== "ADMIN") {
            return new Response("Forbidden", { status: 403 })
        }

        const json = await req.json()
        const result = validate(resourceCreateSchema, json)

        if(!result.success){
            return result.response
        }
        const data = result.data

        const resource = await prisma.resource.create({
            data: {
                ...data,
                organizationId: session.user.organizationId
            }
        })

        return Response.json(resource, {status: 201})
    }
    catch (error) {
        console.error("Error creating resource:", error);
        return Response.json("Failed to create resource",{status: 500});
    }
}

export async function GET(){
    try{
        const resources = await prisma.resource.findMany();

        return Response.json(resources);
    }
    catch(error){
        console.error("Error fetching resources:", error);
        return Response.json("Failed to fetch resources",{status: 500})
    }
}
