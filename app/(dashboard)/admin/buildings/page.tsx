import { BuildingGrid } from "@/components/building/BuildingGrid"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"

export default async function BuildingsPage() {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
        redirect("/login")
    }

    return (
        <div className="p-6">
            <BuildingGrid />
        </div>
    )
}
