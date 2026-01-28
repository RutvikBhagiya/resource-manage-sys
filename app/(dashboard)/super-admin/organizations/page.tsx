import OrganizationTable from "@/components/organization/OrganizationTable"

export default function OrganizationsPage() {
  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Organizations</h1>
      <OrganizationTable />
    </div>
  )
}
