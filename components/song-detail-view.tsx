"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { ChevronRight, Edit } from "lucide-react"
import Link from "next/link"
import type { Song, Instrument, InstrumentElement, Evaluation } from "@/lib/types/database"
import { DeleteSongDialog } from "@/components/delete-song-dialog"
import { EditSongDialog } from "@/components/edit-song-dialog"
import { MusicNoteDisplay } from "@/components/music-note-rating"

interface SongDetailViewProps {
  song: Song
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

// Compute an overall average level from all evaluations
const getAverageLevel = (evaluations: Record<string, Evaluation>): number | null => {
  const values = Object.values(evaluations)
  if (values.length === 0) return null
  const sum = values.reduce((acc, ev) => acc + (ev.level || 0), 0)
  return Math.round(sum / values.length)
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

      const { data: instrumentData } = await supabase
        .from("instruments")
        .select("*")
        .eq("id", song.instrument_id)
        .single()

      if (instrumentData) {
        setInstrument(instrumentData)
      }

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
  const averageLevel = getAverageLevel(evaluations)

  return (
    <div className="space-y-6">
      {/* Top bar: Back link + Menu */}
      <div className="flex items-start justify-between">
        <Link
          href="/dashboard"
          className="font-caprasimo text-2xl sm:text-3xl md:text-4xl text-foreground hover:opacity-70 transition-opacity"
        >
          {"< Retour au repertoire"}
        </Link>
      </div>

      {/* Song header card */}
      <div className="border-[3px] border-foreground p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-1">
            <h2 className="font-caprasimo text-2xl sm:text-3xl text-foreground">
              {song.title}
            </h2>
            {song.artist && (
              <p className="font-sans text-base sm:text-lg text-foreground">
                {song.artist}
              </p>
            )}
            <div className="pt-2">
              <MusicNoteDisplay value={averageLevel} label={getLevelLabel(averageLevel)} />
            </div>
          </div>
          <button
            onClick={() => setShowEditDialog(true)}
            className="p-2 hover:opacity-70 transition-opacity"
            aria-label="Modifier le morceau"
          >
            <Edit className="h-6 w-6 text-foreground" />
          </button>
        </div>

        {/* Notes section */}
        {song.notes && (
          <div className="mt-4 pt-4 border-t border-foreground/20">
            <p className="font-sans text-sm text-muted-foreground whitespace-pre-wrap">{song.notes}</p>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-wrap items-center justify-end gap-3 mt-5">
          {song.music_url && (
            <a
              href={song.music_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2.5 border-[3px] border-foreground font-sans font-extrabold text-sm uppercase text-foreground hover:bg-foreground/5 transition-colors"
            >
              Ecouter la musique
            </a>
          )}
          {song.partition_url && (
            <a
              href={song.partition_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-5 py-2.5 border-[3px] border-foreground font-sans font-extrabold text-sm uppercase text-foreground hover:bg-foreground/5 transition-colors"
            >
              Voir la partition
            </a>
          )}
        </div>
      </div>

      {/* Elements de base */}
      {instrument && mandatoryElements.length > 0 && (
        <div className="border-[3px] border-foreground p-5 sm:p-6">
          <h3 className="font-caprasimo text-2xl sm:text-3xl text-foreground mb-5">
            Elements de base
          </h3>
          <div className="space-y-5">
            {mandatoryElements.map((element) => {
              const evaluation = evaluations[element.id]
              const level = evaluation?.level || null
              return (
                <div key={element.id}>
                  <h4 className="font-sans font-bold text-base sm:text-lg text-foreground">
                    {element.name}
                  </h4>
                  {element.description && (
                    <p className="font-sans text-sm text-foreground/80 mt-0.5">
                      {element.description}
                    </p>
                  )}
                  <div className="mt-2">
                    <MusicNoteDisplay value={level} label={getLevelLabel(level)} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Elements optionnels - collapsible */}
      {instrument && optionalElements.length > 0 && (
        <Collapsible open={showOptional} onOpenChange={setShowOptional}>
          <div className="border-[3px] border-foreground">
            <CollapsibleTrigger asChild>
              <button
                type="button"
                className="w-full flex items-center justify-between p-5 sm:p-6 cursor-pointer hover:bg-foreground/5 transition-colors"
              >
                <h3 className="font-caprasimo text-2xl sm:text-3xl text-foreground">
                  Elements optionnels
                </h3>
                <ChevronRight
                  className={`h-7 w-7 text-foreground transition-transform ${showOptional ? "rotate-90" : ""}`}
                />
              </button>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="px-5 sm:px-6 pb-5 sm:pb-6 space-y-5">
                {optionalElements.map((element) => {
                  const evaluation = evaluations[element.id]
                  const level = evaluation?.level || null
                  return (
                    <div key={element.id}>
                      <h4 className="font-sans font-bold text-base sm:text-lg text-foreground">
                        {element.name}
                      </h4>
                      {element.description && (
                        <p className="font-sans text-sm text-foreground/80 mt-0.5">
                          {element.description}
                        </p>
                      )}
                      <div className="mt-2">
                        <MusicNoteDisplay value={level} label={getLevelLabel(level)} />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CollapsibleContent>
          </div>
        </Collapsible>
      )}

      {/* Bottom action buttons */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          onClick={() => setShowEditDialog(true)}
          className="inline-flex items-center px-6 py-3 border-[3px] border-foreground font-sans font-extrabold text-sm uppercase text-foreground hover:bg-foreground/5 transition-colors"
        >
          Mettre a jour
        </button>
        <button
          onClick={() => setShowDeleteDialog(true)}
          className="inline-flex items-center px-6 py-3 bg-destructive font-sans font-extrabold text-sm uppercase text-destructive-foreground hover:bg-destructive/90 transition-colors"
        >
          Supprimer
        </button>
      </div>

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
