import Link from "next/link"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { ArrowRight, Shield, Calendar, Users, BarChart3, Lock } from "lucide-react"

// Shadcn UI Imports
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default async function LandingPage() {
  // 1. SMART REDIRECT LOGIC
  const session = await getServerSession(authOptions)

  if (session) {
    const role = session.user.role
    
    // Redirect based on role (Match your sidebar links)
    switch (role) {
      case "SUPER_ADMIN":
        redirect("/super-admin")
      case "ADMIN":
        redirect("/admin")
      case "STAFF":
        redirect("/dashboard")
      case "USER":
      default:
        redirect("/user")
    }
  }

  // 2. LANDING PAGE UI (Only visible to guests)
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      
      {/* HEADER */}
      <header className="px-6 h-16 flex items-center justify-between border-b bg-background/60 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-2 font-bold text-xl">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
            <Lock className="h-5 w-5" />
          </div>
          <span>ResourceOS</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login">
            <Button variant="ghost">Sign In</Button>
          </Link>
          <Link href="/register">
            <Button>Get Started</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        {/* HERO SECTION */}
        <section className="py-20 md:py-32 px-6 text-center max-w-5xl mx-auto space-y-8">
          <Badge variant="outline" className="px-4 py-1 text-sm rounded-full border-primary/20 bg-primary/5 text-primary">
            v2.0 Now Available
          </Badge>
          
          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight">
            Manage Resources <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-cyan-500 dark:from-violet-400 dark:to-cyan-400">
              Without the Chaos
            </span>
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            The intelligent booking system for modern organizations. 
            Schedule rooms, track equipment, and manage approvals in one seamless platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link href="/login">
              <Button size="lg" className="h-12 px-8 text-lg rounded-full shadow-lg shadow-primary/20">
                Launch Dashboard <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="lg" variant="outline" className="h-12 px-8 text-lg rounded-full">
                Learn More
              </Button>
            </Link>
          </div>
        </section>

        {/* FEATURES GRID */}
        <section id="features" className="py-20 bg-muted/30 border-t">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              
              <FeatureCard 
                icon={Calendar}
                title="Smart Scheduling"
                description="Real-time availability checking with conflict detection. Book rooms and equipment in seconds."
              />
              
              <FeatureCard 
                icon={Shield}
                title="Role-Based Access"
                description="Granular permissions for Super Admins, Org Admins, Staff, and Users. Secure by design."
              />
              
              <FeatureCard 
                icon={BarChart3}
                title="Insightful Analytics"
                description="Track usage patterns, optimize resource allocation, and generate detailed utilization reports."
              />

            </div>
          </div>
        </section>

        {/* SOCIAL PROOF / STATS (Optional) */}
        <section className="py-20 px-6 text-center">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <Stat number="99.9%" label="Uptime" />
            <Stat number="50k+" label="Bookings" />
            <Stat number="100+" label="Organizations" />
            <Stat number="24/7" label="Support" />
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="py-8 border-t text-center text-sm text-muted-foreground">
        <p>© 2026 Resource Management System. All rights reserved.</p>
      </footer>
    </div>
  )
}

// Helper Components for the Landing Page
function FeatureCard({ icon: Icon, title, description }: { icon: any, title: string, description: string }) {
  return (
    <Card className="border-none shadow-none bg-background/50 backdrop-blur-sm">
      <CardHeader>
        <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-4">
          <Icon className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  )
}

function Stat({ number, label }: { number: string, label: string }) {
  return (
    <div className="space-y-2">
      <div className="text-3xl font-bold text-primary">{number}</div>
      <div className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{label}</div>
    </div>
  )
}