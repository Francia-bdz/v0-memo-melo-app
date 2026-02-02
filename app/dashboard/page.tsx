import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { SongList } from "@/components/song-list"
import { DashboardMenu } from "@/components/dashboard-menu"

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>
}) {
  const supabase = await createClient()
  const { page } = await searchParams

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  // Pagination settings
  const currentPage = Number(page) || 1
  const itemsPerPage = 9
  const offset = (currentPage - 1) * itemsPerPage

  // Get total count for pagination
  const { count } = await supabase
    .from("songs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)

  const totalPages = Math.ceil((count || 0) / itemsPerPage)

  const { data: songs } = await supabase
    .from("songs")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .range(offset, offset + itemsPerPage - 1)

  return (
    <div className="min-h-screen bg-[#008B44] p-2 sm:p-3 md:p-4">
      <div className="min-h-[calc(100vh-16px)] sm:min-h-[calc(100vh-24px)] md:min-h-[calc(100vh-32px)] bg-[#F0EEE1] px-6 sm:px-12 md:px-16 lg:px-20 py-10 sm:py-14 md:py-16">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-caprasimo text-4xl sm:text-5xl md:text-6xl text-[#18160C] leading-tight">
              Mon repertoire
            </h1>
            <p className="font-sans text-xl sm:text-2xl md:text-[30px] font-medium text-[#18160C] mt-2">
              Tous tes morceaux. Meme les chaotiques.
            </p>
          </div>
          
          <DashboardMenu />
        </div>

        {/* Add melody button */}
        <Link href="/dashboard/songs/new">
          <button className="flex items-center gap-5 bg-[#009A4B] text-[#F0EEE1] px-5 py-3 font-sans font-extrabold text-lg uppercase mb-8">
            Ajouter une melodie
            <span className="relative w-[14px] h-[14px]">
              <span className="absolute top-1/2 left-0 w-full h-[4px] bg-[#F0EEE1] -translate-y-1/2" />
              <span className="absolute left-1/2 top-0 w-[4px] h-full bg-[#F0EEE1] -translate-x-1/2" />
            </span>
          </button>
        </Link>

        {/* Song list */}
        <SongList songs={songs || []} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <Link 
              href={currentPage > 1 ? `/dashboard?page=${currentPage - 1}` : "#"}
              className={`text-[#000000] ${currentPage <= 1 ? "opacity-30 pointer-events-none" : ""}`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
            
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number
              if (totalPages <= 5) {
                pageNum = i + 1
              } else if (currentPage <= 3) {
                pageNum = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i
              } else {
                pageNum = currentPage - 2 + i
              }
              
              return (
                <Link
                  key={pageNum}
                  href={`/dashboard?page=${pageNum}`}
                  className={`font-sans text-2xl tracking-tight ${
                    pageNum === currentPage ? "font-extrabold" : "font-normal"
                  } text-[#000000]`}
                >
                  {pageNum}
                </Link>
              )
            })}
            
            <Link 
              href={currentPage < totalPages ? `/dashboard?page=${currentPage + 1}` : "#"}
              className={`text-[#000000] ${currentPage >= totalPages ? "opacity-30 pointer-events-none" : ""}`}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
