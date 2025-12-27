import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Guitar } from "lucide-react"

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

  const { data: instruments } = await supabase.from("instruments").select("*").order("created_at", { ascending: true })

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader displayName={profile?.display_name || "Musicien"} />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight">Instruments</h1>
          <p className="text-muted-foreground mt-1">
            Les instruments disponibles pour évaluer votre progression. Les instruments sont gérés par l'administrateur.
          </p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Instruments disponibles</CardTitle>
            <CardDescription>
              {instruments && instruments.length > 0
                ? `${instruments.length} instrument${instruments.length > 1 ? "s" : ""} disponible${instruments.length > 1 ? "s" : ""}`
                : "Aucun instrument disponible"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {instruments && instruments.length > 0 ? (
              <div className="space-y-2">
                {instruments.map((instrument) => (
                  <div key={instrument.id} className="flex items-center gap-3 rounded-lg border p-4 bg-muted/30">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Guitar className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{instrument.name}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Aucun instrument disponible pour le moment.
              </p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
