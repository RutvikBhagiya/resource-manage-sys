import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth" 
import { prisma } from "@/lib/prisma"
import { validate } from "@/lib/utils/validate"
import { categorySchema } from "@/lib/validators/category.schema"

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
        const result = validate(categorySchema, json)

        if(!result.success){
            return result.response
        }
        const data = result.data
        const category = await prisma.resourceCategory.create({
            data: {
                name: data.name,
                organizationId: session.user.organizationId as number
            }
        })

        return Response.json(category, {status: 201})
    }
    catch (error) {
        console.error("Error creating category:", error);
        return Response.json("Failed to create category",{status: 500});
    }
}

export async function GET(){
    try{
        const categories = await prisma.resourceCategory.findMany();

        return Response.json(categories);
    }
    catch(error){
        console.error("Error fetching categories:", error);
        return Response.json("Failed to fetch categories",{status: 500})
    }
}
