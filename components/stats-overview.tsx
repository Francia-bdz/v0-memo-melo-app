"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Music2, Wrench, Target, TrendingUp, Award } from "lucide-react"
import type { Song, Instrument, Evaluation, InstrumentElement } from "@/lib/types/database"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface StatsOverviewProps {
  songs: (Song & { instruments: Instrument })[]
  instruments: Instrument[]
  evaluations: (Evaluation & {
    songs: Song
    instrument_elements: InstrumentElement
  })[]
}

const levelColors = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"]
const levelLabels = ["", "À peine", "Pas mal", "Familière", "Débutant", "Maîtrisée"]

export function StatsOverview({ songs, instruments, evaluations }: StatsOverviewProps) {
  const totalSongs = songs.length
  const totalInstruments = instruments.length
  const totalEvaluations = evaluations.length

  const getLatestEvaluations = () => {
    const latestMap = new Map<string, Evaluation & { songs: Song; instrument_elements: InstrumentElement }>()
    evaluations.forEach((evaluation) => {
      const key = `${evaluation.song_id}-${evaluation.instrument_element_id}`
      const existing = latestMap.get(key)
      if (!existing || new Date(evaluation.evaluated_at) > new Date(existing.evaluated_at)) {
        latestMap.set(key, evaluation)
      }
    })
    return Array.from(latestMap.values())
  }

  const latestEvaluations = getLatestEvaluations()
  const averageLevel =
    latestEvaluations.length > 0 ? latestEvaluations.reduce((sum, e) => sum + e.level, 0) / latestEvaluations.length : 0

  // Count evaluations by level
  const levelCounts = [0, 0, 0, 0, 0, 0]
  latestEvaluations.forEach((evaluation) => {
    levelCounts[evaluation.level]++
  })

  // Calculate mastery percentage (level 5)
  const masteryPercentage = latestEvaluations.length > 0 ? (levelCounts[5] / latestEvaluations.length) * 100 : 0

  const songStats = songs.map((song) => {
    const songEvaluations = latestEvaluations.filter((e) => e.song_id === song.id)
    const avgLevel =
      songEvaluations.length > 0 ? songEvaluations.reduce((sum, e) => sum + e.level, 0) / songEvaluations.length : 0
    return {
      song,
      evaluationCount: songEvaluations.length,
      averageLevel: avgLevel,
    }
  })

  const instrumentStats = instruments.map((instrument) => {
    const instrumentSongs = songs.filter((s) => s.instrument_id === instrument.id)
    const instrumentEvaluations = latestEvaluations.filter((e) => instrumentSongs.some((s) => s.id === e.song_id))
    const avgLevel =
      instrumentEvaluations.length > 0
        ? instrumentEvaluations.reduce((sum, e) => sum + e.level, 0) / instrumentEvaluations.length
        : 0
    return {
      instrument,
      evaluationCount: instrumentEvaluations.length,
      averageLevel: avgLevel,
    }
  })

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Total Morceaux</CardTitle>
            <Music2 className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalSongs}</div>
            <p className="text-xs text-muted-foreground mt-1">{totalEvaluations} évaluations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Instruments</CardTitle>
            <Wrench className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalInstruments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalInstruments === 0 ? "Aucun instrument" : "Suivi des progrès"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Évaluations</CardTitle>
            <Target className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{totalEvaluations}</div>
            <p className="text-xs text-muted-foreground mt-1">{latestEvaluations.length} combinaisons uniques</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs sm:text-sm font-medium">Niveau Moyen</CardTitle>
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold">{averageLevel.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">{masteryPercentage.toFixed(0)}% maîtrisé</p>
          </CardContent>
        </Card>
      </div>

      {/* Songs Progress */}
      {songStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progrès par Morceau</CardTitle>
            <CardDescription>Niveau moyen de maîtrise pour chaque morceau</CardDescription>
          </CardHeader>
          <CardContent>
            {songStats.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Aucun morceau. Ajoutez des morceaux pour voir les statistiques.
              </div>
            ) : (
              <div className="space-y-4">
                {songStats
                  .sort((a, b) => b.averageLevel - a.averageLevel)
                  .map(({ song, evaluationCount, averageLevel }) => (
                    <div key={song.id} className="space-y-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{song.title}</p>
                          {song.artist && <p className="text-sm text-muted-foreground truncate">{song.artist}</p>}
                        </div>
                        <div className="flex items-center gap-2 ml-4">
                          {averageLevel >= 4.5 && <Award className="h-4 w-4 text-green-500" />}
                          <span className="text-sm font-medium">
                            {averageLevel > 0 ? averageLevel.toFixed(1) : "N/A"}
                          </span>
                        </div>
                      </div>
                      {evaluationCount > 0 && (
                        <div className="flex items-center gap-2">
                          <Progress value={(averageLevel / 5) * 100} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {evaluationCount} éval{evaluationCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}


      {/* Level Distribution */}
      {latestEvaluations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Distribution de la maîtrise</CardTitle>
            <CardDescription>Répartition actuelle des niveaux pour tous les éléments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[5, 4, 3, 2, 1].map((level) => {
                const count = levelCounts[level]
                const percentage = (count / latestEvaluations.length) * 100
                return (
                  <div key={level} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className={cn(
                            "flex h-6 w-6 items-center justify-center rounded-full text-white text-xs font-bold",
                            levelColors[level],
                          )}
                        >
                          {level}
                        </div>
                        <span className="font-medium">{levelLabels[level]}</span>
                      </div>
                      <span className="text-muted-foreground">
                        {count} ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <Progress value={percentage} className="h-2" />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Instruments Progress */}
      {instrumentStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progrès par Instrument</CardTitle>
            <CardDescription>Niveau moyen de maîtrise pour chaque instrument</CardDescription>
          </CardHeader>
          <CardContent>
            {instrumentStats.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                Aucun instrument. Ajoutez des instruments pour voir les statistiques.
              </div>
            ) : (
              <div className="space-y-4">
                {instrumentStats
                  .sort((a, b) => b.averageLevel - a.averageLevel)
                  .map(({ instrument, evaluationCount, averageLevel }) => (
                    <div key={instrument.id} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Wrench className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">{instrument.name}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          {averageLevel >= 4.5 && <Award className="h-4 w-4 text-green-500" />}
                          <span className="text-sm font-medium">
                            {averageLevel > 0 ? averageLevel.toFixed(1) : "N/A"}
                          </span>
                        </div>
                      </div>
                      {evaluationCount > 0 && (
                        <div className="flex items-center gap-2">
                          <Progress value={(averageLevel / 5) * 100} className="h-2 flex-1" />
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {evaluationCount} éval{evaluationCount !== 1 ? "s" : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Recent Activity */}
      {evaluations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Évaluations récentes</CardTitle>
            <CardDescription>Vos dernières mises à jour de progrès</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {evaluations.slice(0, 10).map((evaluation) => (
                <div key={evaluation.id} className="flex items-start gap-3 pb-3 border-b last:border-0 last:pb-0">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full text-white font-bold flex-shrink-0",
                      levelColors[evaluation.level],
                    )}
                  >
                    {evaluation.level}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {evaluation.instrument_elements.name} - {evaluation.songs.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(evaluation.evaluated_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    {evaluation.notes && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{evaluation.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {totalEvaluations === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
              <Target className="h-10 w-10 text-muted-foreground" />
            </div>
            <h3 className="mt-6 text-xl font-semibold">Pas encore de statistiques</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground max-w-sm">
              Commencez à évaluer vos progrès sur des morceaux pour voir des statistiques détaillées et suivre votre
              parcours d'apprentissage
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
