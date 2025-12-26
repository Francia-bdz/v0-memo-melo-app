import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { StatsOverview } from "@/components/stats-overview"

export default async function StatsPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single()

  // Get all songs with their elements and latest evaluations
  const { data: songs } = await supabase.from("songs").select("*, song_elements(*)").eq("user_id", user.id)

  const { data: instruments } = await supabase.from("instruments").select("*").eq("user_id", user.id)

  const { data: allEvaluations } = await supabase
    .from("evaluations")
    .select("*, song_elements(*, songs(*)), instruments(*)")
    .eq("user_id", user.id)
    .order("evaluated_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader displayName={profile?.display_name || "Musician"} />
      <main className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Learning Statistics</h1>
          <p className="text-muted-foreground mt-1">Track your progress across all songs and instruments</p>
        </div>
        <StatsOverview songs={songs || []} instruments={instruments || []} evaluations={allEvaluations || []} />
      </main>
    </div>
  )
}
