"use client"

import Link from "next/link"
import type { Song } from "@/lib/types/database"
import { Music2 } from "lucide-react"

interface SongListProps {
  songs: Song[]
}

// Guitar icon SVG component
function GuitarIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className}
      width="24" 
      height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M19.59 3L21 4.41L18.41 7L19 9L17 11L12.41 6.41L14 4.41L16 5L18.59 2.41L19.59 3ZM11.59 8.59L12 9L9 12L7 10L3 14L2 16L3 17L2 18V21H5L6 20L7 21L8 20L10 16L14 12L12 10L15 7L14.41 6.59L11.59 8.59ZM6.5 17.5C6.5 18.05 6.05 18.5 5.5 18.5C4.95 18.5 4.5 18.05 4.5 17.5C4.5 16.95 4.95 16.5 5.5 16.5C6.05 16.5 6.5 16.95 6.5 17.5Z" 
        fill="#18160C"
      />
    </svg>
  )
}

// Music note icon component  
function MusicNoteIcon({ filled = true }: { filled?: boolean }) {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M6 2V11C5.46957 10.6878 4.84716 10.4962 4.2 10.45C2.98497 10.45 2 11.2835 2 12.3125C2 13.3415 2.98497 14.175 4.2 14.175C5.41503 14.175 6.4 13.3415 6.4 12.3125V5.3L12.4 3.8V9C11.8696 8.68781 11.2472 8.49617 10.6 8.45C9.38497 8.45 8.4 9.28353 8.4 10.3125C8.4 11.3415 9.38497 12.175 10.6 12.175C11.815 12.175 12.8 11.3415 12.8 10.3125V2L6 3.7V2Z" 
        fill={filled ? "#18160C" : "rgba(24, 22, 12, 0.2)"}
      />
    </svg>
  )
}

// Arrow icon component
function ArrowIcon() {
  return (
    <svg 
      width="16" 
      height="16" 
      viewBox="0 0 16 16" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        d="M6 4L10 8L6 12" 
        stroke="#000000" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Song card component
function SongCard({ song }: { song: Song }) {
  // For now, display 4 filled notes and 1 faded (placeholder for future rating)
  const filledNotes = 4
  const totalNotes = 5

  return (
    <Link href={`/dashboard/songs/${song.id}`}>
      <div className="border-[3px] border-[#18160C] p-4 h-[110px] flex flex-col justify-between relative hover:bg-[#E9E5D3] transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-0.5 flex-1 min-w-0 pr-8">
            <h3 className="font-sans font-black text-xl sm:text-2xl md:text-[28px] leading-tight text-[#18160C] truncate">
              {song.title}
            </h3>
            <p className="font-sans font-medium text-base sm:text-lg text-[#18160C] truncate">
              {song.artist || "Artiste inconnu"}
            </p>
          </div>
          <GuitarIcon className="flex-shrink-0 absolute top-4 right-6" />
        </div>
        
        <div className="flex items-center justify-between">
          {/* Music notes rating */}
          <div className="flex items-center gap-1">
            {Array.from({ length: totalNotes }, (_, i) => (
              <MusicNoteIcon key={i} filled={i < filledNotes} />
            ))}
          </div>
          
          {/* Arrow */}
          <ArrowIcon />
        </div>
      </div>
    </Link>
  )
}

export function SongList({ songs }: SongListProps) {
  if (songs.length === 0) {
    return (
      <div className="border-[3px] border-dashed border-[#18160C] p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#E9E5D3]">
            <Music2 className="h-10 w-10 text-[#18160C] opacity-50" />
          </div>
          <h3 className="mt-6 text-xl font-semibold text-[#18160C]">Aucun morceau pour le moment</h3>
          <p className="mt-2 text-center text-sm text-[#18160C] opacity-70 max-w-sm">
            Commencez votre voyage musical en ajoutant votre premier morceau
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {songs.map((song) => (
        <SongCard key={song.id} song={song} />
      ))}
    </div>
  )
}
