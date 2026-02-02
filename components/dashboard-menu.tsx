"use client"

import { createClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Music, LogOut, BarChart3, Wrench, Home } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function DashboardMenu() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-5 border-[3px] border-[#18160C] px-5 py-3 font-sans font-extrabold text-2xl uppercase text-[#18160C] hover:bg-[#E9E5D3] transition-colors">
          Menu
          <span className="relative w-[16px] h-[16px]">
            <span className="absolute top-1/2 left-0 w-full h-[4px] bg-[#18160C] -translate-y-1/2" />
            <span className="absolute left-1/2 top-0 w-[4px] h-full bg-[#18160C] -translate-x-1/2" />
          </span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 border-[3px] border-[#18160C] bg-[#F0EEE1] rounded-none p-2">
        <DropdownMenuItem asChild className="cursor-pointer font-sans font-semibold text-lg rounded-none focus:bg-[#E9E5D3]">
          <Link href="/dashboard" className="flex items-center gap-3">
            <Music className="h-5 w-5" />
            Morceaux
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer font-sans font-semibold text-lg rounded-none focus:bg-[#E9E5D3]">
          <Link href="/dashboard/instruments" className="flex items-center gap-3">
            <Wrench className="h-5 w-5" />
            Instruments
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild className="cursor-pointer font-sans font-semibold text-lg rounded-none focus:bg-[#E9E5D3]">
          <Link href="/dashboard/stats" className="flex items-center gap-3">
            <BarChart3 className="h-5 w-5" />
            Statistiques
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-[#18160C] h-[2px] my-2" />
        <DropdownMenuItem asChild className="cursor-pointer font-sans font-semibold text-lg rounded-none focus:bg-[#E9E5D3]">
          <Link href="/" className="flex items-center gap-3">
            <Home className="h-5 w-5" />
            Accueil
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={handleLogout}
          className="cursor-pointer font-sans font-semibold text-lg rounded-none focus:bg-[#E9E5D3] text-destructive focus:text-destructive"
        >
          <LogOut className="h-5 w-5 mr-3" />
          Deconnexion
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
