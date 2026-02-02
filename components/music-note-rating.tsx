"use client"

import { cn } from "@/lib/utils"

interface MusicNoteRatingProps {
  value: number
  onChange: (level: number) => void
  max?: number
}

function MusicNote({ filled, onClick }: { filled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-[21px] h-[21px] flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary rounded"
    >
      <svg
        width="21"
        height="21"
        viewBox="0 0 21 21"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(
          "transition-colors",
          filled ? "text-foreground" : "text-foreground/40"
        )}
      >
        <path
          d="M8.75 16.625C8.75 18.0747 7.19975 19.25 5.25 19.25C3.30025 19.25 1.75 18.0747 1.75 16.625C1.75 15.1753 3.30025 14 5.25 14C7.19975 14 8.75 15.1753 8.75 16.625Z"
          fill="currentColor"
        />
        <path
          d="M8.75 16.625V3.5L19.25 1.75V14.875"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M19.25 14.875C19.25 16.3247 17.6997 17.5 15.75 17.5C13.8003 17.5 12.25 16.3247 12.25 14.875C12.25 13.4253 13.8003 12.25 15.75 12.25C17.6997 12.25 19.25 13.4253 19.25 14.875Z"
          fill="currentColor"
        />
      </svg>
    </button>
  )
}

export function MusicNoteRating({ value, onChange, max = 5 }: MusicNoteRatingProps) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: max }, (_, i) => i + 1).map((level) => (
        <MusicNote
          key={level}
          filled={level <= value}
          onClick={() => onChange(level)}
        />
      ))}
    </div>
  )
}
