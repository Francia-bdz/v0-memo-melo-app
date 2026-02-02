"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ArrowLeft, Edit, Trash2, ChevronDown, ChevronRight, FileMusic, Music } from "lucide-react"
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

      const { data: evalsData } = await supabase.from("evaluations").select("*").eq("song_id", song.id)

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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/dashboard">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Retour aux morceaux</span>
              <span className="sm:hidden">Retour</span>
            </Button>
          </Link>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <Button variant="outline" onClick={() => setShowEditDialog(true)} className="flex-1 sm:flex-none">
            <Edit className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Modifier</span>
            <span className="sm:hidden">Éditer</span>
          </Button>
          <Button variant="outline" onClick={() => setShowDeleteDialog(true)} className="flex-1 sm:flex-none">
            <Trash2 className="h-4 w-4 mr-2 text-destructive" />
            <span className="hidden sm:inline">Supprimer</span>
            <span className="sm:hidden">Suppr.</span>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl sm:text-3xl">{song.title}</CardTitle>
          {song.artist && <CardDescription className="text-sm sm:text-base">par {song.artist}</CardDescription>}
          {instrument && (
            <div className="pt-2">
              <Badge variant="secondary" className="text-xs sm:text-sm">
                {instrument.name}
              </Badge>
            </div>
          )}
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Links */}
          <div className="flex flex-wrap gap-3">
            {song.partition_url && (
              <a
                href={song.partition_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-card hover:bg-muted transition-colors text-sm"
              >
                <FileMusic className="h-4 w-4" />
                Voir la partition
              </a>
            )}
            {song.music_url && (
              <a
                href={song.music_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-card hover:bg-muted transition-colors text-sm"
              >
                <Music className="h-4 w-4" />
                Écouter la musique
              </a>
            )}
          </div>
          
          {song.notes && (
            <div className="rounded-lg bg-muted p-3 sm:p-4">
              <p className="text-xs sm:text-sm text-muted-foreground whitespace-pre-wrap">{song.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {instrument && instrumentElements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl">Éléments d'apprentissage</CardTitle>
            <CardDescription className="text-sm">Votre progression pour chaque élément</CardDescription>
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
                      <div
                        key={element.id}
                        className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-3 rounded-lg border bg-card"
                      >
                        <div className="flex-1">
                          <div className="font-medium text-sm sm:text-base">{element.name}</div>
                          {element.description && (
                            <div className="text-xs sm:text-sm text-muted-foreground">{element.description}</div>
                          )}
                        </div>
                        <Badge className={cn("ml-0 sm:ml-4 self-start sm:self-center", levelInfo.color)}>
                          {levelInfo.label}
                        </Badge>
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
