import { Button } from "@/components/ui/button"
import { Music } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="container mx-auto px-3 sm:px-4 py-4 sm:py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg bg-primary">
              <Music className="h-5 w-5 sm:h-6 sm:w-6 text-primary-foreground" />
            </div>
            <span className="text-lg sm:text-xl font-bold">Memo-Melo</span>
          </div>
          <div className="flex gap-2 sm:gap-3">
            <Link href="/auth/login">
              <Button variant="ghost" size="sm" className="sm:size-default">
                Se connecter
              </Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button size="sm" className="sm:size-default">
                S'inscrire
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-3 sm:px-4 py-12 sm:py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
            Maîtrisez votre parcours musical
          </h1>
          <p className="mt-4 sm:mt-6 text-base sm:text-xl text-muted-foreground text-balance leading-relaxed px-2">
            Découvrez Memo-Melo, l&apos;application innovante conçue pour vous aider à apprendre et maîtriser vos
            morceaux de musique préférés grâce à des techniques d&apos;apprentissage actives et une évaluation
            personnalisée.
          </p>
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 px-4">
            <Link href="/auth/sign-up" className="w-full sm:w-auto">
              <Button size="lg" className="text-base sm:text-lg h-11 sm:h-12 px-6 sm:px-8 w-full">
                Commencer à apprendre
              </Button>
            </Link>
            <Link href="/auth/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="text-base sm:text-lg h-11 sm:h-12 px-6 sm:px-8 w-full bg-transparent"
              >
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
