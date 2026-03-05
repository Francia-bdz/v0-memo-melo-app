"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronRight } from "lucide-react"
import type { Song, Instrument, InstrumentElement, ElementEvaluation } from "@/lib/types/database"
import { MusicNoteRating } from "@/components/music-note-rating"

interface EditSongDialogProps {
  song: Song
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

const getLevelLabel = (level: number | null) => {
  if (level === null) return "Non evalue"
  const labels: Record<number, string> = {
    1: "Decouverte",
    2: "En cours",
    3: "Acquis de base",
    4: "Solide",
    5: "Maitrise",
  }
  return labels[level] || "Non evalue"
}

export function EditSongDialog({ song, open, onOpenChange, onSuccess }: EditSongDialogProps) {
  const [title, setTitle] = useState(song.title)
  const [artist, setArtist] = useState(song.artist || "")
  const [partitionUrl, setPartitionUrl] = useState(song.partition_url || "")
  const [musicUrl, setMusicUrl] = useState(song.music_url || "")
  const [notes, setNotes] = useState(song.notes || "")
  const [instrumentId, setInstrumentId] = useState<string>(song.instrument_id || "")
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [instrumentElements, setInstrumentElements] = useState<InstrumentElement[]>([])
  const [evaluations, setEvaluations] = useState<Record<string, ElementEvaluation>>({})
  const [showOptional, setShowOptional] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    if (!open) return

    const loadData = async () => {
      const { data: instrumentsData } = await supabase.from("instruments").select("*").order("name")
      if (instrumentsData) {
        setInstruments(instrumentsData)
      }

      if (song.instrument_id) {
        const { data: evalsData } = await supabase.from("evaluations").select("*").eq("song_id", song.id)

        if (evalsData) {
          const evalMap: Record<string, ElementEvaluation> = {}
          evalsData.forEach((ev) => {
            if (ev.instrument_element_id) {
              evalMap[ev.instrument_element_id] = {
                instrument_element_id: ev.instrument_element_id,
                level: ev.level,
                notes: ev.notes,
              }
            }
          })
          setEvaluations(evalMap)
        }
      }
    }

    loadData()
  }, [open, song, supabase])

  useEffect(() => {
    const loadElements = async () => {
      if (!instrumentId) {
        setInstrumentElements([])
        return
      }

      const { data } = await supabase
        .from("instrument_elements")
        .select("*")
        .eq("instrument_id", instrumentId)
        .order("order_index")

      if (data) {
        setInstrumentElements(data)
        setEvaluations((prev) => {
          const updated = { ...prev }
          data.forEach((elem) => {
            if (!updated[elem.id]) {
              updated[elem.id] = {
                instrument_element_id: elem.id,
                level: elem.is_mandatory ? 1 : null,
                notes: null,
              }
            }
          })
          return updated
        })
      }
    }

    if (open) {
      loadElements()
    }
  }, [instrumentId, open, supabase])

  const mandatoryElements = instrumentElements.filter((e) => e.is_mandatory)
  const optionalElements = instrumentElements.filter((e) => !e.is_mandatory)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const missingMandatory = mandatoryElements.filter(
        (elem) => !evaluations[elem.id] || evaluations[elem.id].level === null,
      )
      if (missingMandatory.length > 0) {
        throw new Error("Tous les elements obligatoires doivent etre evalues")
      }

      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Non authentifie")

      const { error: updateError } = await supabase
        .from("songs")
        .update({
          title,
          artist: artist || null,
          partition_url: partitionUrl || null,
          music_url: musicUrl || null,
          notes: notes || null,
          instrument_id: instrumentId || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", song.id)

      if (updateError) throw updateError

      const { data: existingEvals } = await supabase
        .from("evaluations")
        .select("id, instrument_element_id")
        .eq("song_id", song.id)

      const existingEvalMap = new Map(
        (existingEvals || []).map((ev) => [ev.instrument_element_id, ev.id])
      )

      const evaluationsToSave = Object.values(evaluations).filter((ev) => ev.level !== null)

      const evaluationsToUpdate: { id: string; level: number; notes: string | null }[] = []
      const evaluationsToInsert: {
        user_id: string
        song_id: string
        instrument_element_id: string
        level: number
        notes: string | null
        evaluated_at: string
      }[] = []

      for (const ev of evaluationsToSave) {
        const existingId = existingEvalMap.get(ev.instrument_element_id)
        if (existingId) {
          evaluationsToUpdate.push({
            id: existingId,
            level: ev.level!,
            notes: ev.notes,
          })
          existingEvalMap.delete(ev.instrument_element_id)
        } else {
          evaluationsToInsert.push({
            user_id: user.id,
            song_id: song.id,
            instrument_element_id: ev.instrument_element_id,
            level: ev.level!,
            notes: ev.notes,
            evaluated_at: new Date().toISOString(),
          })
        }
      }

      const evaluationsToDelete = Array.from(existingEvalMap.values())
      if (evaluationsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from("evaluations")
          .delete()
          .in("id", evaluationsToDelete)
        if (deleteError) throw deleteError
      }

      for (const evalToUpdate of evaluationsToUpdate) {
        const { error: updateEvalError } = await supabase
          .from("evaluations")
          .update({
            level: evalToUpdate.level,
            notes: evalToUpdate.notes,
            evaluated_at: new Date().toISOString(),
          })
          .eq("id", evalToUpdate.id)
        if (updateEvalError) throw updateEvalError
      }

      if (evaluationsToInsert.length > 0) {
        const { error: evalError } = await supabase.from("evaluations").insert(evaluationsToInsert)
        if (evalError) throw evalError
      }

      onSuccess()
      onOpenChange(false)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto bg-background border-[3px] border-foreground p-0 gap-0 rounded-none">
        <form onSubmit={handleSubmit} className="flex flex-col">
          {/* Header */}
          <div className="px-5 sm:px-6 pt-6">
            <h2 className="font-caprasimo text-2xl sm:text-3xl text-foreground">
              Mettre à jour la mélodie
            </h2>
            <p className=" text-base text-foreground mt-1">
              Spoiler : Tu joues déjà mieux qu'hier
            </p>
          </div>

          {/* Form fields */}
          <div className="p-5 sm:p-6 space-y-5">
            {/* Title */}
            <div className="space-y-2">
              <label htmlFor="edit-title" className="font-sans text-lg font-bold text-foreground">
                Titre du morceau <span className="text-destructive">*</span>
              </label>
              <Input
                id="edit-title"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="border-[2px] border-foreground bg-transparent font-sans text-base h-12 px-4 focus-visible:ring-primary"
              />
            </div>

            {/* Artist */}
            <div className="space-y-2">
              <label htmlFor="edit-artist" className="font-sans text-lg font-bold text-foreground">
                Artiste
              </label>
              <Input
                id="edit-artist"
                value={artist}
                onChange={(e) => setArtist(e.target.value)}
                className="border-[2px] border-foreground bg-transparent font-sans text-base h-12 px-4 focus-visible:ring-primary"
              />
            </div>

            {/* Partition URL */}
            <div className="space-y-2">
              <label htmlFor="edit-partition-url" className="font-sans text-lg font-bold text-foreground">
                Lien vers la partition
              </label>
              <Input
                id="edit-partition-url"
                type="url"
                value={partitionUrl}
                onChange={(e) => setPartitionUrl(e.target.value)}
                className="border-[2px] border-foreground bg-transparent font-sans text-base h-12 px-4 focus-visible:ring-primary"
              />
            </div>

            {/* Music URL */}
            <div className="space-y-2">
              <label htmlFor="edit-music-url" className="font-sans text-lg font-bold text-foreground">
                Lien vers la musique
              </label>
              <Input
                id="edit-music-url"
                type="url"
                value={musicUrl}
                onChange={(e) => setMusicUrl(e.target.value)}
                className="border-[2px] border-foreground bg-transparent font-sans text-base h-12 px-4 focus-visible:ring-primary"
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label htmlFor="edit-notes" className="font-sans text-lg font-bold text-foreground">
                Notes
              </label>
              <Textarea
                id="edit-notes"
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="border-[2px] border-foreground bg-transparent font-sans text-base px-4 py-3 focus-visible:ring-primary"
              />
            </div>

            {/* Instrument selector */}
            <div className="space-y-2">
              <label htmlFor="edit-instrument" className="font-sans text-lg font-bold text-foreground">
                Instrument <span className="text-destructive">*</span>
              </label>
              <Select value={instrumentId} onValueChange={setInstrumentId} required disabled={instruments.length === 1}>
                <SelectTrigger
                  id="edit-instrument"
                  className="border-[2px] border-foreground bg-transparent font-sans text-base h-12 px-4"
                >
                  <SelectValue placeholder="Selectionnez un instrument" />
                </SelectTrigger>
                <SelectContent className="bg-background border-[2px] border-foreground">
                  {instruments.map((instrument) => (
                    <SelectItem key={instrument.id} value={instrument.id} className="font-sans text-base">
                      {instrument.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Evaluation section */}
          {instrumentId && instrumentElements.length > 0 && (
            <div className="space-y-0">
              {/* Mandatory elements */}
              {mandatoryElements.length > 0 && (
                <div className="mx-5 sm:mx-6 border-[3px] border-foreground p-5 sm:p-6 mb-5">
                  <h3 className="font-caprasimo text-xl sm:text-2xl text-foreground mb-5">
                    Elements de base
                  </h3>
                  <div className="space-y-6">
                    {mandatoryElements.map((element) => {
                      const currentLevel = evaluations[element.id]?.level ?? null
                      return (
                        <div key={element.id}>
                          <h4 className="font-sans text-xl font-bold text-foreground">
                            {element.name}
                            <span className="ml-2 text-sm font-normal text-destructive">*</span>
                          </h4>
                          {element.description && (
                            <p className="font-sans text-base text-foreground mt-0.5">
                              {element.description}
                            </p>
                          )}
                          <div className="mt-2 flex items-center gap-3">
                            <MusicNoteRating
                              value={currentLevel}
                              onChange={(level) =>
                                setEvaluations((prev) => ({
                                  ...prev,
                                  [element.id]: { ...prev[element.id], level },
                                }))
                              }
                            />
                            <span className="font-sans text-base text-foreground/40">
                              {getLevelLabel(currentLevel)}
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Optional elements - collapsible */}
              {optionalElements.length > 0 && (
                <div className="mx-5 sm:mx-6 mb-5">
                  <Collapsible open={showOptional} onOpenChange={setShowOptional}>
                    <div className="border-[3px] border-foreground">
                      <CollapsibleTrigger asChild>
                        <button
                          type="button"
                          className="w-full flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-foreground/5 transition-colors"
                        >
                          <h3 className="font-caprasimo text-xl sm:text-2xl text-foreground">
                            Elements optionnels
                          </h3>
                          <ChevronRight
                            className={`h-7 w-7 text-foreground transition-transform ${showOptional ? "rotate-90" : ""}`}
                          />
                        </button>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-6">
                          {optionalElements.map((element) => {
                            const currentLevel = evaluations[element.id]?.level ?? null
                            return (
                              <div key={element.id}>
                                <h4 className="font-sans text-xl font-bold text-foreground">
                                  {element.name}
                                </h4>
                                {element.description && (
                                  <p className="font-sans text-base text-foreground mt-0.5">
                                    {element.description}
                                  </p>
                                )}
                                <div className="mt-2 flex items-center gap-3">
                                  <MusicNoteRating
                                    value={currentLevel}
                                    onChange={(level) =>
                                      setEvaluations((prev) => ({
                                        ...prev,
                                        [element.id]: { ...prev[element.id], level },
                                      }))
                                    }
                                  />
                                  <span className="font-sans text-base text-foreground/40">
                                    {getLevelLabel(currentLevel)}
                                  </span>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="mx-5 sm:mx-6 mb-4">
              <p className="font-sans text-sm text-destructive">{error}</p>
            </div>
          )}

          {/* Action buttons */}
          <div className="p-5 sm:p-6 flex flex-wrap items-center justify-end gap-3 border-foreground">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="px-4 py-2.5 border-[3px] border-foreground font-sans text-base font-extrabold uppercase text-foreground hover:bg-foreground/5 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isLoading || !instrumentId}
              className="px-4 py-2.5 bg-primary border-[3px] border-primary font-sans text-base font-extrabold uppercase text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
