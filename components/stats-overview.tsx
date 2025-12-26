"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Music2, Wrench, Target, TrendingUp, Award } from "lucide-react"
import type { Song, SongElement, Instrument, Evaluation } from "@/lib/types/database"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"

interface StatsOverviewProps {
  songs: (Song & { song_elements: SongElement[] })[]
  instruments: Instrument[]
  evaluations: (Evaluation & {
    song_elements: SongElement & { songs: Song }
    instruments: Instrument
  })[]
}

const levelColors = ["", "bg-red-500", "bg-orange-500", "bg-yellow-500", "bg-lime-500", "bg-green-500"]
const levelLabels = ["", "Beginner", "Novice", "Intermediate", "Advanced", "Mastered"]

export function StatsOverview({ songs, instruments, evaluations }: StatsOverviewProps) {
  const totalSongs = songs.length
  const totalElements = songs.reduce((sum, song) => sum + song.song_elements.length, 0)
  const totalInstruments = instruments.length
  const totalEvaluations = evaluations.length

  // Calculate average level across all evaluations
  const getLatestEvaluations = () => {
    const latestMap = new Map<string, Evaluation>()
    evaluations.forEach((evaluation) => {
      const key = `${evaluation.song_element_id}-${evaluation.instrument_id}`
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

  // Group evaluations by song
  const songStats = songs.map((song) => {
    const songEvaluations = latestEvaluations.filter(
      (e) =>
        evaluations.find((ev) => ev.id === e.id)?.song_elements.songs.id === song.id ||
        song.song_elements.some((el) => el.id === e.song_element_id),
    )
    const avgLevel =
      songEvaluations.length > 0 ? songEvaluations.reduce((sum, e) => sum + e.level, 0) / songEvaluations.length : 0
    return {
      song,
      evaluationCount: songEvaluations.length,
      averageLevel: avgLevel,
    }
  })

  // Group evaluations by instrument
  const instrumentStats = instruments.map((instrument) => {
    const instrumentEvaluations = latestEvaluations.filter((e) => e.instrument_id === instrument.id)
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Songs</CardTitle>
            <Music2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalSongs}</div>
            <p className="text-xs text-muted-foreground mt-1">{totalElements} elements total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Instruments</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInstruments}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {totalInstruments === 0 ? "Add instruments to start" : "Tracking progress"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Evaluations</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEvaluations}</div>
            <p className="text-xs text-muted-foreground mt-1">{latestEvaluations.length} unique combinations</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Average Level</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageLevel.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground mt-1">{masteryPercentage.toFixed(0)}% mastered</p>
          </CardContent>
        </Card>
      </div>

      {/* Level Distribution */}
      {latestEvaluations.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Mastery Distribution</CardTitle>
            <CardDescription>Current level breakdown across all element-instrument combinations</CardDescription>
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

      {/* Songs Progress */}
      {songStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progress by Song</CardTitle>
            <CardDescription>Average mastery level for each song</CardDescription>
          </CardHeader>
          <CardContent>
            {songStats.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No songs yet. Add songs to see statistics.
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
                          <span className="text-sm font-medium">{averageLevel.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={(averageLevel / 5) * 100} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {evaluationCount} eval{evaluationCount !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Instruments Progress */}
      {instrumentStats.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progress by Instrument</CardTitle>
            <CardDescription>Average mastery level for each instrument</CardDescription>
          </CardHeader>
          <CardContent>
            {instrumentStats.length === 0 ? (
              <div className="text-center py-8 text-sm text-muted-foreground">
                No instruments yet. Add instruments to see statistics.
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
                          <span className="text-sm font-medium">{averageLevel.toFixed(1)}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Progress value={(averageLevel / 5) * 100} className="h-2 flex-1" />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {evaluationCount} eval{evaluationCount !== 1 ? "s" : ""}
                        </span>
                      </div>
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
            <CardTitle>Recent Evaluations</CardTitle>
            <CardDescription>Your latest progress updates</CardDescription>
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
                      {evaluation.song_elements.name} - {evaluation.song_elements.songs.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {evaluation.instruments.name} • {new Date(evaluation.evaluated_at).toLocaleString()}
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
            <h3 className="mt-6 text-xl font-semibold">No statistics yet</h3>
            <p className="mt-2 text-center text-sm text-muted-foreground max-w-sm">
              Start evaluating your progress on songs to see detailed statistics and track your learning journey
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
