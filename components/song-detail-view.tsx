"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowLeft, Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import type { Song, SongElement, Instrument } from "@/lib/types/database"
import { ElementManager } from "@/components/element-manager"
import { DeleteSongDialog } from "@/components/delete-song-dialog"
import { EditSongDialog } from "@/components/edit-song-dialog"

interface SongDetailViewProps {
  song: Song
  elements: SongElement[]
  instruments: Instrument[]
}

export function SongDetailView({ song, elements: initialElements, instruments }: SongDetailViewProps) {
  const [elements, setElements] = useState(initialElements)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const router = useRouter()

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
        </CardHeader>
        <CardContent>
          {song.notes && (
            <div className="rounded-lg bg-muted p-4">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{song.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <ElementManager songId={song.id} elements={elements} instruments={instruments} onElementsChange={setElements} />

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
