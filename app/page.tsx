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
              <Button variant="ghost">Login</Button>
            </Link>
            <Link href="/auth/sign-up">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl font-bold tracking-tight lg:text-6xl text-balance">Master Your Musical Journey</h1>
          <p className="mt-6 text-xl text-muted-foreground text-balance leading-relaxed">
            Track your learning progress across multiple songs and instruments. Evaluate each song element, monitor your
            mastery levels, and achieve your musical goals.
          </p>
          <div className="mt-10 flex justify-center gap-4">
            <Link href="/auth/sign-up">
              <Button size="lg" className="text-lg h-12 px-8">
                Start Learning
              </Button>
            </Link>
            <Link href="/auth/login">
              <Button size="lg" variant="outline" className="text-lg h-12 px-8 bg-transparent">
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        <div className="mt-24 grid gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
          <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Music className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold">Track Songs</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Add and organize all the songs you&apos;re learning in one place
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold">Break Down Elements</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Divide songs into intro, verse, chorus, and more for focused practice
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold">Evaluate Progress</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Rate your mastery from 1-5 for each element and instrument combination
            </p>
          </div>
          <div className="flex flex-col items-center text-center p-6 rounded-lg bg-card border">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
              <BarChart3 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mt-4 font-semibold">View Statistics</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Visualize your learning journey with detailed progress analytics
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
