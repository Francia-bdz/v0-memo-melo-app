"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Trash2, Target } from "lucide-react"
import type { SongElement, Instrument } from "@/lib/types/database"
import Link from "next/link"

interface ElementCardProps {
  element: SongElement
  instruments: Instrument[]
  onDelete: (id: string) => void
}

export function ElementCard({ element, instruments, onDelete }: ElementCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{element.name}</CardTitle>
            {element.description && <CardDescription className="mt-1">{element.description}</CardDescription>}
          </div>
          <Button variant="ghost" size="icon" onClick={() => onDelete(element.id)}>
            <Trash2 className="h-4 w-4 text-destructive" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {instruments.length === 0 ? (
          <div className="rounded-lg border border-dashed p-4 text-center">
            <p className="text-sm text-muted-foreground">
              Aucun instrument disponible.{" "}
              <Link href="/dashboard/instruments" className="underline underline-offset-4">
                Voir les instruments
              </Link>{" "}
              pour commencer les évaluations
            </p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {instruments.map((instrument) => (
              <Link key={instrument.id} href={`/dashboard/evaluate/${element.id}/${instrument.id}`}>
                <Button variant="outline" size="sm">
                  <Target className="h-3 w-3 mr-2" />
                  Évaluer : {instrument.name}
                </Button>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
