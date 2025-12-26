import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { EvaluationForm } from "@/components/evaluation-form"
import { notFound } from "next/navigation"

interface PageProps {
  params: Promise<{ elementId: string; instrumentId: string }>
}

export default async function EvaluatePage({ params }: PageProps) {
  const { elementId, instrumentId } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single()

  const { data: element } = await supabase.from("song_elements").select("*, songs(*)").eq("id", elementId).single()

  if (!element) {
    notFound()
  }

  const { data: instrument } = await supabase
    .from("instruments")
    .select("*")
    .eq("id", instrumentId)
    .eq("user_id", user.id)
    .single()

  if (!instrument) {
    notFound()
  }

  const { data: latestEvaluation } = await supabase
    .from("evaluations")
    .select("*")
    .eq("song_element_id", elementId)
    .eq("instrument_id", instrumentId)
    .eq("user_id", user.id)
    .order("evaluated_at", { ascending: false })
    .limit(1)
    .single()

  const { data: allEvaluations } = await supabase
    .from("evaluations")
    .select("*")
    .eq("song_element_id", elementId)
    .eq("instrument_id", instrumentId)
    .eq("user_id", user.id)
    .order("evaluated_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader displayName={profile?.display_name || "Musician"} />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <EvaluationForm
          element={element}
          instrument={instrument}
          latestEvaluation={latestEvaluation}
          allEvaluations={allEvaluations || []}
        />
      </main>
    </div>
  )
}
