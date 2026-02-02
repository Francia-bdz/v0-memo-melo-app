"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronDown, ChevronRight } from "lucide-react"
import type { Song, Instrument, InstrumentElement, ElementEvaluation } from "@/lib/types/database"
import { LevelSelector } from "@/components/level-selector"

interface EditSongDialogProps {
  song: Song
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess: () => void
}

export function EditSongDialog({ song, open, onOpenChange, onSuccess }: EditSongDialogProps) {
  const [title, setTitle] = useState(song.title)
  const [artist, setArtist] = useState(song.artist || "")
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
      // Load instruments
      const { data: instrumentsData } = await supabase.from("instruments").select("*").order("name")
      if (instrumentsData) {
        setInstruments(instrumentsData)
      }

      // Load existing evaluations for this song
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
        // Initialize evaluations for new elements not yet evaluated
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
        throw new Error("Tous les éléments obligatoires doivent être évalués")
      }

      // Get current user first
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Non authentifié")

      const { error: updateError } = await supabase
        .from("songs")
        .update({
          title,
          artist: artist || null,
          notes: notes || null,
          instrument_id: instrumentId || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", song.id)

      if (updateError) throw updateError

      // Get existing evaluations to determine which to update, insert, or delete
      const { data: existingEvals } = await supabase
        .from("evaluations")
        .select("id, instrument_element_id")
        .eq("song_id", song.id)

      const existingEvalMap = new Map(
        (existingEvals || []).map((ev) => [ev.instrument_element_id, ev.id])
      )

      // Prepare evaluations to save (those with a level)
      const evaluationsToSave = Object.values(evaluations).filter((ev) => ev.level !== null)

      // Separate into updates and inserts
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
          // Update existing evaluation
          evaluationsToUpdate.push({
            id: existingId,
            level: ev.level!,
            notes: ev.notes,
          })
          existingEvalMap.delete(ev.instrument_element_id)
        } else {
          // Insert new evaluation
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

      // Delete evaluations that are no longer needed (level set to null)
      const evaluationsToDelete = Array.from(existingEvalMap.values())
      if (evaluationsToDelete.length > 0) {
        const { error: deleteError } = await supabase
          .from("evaluations")
          .delete()
          .in("id", evaluationsToDelete)
        if (deleteError) throw deleteError
      }

      // Update existing evaluations
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

      // Insert new evaluations
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
      <DialogContent className="max-w-[95vw] sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl">Modifier le morceau</DialogTitle>
          <DialogDescription className="text-sm">Mettre à jour les détails de ce morceau</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Titre du morceau *</Label>
            <Input id="edit-title" required value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-artist">Artiste</Label>
            <Input id="edit-artist" value={artist} onChange={(e) => setArtist(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-notes">Notes</Label>
            <Textarea id="edit-notes" rows={4} value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-instrument">Instrument *</Label>
            <Select value={instrumentId} onValueChange={setInstrumentId} required disabled={instruments.length === 1}>
              <SelectTrigger id="edit-instrument">
                <SelectValue placeholder="Sélectionnez un instrument" />
              </SelectTrigger>
              <SelectContent>
                {instruments.map((instrument) => (
                  <SelectItem key={instrument.id} value={instrument.id}>
                    {instrument.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {instrumentId && instrumentElements.length > 0 && (
            <div className="space-y-4 border-t pt-4">
              <div>
                <h3 className="text-base font-semibold mb-1">Éléments d'apprentissage</h3>
                <p className="text-sm text-muted-foreground">Mettez à jour votre niveau pour chaque élément</p>
              </div>

              {mandatoryElements.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Éléments obligatoires</h4>
                  {mandatoryElements.map((element) => (
                    <Card key={element.id}>
                      <CardHeader>
                        <CardTitle className="text-sm">
                          {element.name}
                          <span className="ml-2 text-xs font-normal text-destructive">*</span>
                        </CardTitle>
                        {element.description && (
                          <CardDescription className="text-xs">{element.description}</CardDescription>
                        )}
                      </CardHeader>
                      <CardContent>
                        <LevelSelector
                          value={evaluations[element.id]?.level || null}
                          onChange={(level) =>
                            setEvaluations((prev) => ({
                              ...prev,
                              [element.id]: { ...prev[element.id], level },
                            }))
                          }
                          allowEmpty={false}
                        />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              {optionalElements.length > 0 && (
                <Collapsible open={showOptional} onOpenChange={setShowOptional}>
                  <CollapsibleTrigger asChild>
                    <Button variant="outline" className="w-full justify-between bg-transparent" type="button">
                      <span className="text-sm font-medium">Éléments optionnels ({optionalElements.length})</span>
                      {showOptional ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className="space-y-4 mt-4">
                    {optionalElements.map((element) => (
                      <Card key={element.id}>
                        <CardHeader>
                          <CardTitle className="text-sm">{element.name}</CardTitle>
                          {element.description && (
                            <CardDescription className="text-xs">{element.description}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          <LevelSelector
                            value={evaluations[element.id]?.level || null}
                            onChange={(level) =>
                              setEvaluations((prev) => ({
                                ...prev,
                                [element.id]: { ...prev[element.id], level },
                              }))
                            }
                            allowEmpty={true}
                          />
                        </CardContent>
                      </Card>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              )}
            </div>
          )}

          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="submit" disabled={isLoading || !instrumentId} className="flex-1 w-full">
              {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 w-full bg-transparent"
            >
              Annuler
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
