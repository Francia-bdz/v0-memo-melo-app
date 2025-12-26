import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { NewSongForm } from "@/components/new-song-form"

export default async function NewSongPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader displayName={profile?.display_name || "Musician"} />
      <main className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Add New Song</h1>
          <p className="text-muted-foreground mt-1">Start tracking your learning progress for a new song</p>
        </div>
        <NewSongForm />
      </main>
    </div>
  )
}
