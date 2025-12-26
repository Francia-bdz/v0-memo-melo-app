"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"
import type { SongElement, Instrument, Evaluation } from "@/lib/types/database"
import { LevelSelector } from "@/components/level-selector"
import { EvaluationHistory } from "@/components/evaluation-history"

interface EvaluationFormProps {
  element: SongElement & { songs: { id: string; title: string; artist: string | null } }
  instrument: Instrument
  latestEvaluation: Evaluation | null
  allEvaluations: Evaluation[]
}

export function EvaluationForm({ element, instrument, latestEvaluation, allEvaluations }: EvaluationFormProps) {
  const [level, setLevel] = useState(latestEvaluation?.level || 1)
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
      if (!user) throw new Error("Not authenticated")

      const { error: insertError } = await supabase.from("evaluations").insert({
        song_element_id: element.id,
        instrument_id: instrument.id,
        user_id: user.id,
        level,
        notes: notes || null,
        evaluated_at: new Date().toISOString(),
      })

      if (insertError) throw insertError

      setShowSuccess(true)
      setNotes("")
      setTimeout(() => {
        setShowSuccess(false)
        router.refresh()
      }, 2000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/dashboard/songs/${element.songs.id}`}>
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Song
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Evaluate Your Progress</CardTitle>
          <CardDescription className="text-base">
            Rate your mastery level for <span className="font-semibold">{element.name}</span> on{" "}
            <span className="font-semibold">{instrument.name}</span>
          </CardDescription>
          <div className="mt-4 pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">Song:</span> {element.songs.title}
              {element.songs.artist && ` by ${element.songs.artist}`}
            </p>
            {element.description && (
              <p className="text-sm text-muted-foreground mt-1">
                <span className="font-medium">Element:</span> {element.description}
              </p>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <Label className="text-base">Mastery Level *</Label>
              <LevelSelector value={level} onChange={setLevel} />
            </div>

            {latestEvaluation && (
              <div className="rounded-lg border bg-muted/50 p-4">
                <p className="text-sm font-medium mb-1">Your current level</p>
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold">
                    {latestEvaluation.level}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Last evaluated {new Date(latestEvaluation.evaluated_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                placeholder="Add notes about your practice session, what you learned, areas to improve..."
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            {showSuccess && (
              <div className="flex items-center gap-2 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800 p-4">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                <p className="text-sm font-medium text-green-600 dark:text-green-400">Evaluation saved successfully!</p>
              </div>
            )}

            <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
              {isSubmitting ? "Saving..." : "Save Evaluation"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {allEvaluations.length > 0 && <EvaluationHistory evaluations={allEvaluations} />}
    </div>
  )
}
