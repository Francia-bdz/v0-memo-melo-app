"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import Image from "next/image"
import { Plus } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) throw error
      router.push("/dashboard")
      router.refresh()
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[var(--vert-600)] p-4">
      <div className="w-full max-w-4xl bg-[var(--beige-100)] border-4 border-[var(--vert-600)] p-8 md:p-12 lg:p-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
          {/* Form Section */}
          <div className="w-full md:w-1/2">
            <h1 className="font-caprasimo text-3xl md:text-4xl text-foreground uppercase tracking-wide mb-8">
              Se connecter
            </h1>
            
            <form onSubmit={handleLogin} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label htmlFor="email" className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-2 border-foreground bg-white rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                />
              </div>
              
              <div className="flex flex-col gap-2">
                <Label htmlFor="password" className="text-sm font-bold uppercase tracking-wider text-foreground">
                  Mot de passe
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-2 border-foreground bg-white rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                />
              </div>
              
              {error && <p className="text-sm text-destructive">{error}</p>}
              
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-fit h-12 px-6 bg-transparent text-foreground border-2 border-foreground rounded-none hover:bg-foreground hover:text-[var(--beige-100)] font-bold uppercase tracking-wider flex items-center gap-2"
              >
                {isLoading ? "Connexion..." : "Valider"}
                <Plus className="size-4" />
              </Button>
            </form>
            
            <p className="mt-6 text-sm text-foreground">
              Pas encore inscrit ?{" "}
              <Link href="/auth/sign-up" className="underline underline-offset-4 hover:text-primary">
                S'inscrire
              </Link>
            </p>
          </div>
          
          {/* Mascot Section */}
          <div className="w-full md:w-1/2 flex items-center justify-center">
            <Image
              src="/mascot-character.jpg"
              alt="Memo-Melo mascot"
              width={300}
              height={350}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}
