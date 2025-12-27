"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Music, User, LogOut, BarChart3, Wrench } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface DashboardHeaderProps {
  displayName: string
}

export function DashboardHeader({ displayName }: DashboardHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <header className="border-b bg-card">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
              <Music className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Memo-Melo</span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/dashboard">
              <Button variant="ghost">Morceaux</Button>
            </Link>
            <Link href="/dashboard/instruments">
              <Button variant="ghost">
                <Wrench className="h-4 w-4 mr-2" />
                Instruments
              </Button>
            </Link>
            <Link href="/dashboard/stats">
              <Button variant="ghost">
                <BarChart3 className="h-4 w-4 mr-2" />
                Statistiques
              </Button>
            </Link>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{displayName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </nav>
        </div>
      </div>
    </header>
  )
}
