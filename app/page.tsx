import { Button } from "@/components/ui/button"
import { Music, Target, BarChart3, CheckCircle2 } from "lucide-react"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <header className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Music className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Memo-Melo</span>
          </div>
          <div className="flex gap-3">
            <Link href="/auth/login">
              <Button variant="ghost">Se connecter</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>S'inscrire</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold tracking-tight lg:text-6xl text-balance">Maîtrisez votre parcours musical</h1>
          <p className="mt-6 text-xl text-muted-foreground text-balance leading-relaxed">
            Découvrez Memo-Melo, l&apos;application innovante conçue pour vous aider à apprendre et maîtriser vos morceaux de musique préférés grâce à des techniques d&apos;apprentissage actives et une évaluation personnalisée.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="text-lg h-12 px-8">
                Commencer à apprendre
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="text-lg h-12 px-8 bg-transparent">
                Se connecter
              </Button>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
