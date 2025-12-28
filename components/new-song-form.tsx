"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ChevronDown, ChevronRight } from "lucide-react"
import Link from "next/link"
import type { Instrument, InstrumentElement, ElementEvaluation } from "@/lib/types/database"
import { LevelSelector } from "@/components/level-selector"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

export function NewSongForm() {
  const [title, setTitle] = useState("")
  const [artist, setArtist] = useState("")
  const [notes, setNotes] = useState("")
  const [instrumentId, setInstrumentId] = useState<string>("")
  const [instruments, setInstruments] = useState<Instrument[]>([])
  const [instrumentElements, setInstrumentElements] = useState<InstrumentElement[]>([])
  const [evaluations, setEvaluations] = useState<Record<string, ElementEvaluation>>({})
  const [showOptional, setShowOptional] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadInstruments = async () => {
      const { data } = await supabase.from("instruments").select("*").order("name")
      if (data) {
        setInstruments(data)
        // Auto-select if only one instrument
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
        // Initialize evaluations with null for all elements
        const initialEvals: Record<string, ElementEvaluation> = {}
        data.forEach((elem) => {
          initialEvals[elem.id] = {
            instrument_element_id: elem.id,
            level: elem.is_mandatory ? 1 : null, // Default mandatory to level 1, optional to null
            notes: null,
          }
        })
        setEvaluations(initialEvals)
      }
    }
    loadElements()
  }, [instrumentId, supabase])

  const mandatoryElements = instrumentElements.filter((e) => e.is_mandatory)
  const optionalElements = instrumentElements.filter((e) => !e.is_mandatory)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Non authentifié")

      const missingMandatory = mandatoryElements.filter(
        (elem) => !evaluations[elem.id] || evaluations[elem.id].level === null,
      )
      if (missingMandatory.length > 0) {
        throw new Error("Tous les éléments obligatoires doivent être évalués")
      }

      const { data: song, error: insertError } = await supabase
        .from("songs")
        .insert({
          user_id: user.id,
          title,
          artist: artist || null,
          notes: notes || null,
          instrument_id: instrumentId || null,
        })
        .select()
        .single()

      if (insertError) throw insertError

      const { data: songElement, error: elementError } = await supabase
        .from("song_elements")
        .insert({
          song_id: song.id,
          name: "Morceau complet",
          description: "Évaluation globale du morceau",
          order_index: 0,
        })
        .select()
        .single()

      if (elementError) throw elementError

      const evaluationsToInsert = Object.values(evaluations)
        .filter((ev) => ev.level !== null)
        .map((ev) => ({
          user_id: user.id,
          song_element_id: songElement.id,
          instrument_id: instrumentId,
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
        <form onSubmit={handleSubmit} className="space-y-6">
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

          <div className="space-y-2">
            <Label htmlFor="instrument">Instrument *</Label>
            <Select value={instrumentId} onValueChange={setInstrumentId} required disabled={instruments.length === 1}>
              <SelectTrigger id="instrument">
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
            {instruments.length === 1 && (
              <p className="text-xs text-muted-foreground">Instrument sélectionné automatiquement</p>
            )}
          </div>

          {instrumentId && instrumentElements.length > 0 && (
            <div className="space-y-4 border-t pt-6">
              <div>
                <h3 className="text-lg font-semibold mb-1">Éléments d'apprentissage</h3>
                <p className="text-sm text-muted-foreground">
                  Évaluez votre niveau pour chaque élément de l'instrument
                </p>
              </div>

              {/* Mandatory elements */}
              {mandatoryElements.length > 0 && (
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-muted-foreground">Éléments obligatoires</h4>
                  {mandatoryElements.map((element) => (
                    <Card key={element.id}>
                      <CardHeader>
                        <CardTitle className="text-base">
                          {element.name}
                          <span className="ml-2 text-xs font-normal text-destructive">*</span>
                        </CardTitle>
                        {element.description && (
                          <CardDescription className="text-sm">{element.description}</CardDescription>
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

              {/* Optional elements - collapsible */}
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
                          <CardTitle className="text-base">{element.name}</CardTitle>
                          {element.description && (
                            <CardDescription className="text-sm">{element.description}</CardDescription>
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
          <div className="flex gap-3">
            <Button type="submit" disabled={isLoading || !instrumentId} className="flex-1">
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
