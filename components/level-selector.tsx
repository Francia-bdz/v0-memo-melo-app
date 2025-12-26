"use client"

import { cn } from "@/lib/utils"

interface LevelSelectorProps {
  value: number
  onChange: (level: number) => void
}

const levels = [
  { value: 1, label: "Beginner", description: "Just started learning", color: "bg-red-500" },
  { value: 2, label: "Novice", description: "Can play slowly with mistakes", color: "bg-orange-500" },
  { value: 3, label: "Intermediate", description: "Can play at moderate speed", color: "bg-yellow-500" },
  { value: 4, label: "Advanced", description: "Can play well with few mistakes", color: "bg-lime-500" },
  { value: 5, label: "Mastered", description: "Can play perfectly at full speed", color: "bg-green-500" },
]

export function LevelSelector({ value, onChange }: LevelSelectorProps) {
  return (
    <div className="space-y-3">
      {levels.map((level) => (
        <button
          key={level.value}
          type="button"
          onClick={() => onChange(level.value)}
          className={cn(
            "w-full flex items-center gap-4 rounded-lg border-2 p-4 transition-all hover:border-primary/50",
            value === level.value ? "border-primary bg-primary/5" : "border-border",
          )}
        >
          <div
            className={cn("flex h-12 w-12 items-center justify-center rounded-full text-white font-bold", level.color)}
          >
            {level.value}
          </div>
          <div className="flex-1 text-left">
            <p className="font-semibold">{level.label}</p>
            <p className="text-sm text-muted-foreground">{level.description}</p>
          </div>
          {value === level.value && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
              <svg className="h-4 w-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
          )}
        </button>
      ))}
    </div>
  )
}
