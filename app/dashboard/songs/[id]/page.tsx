import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SongDetailView } from "@/components/song-detail-view"
import { DashboardMenu } from "@/components/dashboard-menu"
import { notFound } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SongDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: song } = await supabase.from("songs").select("*").eq("id", id).eq("user_id", user.id).single()

  if (!song) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-primary p-2 sm:p-3 md:p-4">
      <div className="min-h-[calc(100vh-16px)] sm:min-h-[calc(100vh-24px)] md:min-h-[calc(100vh-32px)] bg-background px-6 sm:px-12 md:px-16 lg:px-20 py-10 sm:py-14 md:py-16">
        <div className="flex justify-between relative z-10">
          <Link
            href="/dashboard"
            className="font-caprasimo text-2xl sm:text-3xl md:text-4xl text-foreground hover:opacity-70 transition-opacity flex items-center"
          >
            <ChevronLeft className="mr-3" />
            {"Retour au repertoire"}
        </Link>
          <DashboardMenu />
        </div>
        <SongDetailView song={song} />
      </div>
    </div>
  )
}
