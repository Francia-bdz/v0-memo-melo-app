"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ArrowLeft, Edit, Trash2, ChevronDown, ChevronRight } from "lucide-react"
import Link from "next/link"
import type { Song, Instrument, InstrumentElement, Evaluation } from "@/lib/types/database"
import { DeleteSongDialog } from "@/components/delete-song-dialog"
import { EditSongDialog } from "@/components/edit-song-dialog"
import { cn } from "@/lib/utils"

interface SongDetailViewProps {
  song: Song
}

const getLevelInfo = (level: number | null) => {
  if (level === null) return { label: "Non évalué", color: "bg-muted text-muted-foreground" }

  const levels = [
    { value: 1, label: "À peine", color: "bg-red-500 text-white" },
    { value: 2, label: "Pas mal", color: "bg-orange-500 text-white" },
    { value: 3, label: "Familière", color: "bg-yellow-500 text-white" },
    { value: 4, label: "Débutant", color: "bg-lime-500 text-white" },
    { value: 5, label: "Maîtrisée", color: "bg-green-500 text-white" },
  ]

  return levels.find((l) => l.value === level) || { label: "Non évalué", color: "bg-muted text-muted-foreground" }
}

export function SongDetailView({ song }: SongDetailViewProps) {
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [instrument, setInstrument] = useState<Instrument | null>(null)
  const [instrumentElements, setInstrumentElements] = useState<InstrumentElement[]>([])
  const [evaluations, setEvaluations] = useState<Record<string, Evaluation>>({})
  const [showOptional, setShowOptional] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadData = async () => {
      if (!song.instrument_id) return

      // Load instrument
      const { data: instrumentData } = await supabase
        .from("instruments")
        .select("*")
        .eq("id", song.instrument_id)
        .single()

      if (instrumentData) {
        setInstrument(instrumentData)
      }

      // Load instrument elements
      const { data: elementsData } = await supabase
        .from("instrument_elements")
        .select("*")
        .eq("instrument_id", song.instrument_id)
        .order("order_index")

      if (elementsData) {
        setInstrumentElements(elementsData)
      }

      const { data: evalsData } = await supabase
        .from("evaluations")
        .select("*")
        .eq("song_id", song.id)

      if (evalsData) {
        const evalMap: Record<string, Evaluation> = {}
        evalsData.forEach((ev) => {
          if (ev.instrument_element_id) {
            evalMap[ev.instrument_element_id] = ev
          }
        })
        setEvaluations(evalMap)
      }
    }

    loadData()
  }, [song, supabase])

  const mandatoryElements = instrumentElements.filter((e) => e.is_mandatory)
  const optionalElements = instrumentElements.filter((e) => !e.is_mandatory)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour aux morceaux
            </Button>
          </Link>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowEditDialog(true)}>
            <Edit className="h-4 w-4 mr-2" />
            Modifier
          </Button>
          <Button variant="outline" onClick={() => setShowDeleteDialog(true)}>
            <Trash2 className="h-4 w-4 mr-2 text-destructive" />
            Supprimer
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-3xl">{song.title}</CardTitle>
          {song.artist && <CardDescription className="text-base">par {song.artist}</CardDescription>}
          {instrument && (
            <div className="pt-2">
              <Badge variant="secondary" className="text-sm">
                {instrument.name}
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {song.notes && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{song.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {instrument && instrumentElements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Éléments d'apprentissage</CardTitle>
            <CardDescription>Votre progression pour chaque élément</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mandatory elements */}
            {mandatoryElements.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-muted-foreground">Éléments obligatoires</h4>
                <div className="space-y-2">
                  {mandatoryElements.map((element) => {
                    const evaluation = evaluations[element.id]
                    const levelInfo = getLevelInfo(evaluation?.level || null)

                    return (
                      <div key={element.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                        <div className="flex-1">
                          <div className="font-medium">{element.name}</div>
                          {element.description && (
                            <div className="text-sm text-muted-foreground">{element.description}</div>
                          )}
                        </div>
                        <Badge className={cn("ml-4", levelInfo.color)}>{levelInfo.label}</Badge>
                      </div>
                    )
                  })}
                </div>
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
                <CollapsibleContent className="space-y-2 mt-3">
                  {optionalElements.map((element) => {
                    const evaluation = evaluations[element.id]
                    const levelInfo = getLevelInfo(evaluation?.level || null)

                    return (
                      <div key={element.id} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                        <div className="flex-1">
                          <div className="font-medium">{element.name}</div>
                          {element.description && (
                            <div className="text-sm text-muted-foreground">{element.description}</div>
                          )}
                        </div>
                        <Badge className={cn("ml-4", levelInfo.color)}>{levelInfo.label}</Badge>
                      </div>
                    )
                  })}
                </CollapsibleContent>
              </Collapsible>
            )}
          </CardContent>
        </Card>
      )}

      <EditSongDialog
        song={song}
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        onSuccess={() => router.refresh()}
      />

      <DeleteSongDialog song={song} open={showDeleteDialog} onOpenChange={setShowDeleteDialog} />
    </div>
  )
}
