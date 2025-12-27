"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, CheckCircle2, Info } from "lucide-react"
import Link from "next/link"
import type { SongElement, Instrument, InstrumentElement, Evaluation } from "@/lib/types/database"
import { LevelSelector } from "@/components/level-selector"
import { EvaluationHistory } from "@/components/evaluation-history"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"

interface EvaluationFormProps {
  element: SongElement & { songs: { id: string; title: string; artist: string | null } }
  instrument: Instrument
  instrumentElements: InstrumentElement[]
  allEvaluations: Evaluation[]
}

export function EvaluationForm({ element, instrument, instrumentElements, allEvaluations }: EvaluationFormProps) {
  const [elementLevels, setElementLevels] = useState<Record<string, number>>(
    instrumentElements.reduce(
      (acc, ie) => {
        const latestEval = allEvaluations.find((e) => e.instrument_element_id === ie.id)
        acc[ie.id] = latestEval?.level || 1
        return acc
      },
      {} as Record<string, number>,
    ),
  )
  const [notes, setNotes] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Non authentifié")

      const evaluations = instrumentElements
        .filter((ie) => ie.is_mandatory || elementLevels[ie.id] > 1) // Only save mandatory or non-default optional
        .map((ie) => ({
          song_element_id: element.id,
          instrument_id: instrument.id,
          instrument_element_id: ie.id,
          user_id: user.id,
          level: elementLevels[ie.id],
          notes: notes || null,
          evaluated_at: new Date().toISOString(),
        }))

      if (evaluations.length === 0) {
        throw new Error("Veuillez évaluer au moins les éléments obligatoires")
      }

      const { error: insertError } = await supabase.from("evaluations").insert(evaluations)

      if (insertError) throw insertError

      setShowSuccess(true)
      setNotes("")
      setTimeout(() => {
        setShowSuccess(false)
        router.refresh()
      }, 2000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Une erreur s'est produite")
    } finally {
      setIsSubmitting(false)
    }
  }

  const mandatoryElements = instrumentElements.filter((ie) => ie.is_mandatory)
  const optionalElements = instrumentElements.filter((ie) => !ie.is_mandatory)

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/songs/${element.songs.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au morceau
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Évaluez votre progression</CardTitle>
          <CardDescription className="text-base">
            Évaluez votre niveau de maîtrise pour <span className="font-semibold">{element.name}</span> à la{" "}
            <span className="font-semibold">{instrument.name}</span>
          </CardDescription>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Morceau :</span> {element.songs.title}
              {element.songs.artist && ` par ${element.songs.artist}`}
            </p>
            {element.description && (
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-medium">Élément :</span> {element.description}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Éléments obligatoires</h3>
                <Badge variant="destructive" className="text-xs">
                  Requis
                </Badge>
              </div>
              {mandatoryElements.map((ie) => {
                const latestEval = allEvaluations.find((e) => e.instrument_element_id === ie.id)
                return (
                  <div key={ie.id} className="space-y-3 p-4 rounded-lg border bg-muted/30">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <Label className="text-base font-medium">{ie.name}</Label>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-auto p-0 ml-2">
                                <Info className="h-4 w-4 text-muted-foreground" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent className="max-w-xs">
                              <p>{ie.description}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                        <p className="text-sm text-muted-foreground mt-1">{ie.description}</p>
                      </div>
                    </div>
                    {latestEval && (
                      <div className="text-xs text-muted-foreground">
                        Niveau actuel : <span className="font-semibold">{latestEval.level}/5</span> (
                        {new Date(latestEval.evaluated_at).toLocaleDateString()})
                      </div>
                    )}
                    <LevelSelector
                      value={elementLevels[ie.id]}
                      onChange={(val) => setElementLevels({ ...elementLevels, [ie.id]: val })}
                    />
                  </div>
                )
              })}
            </div>

            {optionalElements.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold">Éléments optionnels</h3>
                  <Badge variant="secondary" className="text-xs">
                    Facultatif
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  Ces éléments sont optionnels. Laissez-les à 1 si vous ne souhaitez pas les évaluer pour le moment.
                </p>
                {optionalElements.map((ie) => {
                  const latestEval = allEvaluations.find((e) => e.instrument_element_id === ie.id)
                  return (
                    <div key={ie.id} className="space-y-3 p-4 rounded-lg border">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <Label className="text-base font-medium">{ie.name}</Label>
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="ghost" size="sm" className="h-auto p-0 ml-2">
                                  <Info className="h-4 w-4 text-muted-foreground" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent className="max-w-xs">
                                <p>{ie.description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <p className="text-sm text-muted-foreground mt-1">{ie.description}</p>
                        </div>
                      </div>
                      {latestEval && (
                        <div className="text-xs text-muted-foreground">
                          Niveau actuel : <span className="font-semibold">{latestEval.level}/5</span> (
                          {new Date(latestEval.evaluated_at).toLocaleDateString()})
                        </div>
                      )}
                      <LevelSelector
                        value={elementLevels[ie.id]}
                        onChange={(val) => setElementLevels({ ...elementLevels, [ie.id]: val })}
                      />
                    </div>
                  )
                })}
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Facultatif)</Label>
              <Textarea
                id="notes"
                placeholder="Ajoutez des notes sur votre session de pratique, ce que vous avez appris, les points à améliorer..."
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {showSuccess && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                  Évaluation enregistrée avec succès !
                </p>
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
              {isSubmitting ? "Enregistrement..." : "Enregistrer l'évaluation"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {allEvaluations.length > 0 && (
        <EvaluationHistory evaluations={allEvaluations} instrumentElements={instrumentElements} />
      )}
    </div>
  )
}
