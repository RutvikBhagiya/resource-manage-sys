// "use client"

// import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from "@/components/ui/table"
// import { Button } from "@/components/ui/button"
// import { Skeleton } from "@/components/ui/skeleton"
// import { useEffect, useState } from "react"
// import { Organization } from "@/types/organization"


// export default function OrganizationTable() {
//   const [data, setData] = useState<Organization[]>([])
//   const [loading, setLoading] = useState(true)

//   useEffect(() => {
//     fetch("/api/super-admin/organizations")
//       .then(res => res.json())
//       .then(data => {
//         setData(data)
//         setLoading(false)
//       })
//       .catch(() => setLoading(false))
//   }, [])

//   return (
//     <div className="rounded-md border">
//       <Table>
//         <TableHeader>
//           <TableRow>
//             <TableHead>Name</TableHead>
//             <TableHead>Type</TableHead>
//             <TableHead>Email</TableHead>
//             <TableHead>Phone</TableHead>
//             <TableHead>Address</TableHead>
//             <TableHead>Active</TableHead>
//             <TableHead>Created At</TableHead>
//             <TableHead className="text-right">Actions</TableHead>
//           </TableRow>
//         </TableHeader>

//         <TableBody>
//           {loading ? (
//             <SkeletonRows />
//           ) : data.length === 0 ? (
//             <TableRow>
//               <TableCell colSpan={3} className="text-center">
//                 No organizations found
//               </TableCell>
//             </TableRow>
//           ) : (
//             data.map(org => (
//               <TableRow key={org.organizationId}>
//                 <TableCell>{org.name}</TableCell>
//                 <TableCell>{org.type}</TableCell>
//                 <TableCell>{org.email ?? "-"}</TableCell>
//                 <TableCell>{org.phone ?? "-"}</TableCell>
//                 <TableCell>{org.address ?? "-"}</TableCell>
//                 <TableCell>{org.isActive? "Yes":"No"}</TableCell>
//                 <TableCell>{new Date(org.createdAt).toLocaleDateString()}</TableCell>
//                 <TableCell className="text-right space-x-2">
//                   <Button size="sm" variant="outline">
//                     Edit
//                   </Button>

//                   <Button size="sm" variant="destructive">
//                     Delete
//                   </Button>
//                 </TableCell>
//               </TableRow>
//             ))
//           )}
//         </TableBody>
//       </Table>
//     </div>
//   )
// }

// function SkeletonRows() {
//   return (
//     <>
//       {[...Array(5)].map((_, i) => (
//         <TableRow key={i}>
//           <TableCell>
//             <Skeleton className="h-4 w-[200px]" />
//           </TableCell>

//           <TableCell>
//             <Skeleton className="h-4 w-[120px]" />
//           </TableCell>

//           <TableCell className="text-right">
//             <Skeleton className="h-8 w-[140px] ml-auto" />
//           </TableCell>
//         </TableRow>
//       ))}
//     </>
//   )
// }

"use client"

import { useEffect, useState } from "react"
import {flexRender,getCoreRowModel,getFilteredRowModel,getPaginationRowModel,getSortedRowModel,useReactTable,SortingState,ColumnFiltersState} from "@tanstack/react-table"
import {Table,TableBody,TableCell,TableHead,TableHeader,TableRow} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Organization } from "@/types/organization"
import { columns } from "./columns"

export default function OrganizationTable() {
  const [data, setData] = useState<Organization[]>([])
  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] =
    useState<ColumnFiltersState>([])

  useEffect(() => {
    fetch("/api/super-admin/organizations")
      .then(res => res.json())
      .then(setData)
  }, [])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,

    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),

    state: {
      sorting,
      columnFilters
    }
  })

  return (
    <div className="w-full">

      <div className="py-4">
        <Input
          placeholder="Search name..."
          value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
          onChange={(e) =>
            table.getColumn("name")?.setFilterValue(e.target.value)
          }
          className="max-w-sm"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map(headerGroup => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map(row => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center">
                  No organizations found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex justify-end gap-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}
