import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { SongList } from "@/components/song-list";
import { DashboardMenu } from "@/components/dashboard-menu";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const supabase = await createClient();
  const { page } = await searchParams;

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user) {
    redirect("/auth/login");
  }

  // Pagination settings
  const currentPage = Number(page) || 1;
  const itemsPerPage = 9;
  const offset = (currentPage - 1) * itemsPerPage;

  // Get total count for pagination
  const { count } = await supabase
    .from("songs")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id);

  const totalPages = Math.ceil((count || 0) / itemsPerPage);

  const { data: songs } = await supabase
    .from("songs")
    .select("*")
    .eq("user_id", user.id)
    .order("updated_at", { ascending: false })
    .range(offset, offset + itemsPerPage - 1);

  return (
    <div className="min-h-screen bg-primary p-2 sm:p-3 md:p-4">
      <div className="min-h-[calc(100vh-16px)] sm:min-h-[calc(100vh-24px)] md:min-h-[calc(100vh-32px)] bg-background px-6 sm:px-12 md:px-16 lg:px-20 py-10 sm:py-14 md:py-16">
        {/* Header */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="font-caprasimo text-4xl sm:text-5xl md:text-6xl text-foreground leading-tight">
              Mon repertoire
            </h1>
            <p className="font-sans text-lg sm:text-xl md:text-2xl font-medium text-foreground">
              Tous tes morceaux. Meme les chaotiques.
            </p>
          </div>

          <DashboardMenu />
        </div>

        <Button
          asChild
          size="lg"
          className="font-extrabold text-lg uppercase px-6 sm:px-8 py-3 sm:py-4 h-auto mb-8"
        >
          <Link href="/dashboard/songs/new">
            <span>{"Ajouter une melodie"}</span>
            <Plus className="h-5 w-5" strokeWidth={3} />
          </Link>
        </Button>

        {/* Song list */}
        <SongList songs={songs || []} />

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-4 mt-10">
            <Link
              href={
                currentPage > 1 ? `/dashboard?page=${currentPage - 1}` : "#"
              }
              className={`text-[#000000] ${currentPage <= 1 ? "opacity-30 pointer-events-none" : ""}`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M10 12L6 8L10 4"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>

            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 5) {
                pageNum = i + 1;
              } else if (currentPage <= 3) {
                pageNum = i + 1;
              } else if (currentPage >= totalPages - 2) {
                pageNum = totalPages - 4 + i;
              } else {
                pageNum = currentPage - 2 + i;
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
              );
            })}

            <Link
              href={
                currentPage < totalPages
                  ? `/dashboard?page=${currentPage + 1}`
                  : "#"
              }
              className={`text-[#000000] ${currentPage >= totalPages ? "opacity-30 pointer-events-none" : ""}`}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 4L10 8L6 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
