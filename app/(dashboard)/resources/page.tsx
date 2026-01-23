import { prisma } from "@/lib/prisma"
import { ResourceCard } from "@/components/dashboard/ResourceCard"
import { Search } from "lucide-react"

export default async function ResourcesPage() {
    const resources = await prisma.resource.findMany({
        include: {
            ResourceCategory: true,
            Building: true,
        },
        take: 20
    })

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-zinc-100">Resources</h1>
                    <p className="text-zinc-400">Browse and book available rooms and equipment.</p>
                </div>

                {/* Helper Actions */}
                <div className="flex gap-2">
                    <button className="flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-500 transition-colors shadow-lg shadow-violet-500/20">
                        Add Resource
                    </button>
                </div>
            </div>

            {/* Filters Bar Placeholder */}
            <div className="flex items-center gap-4 overflow-x-auto pb-2">
                {["All", "Meeting Rooms", "Labs", "Auditoriums"].map((filter, i) => (
                    <button key={filter} className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all ${i === 0 ? 'bg-white text-zinc-950 shadow-lg' : 'bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-zinc-200'}`}>
                        {filter}
                    </button>
                ))}
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {resources.map((resource) => (
                    <ResourceCard
                        key={resource.resourceId}
                        id={resource.resourceId}
                        name={resource.name}
                        type={resource.ResourceCategory.name}
                        capacity={resource.capacity}
                        location={resource.Building.name}
                    />
                ))}
                {resources.length === 0 && (
                    <div className="col-span-full py-12 text-center text-zinc-500">
                        No resources found.
                    </div>
                )}
            </div>
        </div>
    )
}
