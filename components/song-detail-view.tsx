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
import { Button } from "./ui/button"

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

  function GuitarIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23.8664 2.06887L21.9311 0.133594C21.753 -0.0445312 21.4642 -0.0445312 21.286 0.133594L19.3507 2.06887C19.1727 2.24691 19.1726 2.53566 19.3506 2.71378L13.9901 8.07422C12.2262 6.83765 10.2652 6.59822 9.24328 7.62009C9.01172 7.85165 8.84494 8.13159 8.73975 8.4465C8.6505 8.70778 8.54822 8.97581 8.42222 9.24309C8.27456 9.55612 8.07957 9.8535 7.81988 10.1132C7.45622 10.4768 7.01672 10.7122 6.5595 10.8591C5.60813 11.1647 4.43813 11.3876 3.45863 11.6833C3.09535 11.7739 2.74725 11.9039 2.42007 12.0739C2.262 12.1515 2.11857 12.2347 1.99388 12.3249C1.76082 12.4812 1.54163 12.6608 1.33847 12.8639C0.43566 13.7668 -0.00140287 14.9962 3.38246e-06 16.3125C0.00187838 18.1048 0.816753 20.0632 2.37657 21.6231C3.94172 23.1882 5.89032 24.0036 7.6875 24C8.99691 23.9974 10.2369 23.5599 11.1356 22.6612C11.3398 22.4571 11.5197 22.2363 11.6766 22.0019C11.7639 21.8808 11.8447 21.7425 11.92 21.5902C12.0967 21.2525 12.2313 20.8928 12.323 20.5166C12.6152 19.5421 12.8369 18.3835 13.1401 17.4398C13.287 16.9826 13.5223 16.5431 13.886 16.1795C14.1457 15.9198 14.443 15.7248 14.7561 15.5771C15.0191 15.453 15.2829 15.3521 15.5404 15.2639C15.8603 15.159 16.1449 14.9912 16.3795 14.7565C17.4015 13.7346 17.162 11.7735 15.9254 10.0096L21.2858 4.64915C21.464 4.82728 21.7529 4.82747 21.9311 4.64934L23.8664 2.71406C24.0445 2.53584 24.0445 2.247 23.8664 2.06887ZM7.74422 19.4912L4.51875 16.2657L5.16385 15.6206L8.38931 18.8461L7.74422 19.4912ZM12.5267 13.8922C11.8587 14.5601 10.7756 14.5601 10.1076 13.8922C9.4395 13.2242 9.4396 12.1411 10.1076 11.473C10.7755 10.8051 11.8586 10.8051 12.5267 11.473C13.1947 12.141 13.1947 13.2241 12.5267 13.8922Z"
        fill="#18160C"
      />
    </svg>
  );
}

  return (
    <div className="space-y-6">
      {/* Top bar: Back link + Menu */}
      <div className="flex items-start justify-between">

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

            <GuitarIcon className="h-6 w-6 text-foreground" />

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
              className="inline-flex items-center px-3 py-2 border-[3px] border-foreground font-sans font-extrabold text-sm uppercase text-foreground hover:bg-foreground/5 transition-colors"
            >
              Écouter la musique
            </a>
          )}
          {song.partition_url && (
            <a
              href={song.partition_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 border-[3px] border-foreground font-sans font-extrabold text-sm uppercase text-foreground hover:bg-foreground/5 transition-colors"
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
                  <h4 className="font-sans text-xl font-bold text-foreground">
                    {element.name}
                  </h4>
                  {element.description && (
                    <p className="font-sans text-lg font-regular text-foreground mt-0.5">
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
                      <h4 className="font-sans text-xl font-bold text-foreground">
                        {element.name}
                      </h4>
                      {element.description && (
                        <p className="font-sans text-lg font-regular text-foreground mt-0.5">
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
        <Button
          onClick={() => setShowEditDialog(true)}
              className="border-3 border-(--beige-900) bg-transparent text-(--beige-900) hover:bg-(--beige-900)/10 disabled:border-(--beige-400) disabled:text-(--beige-400)font-sans text-lg font-extrabold uppercase h-auto flex items-center gap-5 px-3 py-2"        >
          Mettre à jour
        </Button>
        <Button
          onClick={() => setShowDeleteDialog(true)}
          className="bg-destructive hover:bg-destructive/90 text-destructive-foreground font-sans text-xl font-extrabold uppercase h-auto flex items-center gap-5  px-4 py-2.5"
        >
          Supprimer
        </Button>
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
