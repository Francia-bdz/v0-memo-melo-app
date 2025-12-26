"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Trash2, Wrench } from "lucide-react"
import type { Instrument } from "@/lib/types/database"
import { useRouter } from "next/navigation"

interface InstrumentManagerProps {
  instruments: Instrument[]
}

export function InstrumentManager({ instruments: initialInstruments }: InstrumentManagerProps) {
  const [instruments, setInstruments] = useState(initialInstruments)
  const [newInstrumentName, setNewInstrumentName] = useState("")
  const [isAdding, setIsAdding] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()
  const router = useRouter()

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAdding(true)
    setError(null)

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error("Not authenticated")

      const { data: instrument, error: insertError } = await supabase
        .from("instruments")
        .insert({
          user_id: user.id,
          name: newInstrumentName,
        })
        .select()
        .single()

      if (insertError) throw insertError

      setInstruments([...instruments, instrument])
      setNewInstrumentName("")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsAdding(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const { error: deleteError } = await supabase.from("instruments").delete().eq("id", id)

      if (deleteError) throw deleteError

      setInstruments(instruments.filter((i) => i.id !== id))
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Add Instrument</CardTitle>
          <CardDescription>Add a new instrument to track your learning progress</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAdd} className="flex gap-3">
            <div className="flex-1">
              <Input
                placeholder="e.g., Electric Guitar, Piano, Drums..."
                value={newInstrumentName}
                onChange={(e) => setNewInstrumentName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={isAdding || !newInstrumentName.trim()}>
              <Plus className="h-4 w-4 mr-2" />
              {isAdding ? "Adding..." : "Add"}
            </Button>
          </form>
          {error && <p className="text-sm text-destructive mt-2">{error}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Instruments</CardTitle>
          <CardDescription>
            {instruments.length === 0
              ? "No instruments yet. Add your first instrument above."
              : `You have ${instruments.length} instrument${instruments.length === 1 ? "" : "s"}`}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {instruments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted">
                <Wrench className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">Add an instrument to get started</p>
            </div>
          ) : (
            <div className="space-y-2">
              {instruments.map((instrument) => (
                <div
                  key={instrument.id}
                  className="flex items-center justify-between rounded-lg border p-4 hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                      <Wrench className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{instrument.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Added {new Date(instrument.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(instrument.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
