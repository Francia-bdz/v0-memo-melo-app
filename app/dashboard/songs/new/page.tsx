import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { NewSongForm } from "@/components/new-song-form"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function NewSongPage() {
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-[var(--vert-700)]">
      <div className="mx-4 my-4">
        <div className="bg-background min-h-[calc(100vh-32px)] p-6 sm:p-10 lg:p-16">
          {/* Header */}
          <div className="flex items-start justify-between mb-8">
            <div>
              <h1 className="font-caprasimo text-5xl sm:text-6xl lg:text-[64px] leading-tight text-foreground">
                Ajouter une mélodie
              </h1>
              <p className="font-sans text-2xl sm:text-[30px] font-medium text-foreground mt-2">
                Pour avoir une corde de plus à sa guitare
              </p>
            </div>
            
            <Link
              href="/dashboard"
              className="flex items-center gap-5 px-5 py-3 border-3 border-foreground font-sans text-2xl font-extrabold uppercase text-foreground hover:bg-foreground/5 transition-colors"
              style={{ borderWidth: "3px" }}
            >
              Menu
              <Plus className="h-4 w-4" strokeWidth={4} />
            </Link>
          </div>

          {/* Form */}
          <NewSongForm />
        </div>
      </div>
    </div>
  )
}
