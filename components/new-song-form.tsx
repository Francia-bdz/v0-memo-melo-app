"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, ChevronDown } from "lucide-react"
import type { Instrument, InstrumentElement, ElementEvaluation } from "@/lib/types/database"
import { MusicNoteRating } from "@/components/music-note-rating"

export function NewSongForm() {
  const [title, setTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [partitionUrl, setPartitionUrl] = useState("")
  const [musicUrl, setMusicUrl] = useState("")
  const [notes, setNotes] = useState("")
  const [instrumentId, setInstrumentId] = useState<string>("")
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [instrumentElements, setInstrumentElements] = useState<InstrumentElement[]>([])
  const [evaluations, setEvaluations] = useState<Record<string, ElementEvaluation>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadInstruments = async () => {
      const { data } = await supabase.from("instruments").select("*").order("name")
      if (data) {
        setInstruments(data)
        if (data.length === 1) {
          setInstrumentId(data[0].id)
        }
      }
    }
    loadInstruments()
  }, [supabase])

  useEffect(() => {
    const loadElements = async () => {
      if (!instrumentId) {
        setInstrumentElements([])
        setEvaluations({})
        return
      }

      const { data } = await supabase
        .from("instrument_elements")
        .select("*")
        .eq("instrument_id", instrumentId)
        .order("order_index")

      if (data) {
        setInstrumentElements(data)
        const initialEvals: Record<string, ElementEvaluation> = {}
        data.forEach((elem) => {
          initialEvals[elem.id] = {
            instrument_element_id: elem.id,
            level: 1,
            notes: null,
          }
        })
        setEvaluations(initialEvals)
      }
    }
    loadElements()
  }, [instrumentId, supabase])

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
          partition_url: partitionUrl || null,
          music_url: musicUrl || null,
          instrument_id: instrumentId || null,
        })
        .select()
        .single()

      if (insertError) throw insertError

      const evaluationsToInsert = Object.values(evaluations)
        .filter((ev) => ev.level !== null)
        .map((ev) => ({
          song_id: song.id,
          user_id: user.id,
          instrument_element_id: ev.instrument_element_id,
          level: ev.level,
          notes: ev.notes,
          evaluated_at: new Date().toISOString(),
        }))

      if (evaluationsToInsert.length > 0) {
        const { error: evalError } = await supabase.from("evaluations").insert(evaluationsToInsert)
        if (evalError) throw evalError
      }

      router.push(`/dashboard/songs/${song.id}`)
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Une erreur s'est produite")
    } finally {
      setIsLoading(false)
    }
  }

  const getLevelLabel = (level: number | null): string => {
    switch (level) {
      case 1:
        return "À peine"
      case 2:
        return "Découverte"
      case 3:
        return "En cours"
      case 4:
        return "Acquis"
      case 5:
        return "Maîtrisé"
      default:
        return "À peine"
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
        {/* Left Column - Information sur le morceau */}
        <div className="space-y-6">
          <h2 className="font-sans text-[28px] font-black leading-8 text-foreground">
            Information sur le morceau
          </h2>

          <div className="space-y-1.5">
            <label className="font-sans text-xl font-extrabold uppercase text-foreground">
              Titre du morceau *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-10 px-3 border-3 border-foreground bg-transparent font-sans text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ borderWidth: "3px" }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-sans text-xl font-extrabold uppercase text-foreground">
              Artiste
            </label>
            <input
              type="text"
              value={artist}
              onChange={(e) => setArtist(e.target.value)}
              className="w-full h-10 px-3 border-3 border-foreground bg-transparent font-sans text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ borderWidth: "3px" }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-sans text-xl font-extrabold uppercase text-foreground">
              Lien vers la partition
            </label>
            <input
              type="url"
              value={partitionUrl}
              onChange={(e) => setPartitionUrl(e.target.value)}
              className="w-full h-10 px-3 border-3 border-foreground bg-transparent font-sans text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ borderWidth: "3px" }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-sans text-xl font-extrabold uppercase text-foreground">
              Lien vers la musique (Youtube, Spotify, Deezer...)
            </label>
            <input
              type="url"
              value={musicUrl}
              onChange={(e) => setMusicUrl(e.target.value)}
              className="w-full h-10 px-3 border-3 border-foreground bg-transparent font-sans text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ borderWidth: "3px" }}
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-sans text-xl font-extrabold uppercase text-foreground">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border-3 border-foreground bg-transparent font-sans text-lg font-medium focus:outline-none focus:ring-2 focus:ring-primary resize-none"
              style={{ borderWidth: "3px" }}
            />
          </div>
        </div>

        {/* Right Column - Éléments d'apprentissage */}
        <div className="space-y-6">
          <h2 className="font-sans text-[28px] font-black leading-8 text-foreground">
            Éléments d'apprentissage
          </h2>

          <div className="space-y-1.5">
            <label className="font-sans text-xl font-extrabold uppercase text-foreground">
              Instrument
            </label>
            <div className="relative">
              <select
                value={instrumentId}
                onChange={(e) => setInstrumentId(e.target.value)}
                required
                className="w-auto min-w-[130px] h-10 px-3 pr-8 border-3 border-foreground bg-transparent font-sans text-2xl font-semibold focus:outline-none focus:ring-2 focus:ring-primary appearance-none cursor-pointer"
                style={{ borderWidth: "3px" }}
              >
                <option value="">Choisir</option>
                {instruments.map((instrument) => (
                  <option key={instrument.id} value={instrument.id}>
                    {instrument.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none" />
            </div>
          </div>

          {/* Learning Elements */}
          {instrumentId && instrumentElements.length > 0 && (
            <div className="space-y-4">
              {instrumentElements.map((element) => (
                <div
                  key={element.id}
                  className="p-4 border-3 border-foreground"
                  style={{ borderWidth: "3px" }}
                >
                  <div className="space-y-0.5 mb-3">
                    <h3 className="font-sans text-2xl font-bold text-foreground">
                      {element.name}
                    </h3>
                    {element.description && (
                      <p className="font-sans text-lg font-medium text-foreground">
                        {element.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <MusicNoteRating
                      value={evaluations[element.id]?.level || 1}
                      onChange={(level) =>
                        setEvaluations((prev) => ({
                          ...prev,
                          [element.id]: { ...prev[element.id], level },
                        }))
                      }
                    />
                    <span className="font-sans text-lg font-medium text-foreground/40">
                      {getLevelLabel(evaluations[element.id]?.level)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Validation button */}
          <div className="flex justify-end pt-4">
            {error && <p className="text-sm text-destructive mr-4">{error}</p>}
            <Button
              type="submit"
              disabled={isLoading || !instrumentId}
              className="bg-primary hover:bg-primary/90 text-primary-foreground font-sans text-2xl font-extrabold uppercase px-5 py-3 h-auto flex items-center gap-5"
            >
              {isLoading ? "Validation..." : "Valider"}
              <Plus className="h-4 w-4" strokeWidth={4} />
            </Button>
          </div>
        </div>
      </div>
    </form>
  )
}
