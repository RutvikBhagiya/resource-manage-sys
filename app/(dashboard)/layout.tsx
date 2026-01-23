import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { DashboardShell } from "@/components/dashboard/DashboardShell"

export default async function DashboardLayout({children}: {children: React.ReactNode}) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  return (
    <DashboardShell>
        <main className="p-6">{children}</main>
    </DashboardShell>   
  )
}
