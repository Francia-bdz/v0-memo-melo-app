"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from "@/components/ui/sheet"
import { Music, LogOut, BarChart3, Wrench, Home, Menu, PianoIcon } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

export function DashboardMenu() {
  const router = useRouter()
  const supabase = createClient()
  const [isOpen, setIsOpen] = useState(false)

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push("/auth/login")
    router.refresh()
  }

  const menuItems = [
    { href: "/dashboard", icon: Music, label: "Morceaux" },
    // { href: "/dashboard/instruments", icon: PianoIcon, label: "Instruments" },
    { href: "/dashboard/stats", icon: BarChart3, label: "Statistiques" },
  ]

  const MenuButton = ({ className = "" }: { className?: string }) => (
    <button className={`flex items-center gap-5 border-[3px] border-[#18160C] px-5 py-3 font-sans font-extrabold text-xl uppercase text-[#18160C] hover:bg-(--beige-900)/10 transition-colors cursor-pointer ${className}`}>
      <span className="hidden sm:inline">Menu</span>
      <span className="sm:hidden">
        <Menu className="h-5 w-5" />
      </span>
      <span className="relative w-[16px] h-[16px] hidden sm:block">
        <span className="absolute top-1/2 left-0 w-full h-[3px] bg-[#18160C] -translate-y-1/2" />
        <span className="absolute left-1/2 top-0 w-[3px] h-full bg-[#18160C] -translate-x-1/2" />
      </span>
    </button>
  )

  return (
    <>
      {/* Desktop Menu - Dropdown */}
      <div className="hidden sm:block">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <MenuButton />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 border-[3px] border-[#18160C] bg-[#F0EEE1] rounded-none p-2">
            {menuItems.map((item) => (
              <DropdownMenuItem key={item.href} asChild className="cursor-pointer font-sans font-semibold text-lg rounded-none focus:bg-[#E9E5D3]">
                <Link href={item.href} className="flex items-center gap-3">
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
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
      </div>

      {/* Mobile Menu - Sheet/Drawer */}
      <div className="sm:hidden">
        <button 
          onClick={() => setIsOpen(true)}
          className="flex items-center justify-center border-[3px] border-[#18160C] p-3 font-sans font-extrabold text-[#18160C] hover:bg-(--beige-900)/10 transition-colors cursor-pointer"
          aria-label="Ouvrir le menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetContent 
            side="right" 
            className="w-[280px] border-l-[3px] border-[#18160C] bg-[#F0EEE1] p-0"
          >
            <SheetHeader className="pl-5">
              <SheetTitle className="font-sans font-extrabold text-xl uppercase text-[#18160C]">
                Menu
              </SheetTitle>
            </SheetHeader>
            
            <nav className="flex flex-col p-4 gap-2">
              {menuItems.map((item) => (
                <SheetClose key={item.href} asChild>
                  <Link 
                    href={item.href} 
                    className="flex items-center gap-3 p-3 font-sans font-semibold text-lg text-[#18160C] hover:bg-[#E9E5D3] transition-colors"
                  >
                    <item.icon className="h-5 w-5" />
                    {item.label}
                  </Link>
                </SheetClose>
              ))}
              
              <div className="h-[2px] bg-[#18160C] my-2" />
              
              <SheetClose asChild>
                <Link 
                  href="/" 
                  className="flex items-center gap-3 p-3 font-sans font-semibold text-lg text-[#18160C] hover:bg-[#E9E5D3] transition-colors"
                >
                  <Home className="h-5 w-5" />
                  Accueil
                </Link>
              </SheetClose>
              
              <button 
                onClick={() => {
                  setIsOpen(false)
                  handleLogout()
                }}
                className="flex items-center gap-3 p-3 font-sans font-semibold text-lg text-destructive hover:bg-[#E9E5D3] transition-colors text-left"
              >
                <LogOut className="h-5 w-5" />
                Deconnexion
              </button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}
