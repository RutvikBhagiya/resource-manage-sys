import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const organizations = await prisma.organization.findMany({
            select: {
                organizationId: true,
                name: true,
            },
        });
        return NextResponse.json(organizations);
    } 
    catch (error) {
        console.error("Error fetching organizations:", error);
        return NextResponse.json(
            { error: "Failed to fetch organizations" },
            { status: 500 }
        );
    }
}
