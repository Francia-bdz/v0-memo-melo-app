import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Music2, Calendar } from "lucide-react"
import Link from "next/link"
import type { Song } from "@/lib/types/database"

interface SongListProps {
  songs: Song[]
}

export function SongList({ songs }: SongListProps) {
  if (songs.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
            <Music2 className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-6 text-xl font-semibold">No songs yet</h3>
          <p className="mt-2 text-center text-sm text-muted-foreground max-w-sm">
            Start your musical journey by adding your first song to track your learning progress
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {songs.map((song) => (
        <Link key={song.id} href={`/dashboard/songs/${song.id}`}>
          <Card className="h-full transition-all hover:shadow-lg hover:border-primary/50">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <CardTitle className="text-xl leading-tight line-clamp-2">{song.title}</CardTitle>
                  {song.artist && <CardDescription className="mt-1 line-clamp-1">by {song.artist}</CardDescription>}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3 w-3" />
                <span>Updated {new Date(song.updated_at).toLocaleDateString()}</span>
              </div>
              {song.notes && <p className="mt-3 text-sm text-muted-foreground line-clamp-2">{song.notes}</p>}
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
