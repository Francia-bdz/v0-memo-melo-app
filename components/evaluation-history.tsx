"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, FileText } from "lucide-react"
import type { Evaluation } from "@/lib/types/database"
import { cn } from "@/lib/utils"

interface EvaluationHistoryProps {
  evaluations: Evaluation[]
}

const levelColors = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"]

const levelLabels = ["", "Beginner", "Novice", "Intermediate", "Advanced", "Mastered"]

export function EvaluationHistory({ evaluations }: EvaluationHistoryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Evaluation History</CardTitle>
        <CardDescription>Your progress over time for this element and instrument</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {evaluations.map((evaluation, index) => (
            <div
              key={evaluation.id}
              className={cn(
                "rounded-lg border p-4 transition-all",
                index === 0 ? "bg-muted/50 border-primary/50" : "bg-background",
              )}
            >
              <div className="flex items-start gap-4">
                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-full text-white font-bold flex-shrink-0",
                    levelColors[evaluation.level],
                  )}
                >
                  {evaluation.level}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-semibold">{levelLabels[evaluation.level]}</p>
                    {index === 0 && (
                      <span className="text-xs bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-medium">
                        Current
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(evaluation.evaluated_at).toLocaleString()}</span>
                  </div>
                  {evaluation.notes && (
                    <div className="flex gap-2 mt-2">
                      <FileText className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-muted-foreground whitespace-pre-wrap">{evaluation.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
