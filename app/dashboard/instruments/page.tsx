import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { InstrumentManager } from "@/components/instrument-manager"

export default async function InstrumentsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single()

  const { data: instruments } = await supabase
    .from("instruments")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: true })

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader displayName={profile?.display_name || "Musician"} />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">My Instruments</h1>
          <p className="text-muted-foreground mt-1">
            Manage the instruments you use to learn songs. Add instruments to track your progress separately for each
            one.
          </p>
        </div>
        <InstrumentManager instruments={instruments || []} />
      </main>
    </div>
  )
}
