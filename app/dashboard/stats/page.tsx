import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardMenu } from "@/components/dashboard-menu"
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

  const { data: songs } = await supabase.from("songs").select("*, instruments(*)").eq("user_id", user.id)

  const { data: instruments } = await supabase.from("instruments").select("*")

  const { data: allEvaluations } = await supabase
    .from("evaluations")
    .select("*, songs(*), instrument_elements(*)")
    .eq("user_id", user.id)
    .order("evaluated_at", { ascending: false })

  return (
    <div className="min-h-screen bg-primary p-2 sm:p-3 md:p-4">
      <div className="min-h-[calc(100vh-16px)] sm:min-h-[calc(100vh-24px)] md:min-h-[calc(100vh-32px)] bg-background px-6 sm:px-12 md:px-16 lg:px-20 py-10 sm:py-14 md:py-16">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-caprasimo text-4xl sm:text-5xl md:text-6xl text-foreground leading-tight">
              Statistiques
            </h1>
            <p className="font-sans text-lg sm:text-xl md:text-2xl font-medium text-foreground">
              Suis tes progres. Celebre tes victoires.
            </p>
          </div>

          <DashboardMenu />
        </div>

        {/* Stats Content */}
        <StatsOverview songs={songs || []} instruments={instruments || []} evaluations={allEvaluations || []} />
      </div>
    </div>
  )
}
