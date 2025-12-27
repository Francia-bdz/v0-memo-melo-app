"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

export function NewSongForm() {
  const [title, setTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [notes, setNotes] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Non authentifié")

      const { data: song, error: insertError } = await supabase
        .from("songs")
        .insert({
          user_id: user.id,
          title,
          artist: artist || null,
          notes: notes || null,
        })
        .select()
        .single()

      if (insertError) throw insertError

      router.push(`/dashboard/songs/${song.id}`)
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Une erreur s'est produite")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2 mb-2">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
        </div>
        <CardTitle>Détails du morceau</CardTitle>
        <CardDescription>Entrez les informations sur le morceau que vous souhaitez apprendre</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titre du morceau *</Label>
            <Input
              id="title"
              placeholder="ex: Stairway to Heaven"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="artist">Artiste</Label>
            <Input
              id="artist"
              placeholder="ex: Led Zeppelin"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Notes supplémentaires sur ce morceau..."
              rows={4}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading} className="flex-1">
              {isLoading ? "Ajout du morceau..." : "Ajouter le morceau"}
            </Button>
            <Link href="/dashboard" className="flex-1">
              <Button type="button" variant="outline" className="w-full bg-transparent">
                Annuler
              </Button>
            </Link>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
