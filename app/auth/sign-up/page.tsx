"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Plus } from "lucide-react"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignUpPage() {
  const [displayName, setDisplayName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const router = useRouter()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()

    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Les mots de passe ne correspondent pas")
      setIsLoading(false)
      return
    }

    if (password.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
          data: {
            display_name: displayName,
          },
        },
      })
      if (error) throw error
      router.push("/auth/check-email")
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Une erreur est survenue")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-primary p-2 sm:p-3 md:p-4">
      <div className="min-h-[calc(100vh-16px)] sm:min-h-[calc(100vh-24px)] md:min-h-[calc(100vh-32px)] bg-background flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-32 py-12 sm:py-16 md:py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 max-w-7xl mx-auto w-full">

          {/* Form section */}
          <div className="w-full max-w-md">
            <h1 className="font-sans text-4xl font-black md:text-5xl text-foreground uppercase mb-10">
              S'inscrire
            </h1>

            <form onSubmit={handleSignUp} className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <Label className="text-lg font-extrabold uppercase text-foreground">
                  Nom
                </Label>
                <Input
                  type="text"
                  required
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="h-12 border-2 border-foreground rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-lg font-extrabold uppercase text-foreground">
                  Email
                </Label>
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-12 border-2 border-foreground rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-lg font-extrabold uppercase text-foreground">
                  Mot de passe
                </Label>
                <Input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-2 border-foreground rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label className="text-lg font-extrabold uppercase text-foreground">
                  Répéter le mot de passe
                </Label>
                <Input
                  type="password"
                  required
                  value={repeatPassword}
                  onChange={(e) => setRepeatPassword(e.target.value)}
                  className="h-12 border-2 border-foreground rounded-none focus-visible:ring-0 focus-visible:border-foreground"
                />
              </div>

              {error && (
                <p className="text-md font-medium text-destructive">
                  {error}
                </p>
              )}

              <Button
                type="submit"
                disabled={isLoading}
                size="lg"
                className="w-fit font-extrabold uppercase px-6 sm:px-8 py-3 sm:py-4 h-auto"
              >
                {isLoading ? "Création..." : "Valider"}
                <Plus className="h-5 w-5" strokeWidth={3} />
              </Button>
            </form>

            <p className="mt-8 text-lg text-foreground">
              Déjà un compte ?{" "}
              <Link
                href="/auth/login"
                className="underline underline-offset-4 font-bold hover:text-primary"
              >
                Se connecter
              </Link>
            </p>
          </div>

          {/* Mascot */}
          <div className="flex-shrink-0 w-48 sm:w-64 md:w-80 lg:w-96">
            <Image
              src="/memo-logo.svg"
              alt="Memo-Melo mascotte"
              width={400}
              height={400}
              className="w-full h-auto cursor-pointer"
              priority
              onClick={() => router.push("/")}
            />
          </div>

        </div>
      </div>
    </div>
  )
}
