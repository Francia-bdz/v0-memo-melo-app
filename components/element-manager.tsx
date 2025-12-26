"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Plus, Music2 } from "lucide-react"
import type { SongElement, Instrument } from "@/lib/types/database"
import { ElementCard } from "@/components/element-card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface ElementManagerProps {
  songId: string
  elements: SongElement[]
  instruments: Instrument[]
  onElementsChange: (elements: SongElement[]) => void
}

export function ElementManager({ songId, elements, instruments, onElementsChange }: ElementManagerProps) {
  const [isAddingElement, setIsAddingElement] = useState(false)
  const [newElementName, setNewElementName] = useState("")
  const [newElementDescription, setNewElementDescription] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleAddElement = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingElement(true)
    setError(null)

    try {
      const { data: element, error: insertError } = await supabase
        .from("song_elements")
        .insert({
          song_id: songId,
          name: newElementName,
          description: newElementDescription || null,
          order_index: elements.length,
        })
        .select()
        .single()

      if (insertError) throw insertError

      onElementsChange([...elements, element])
      setNewElementName("")
      setNewElementDescription("")
      setShowAddDialog(false)
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsAddingElement(false)
    }
  }

  const handleDeleteElement = async (id: string) => {
    try {
      const { error: deleteError } = await supabase.from("song_elements").delete().eq("id", id)

      if (deleteError) throw deleteError

      onElementsChange(elements.filter((e) => e.id !== id))
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Song Elements</CardTitle>
              <CardDescription>
                Break down the song into sections like intro, verse, chorus, bridge, solo, etc.
              </CardDescription>
            </div>
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Element
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add Song Element</DialogTitle>
                  <DialogDescription>Add a new section or element to this song</DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAddElement} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="element-name">Element Name *</Label>
                    <Input
                      id="element-name"
                      placeholder="e.g., Intro, Verse 1, Chorus, Bridge..."
                      required
                      value={newElementName}
                      onChange={(e) => setNewElementName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="element-description">Description</Label>
                    <Textarea
                      id="element-description"
                      placeholder="Optional notes about this element..."
                      rows={3}
                      value={newElementDescription}
                      onChange={(e) => setNewElementDescription(e.target.value)}
                    />
                  </div>
                  {error && <p className="text-sm text-destructive">{error}</p>}
                  <div className="flex gap-3">
                    <Button type="submit" disabled={isAddingElement} className="flex-1">
                      {isAddingElement ? "Adding..." : "Add Element"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setShowAddDialog(false)}
                      className="flex-1 bg-transparent"
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {elements.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center border-2 border-dashed rounded-lg">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Music2 className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 font-medium">No elements yet</p>
              <p className="mt-1 text-sm text-muted-foreground max-w-sm">
                Add elements to break down this song into learnable sections
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {elements.map((element) => (
                <ElementCard
                  key={element.id}
                  element={element}
                  instruments={instruments}
                  onDelete={handleDeleteElement}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
