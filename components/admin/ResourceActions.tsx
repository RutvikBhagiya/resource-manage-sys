// "use client"

// import { useState } from "react"
// import { useRouter } from "next/navigation"
// import { Trash2 } from "lucide-react"

// import { Button } from "@/components/ui/button"
// import { ResourceFormSheet } from "./ResourceForm" 

// interface ResourceActionsProps {
//   resource: any
//   categories: any[]
//   buildings: any[]
// }

// export function ResourceActions({ resource, categories, buildings }: ResourceActionsProps) {
//   const router = useRouter()
//   const [loading, setLoading] = useState(false)

//   async function onDelete() {
//     if (!confirm("Are you sure? This will disable the resource.")) return

//     setLoading(true)
//     try {
//       const res = await fetch(`/api/admin/resources/${resource.resourceId}`, {
//         method: "DELETE",
//       })

//       if (!res.ok) throw new Error("Failed to delete")

//       router.refresh()
//     } catch (error) {
//       alert("Error deleting resource. Please try again.")
//     } finally {
//       setLoading(false)
//     }
//   }

//   return (
//     <div className="flex items-center gap-2">

//       <ResourceFormSheet 
//         categories={categories} 
//         buildings={buildings} 
//         initialData={resource} 
//       />

//       <Button 
//         variant="destructive" 
//         size="sm"         
//         onClick={onDelete}
//         disabled={loading}
//       >
//         <Trash2 className="h-4 w-4 mr-2" />
//         {loading ? "..." : "Delete"}
//       </Button>
//     </div>
//   )
// }

"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
// CHANGED: Import the new Dialog component
import { ResourceDialog } from "./ResourceDialog"

interface ResourceActionsProps {
  resource: any
  categories: any[]
  buildings: any[]
}

export function ResourceActions({ resource, categories, buildings }: ResourceActionsProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function onDelete() {
    if (!confirm("Are you sure? This will disable the resource.")) return

    setLoading(true)
    try {
      const res = await fetch(`/api/admin/resources/${resource.resourceId}`, {
        method: "DELETE",
      })

      if (!res.ok) throw new Error("Failed to delete")
      toast.success("Resource deleted successfully")
      router.refresh()
    } catch (error) {
      toast.error("Error deleting resource.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center gap-2">
      {/* 1. EDIT BUTTON: Reuses the Dialog, passing initialData */}
      <ResourceDialog
        categories={categories}
        buildings={buildings}
        initialData={resource}
      />

      {/* 2. DELETE BUTTON */}
      <Button
        variant="destructive"
        size="sm"
        onClick={onDelete}
        disabled={loading}
        className="h-9 px-3"
      >
        <Trash2 className="h-4 w-4 mr-2" />
        {loading ? "..." : "Delete"}
      </Button>
    </div>
  )
}