"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import type { Song } from "@/lib/types/database"
import { AlertTriangle } from "lucide-react"

interface DeleteSongDialogProps {
  song: Song
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function DeleteSongDialog({ song, open, onOpenChange }: DeleteSongDialogProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase.from("songs").delete().eq("id", song.id)

      if (deleteError) throw deleteError

      router.push("/dashboard")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <div>
              <DialogTitle>Supprimer le morceau</DialogTitle>
              <DialogDescription>Cette action est irréversible</DialogDescription>
            </div>
          </div>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm">
            Êtes-vous sûr de vouloir supprimer <span className="font-semibold">{song.title}</span> ? Cela supprimera
            également tous les éléments et évaluations associés à ce morceau.
          </p>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-3">
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting} className="flex-1">
              {isDeleting ? "Suppression..." : "Supprimer le morceau"}
            </Button>
            <Button variant="outline" onClick={() => onOpenChange(false)} className="flex-1 bg-transparent">
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
