"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, FileText } from "lucide-react"
import type { Evaluation, InstrumentElement } from "@/lib/types/database"
import { cn } from "@/lib/utils"

interface EvaluationHistoryProps {
  evaluations: Evaluation[]
  instrumentElements: InstrumentElement[]
}

const levelColors = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"]

const levelLabels = ["", "Débutant", "Novice", "Intermédiaire", "Avancé", "Maîtrisé"]

export function EvaluationHistory({ evaluations, instrumentElements }: EvaluationHistoryProps) {
  const groupedEvaluations = evaluations.reduce(
    (acc, evaluation) => {
      const dateKey = evaluation.evaluated_at
      if (!acc[dateKey]) {
        acc[dateKey] = []
      }
      acc[dateKey].push(evaluation)
      return acc
    },
    {} as Record<string, Evaluation[]>,
  )

  const sortedDates = Object.keys(groupedEvaluations).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  return (
    <Card>
      <CardHeader>
        <CardTitle>Historique des évaluations</CardTitle>
        <CardDescription>Votre progression au fil du temps pour cet élément et cet instrument</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {sortedDates.map((dateKey, index) => {
            const evals = groupedEvaluations[dateKey]
            const firstEval = evals[0]

            return (
              <div
                key={dateKey}
                className={cn(
                  "rounded-lg border p-4 transition-all",
                  index === 0 ? "bg-muted/50 border-primary/50" : "bg-background",
                )}
              >
                <div className="flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{new Date(dateKey).toLocaleString("fr-FR")}</span>
                  {index === 0 && (
                    <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                      Actuel
                    </span>
                  )}
                </div>

                <div className="space-y-2">
                  {evals.map((evaluation) => {
                    const instrumentElement = instrumentElements.find(
                      (ie) => ie.id === evaluation.instrument_element_id,
                    )
                    if (!instrumentElement) return null

                    return (
                      <div key={evaluation.id} className="flex items-center gap-3 py-2">
                        <div
                          className={cn(
                            "flex h-10 w-10 items-center justify-center rounded-full text-white font-bold flex-shrink-0 text-sm",
                            levelColors[evaluation.level],
                          )}
                        >
                          {evaluation.level}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{instrumentElement.name}</p>
                          <p className="text-xs text-muted-foreground">{levelLabels[evaluation.level]}</p>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {firstEval.notes && (
                  <div className="flex gap-2 mt-3 pt-3 border-t">
                    <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{firstEval.notes}</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
