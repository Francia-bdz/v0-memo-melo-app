import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { SongList } from "@/components/song-list"
import { DashboardHeader } from "@/components/dashboard-header"

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: songs } = await supabase
    .from("songs")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })

  const { data: profile } = await supabase.from("profiles").select("display_name").eq("id", user.id).single()

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader displayName={profile?.display_name || "Musicien"} />
      <main className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Mes morceaux</h1>
            <p className="text-muted-foreground mt-1">Suivez votre progression d'apprentissage sur tous vos morceaux</p>
          </div>
          <Link href="/dashboard/songs/new">
            <Button size="lg">
              <Plus className="h-5 w-5 mr-2" />
              Ajouter un morceau
            </Button>
          </Link>
        </div>
        <SongList songs={songs || []} />
      </main>
    </div>
  )
}
