"use client";

import Link from "next/link";
import type { Song } from "@/lib/types/database";
import { Music2 } from "lucide-react";

interface SongListProps {
  songs: Song[];
}

// Guitar icon SVG component
function GuitarIcon({ className }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M23.8664 2.06887L21.9311 0.133594C21.753 -0.0445312 21.4642 -0.0445312 21.286 0.133594L19.3507 2.06887C19.1727 2.24691 19.1726 2.53566 19.3506 2.71378L13.9901 8.07422C12.2262 6.83765 10.2652 6.59822 9.24328 7.62009C9.01172 7.85165 8.84494 8.13159 8.73975 8.4465C8.6505 8.70778 8.54822 8.97581 8.42222 9.24309C8.27456 9.55612 8.07957 9.8535 7.81988 10.1132C7.45622 10.4768 7.01672 10.7122 6.5595 10.8591C5.60813 11.1647 4.43813 11.3876 3.45863 11.6833C3.09535 11.7739 2.74725 11.9039 2.42007 12.0739C2.262 12.1515 2.11857 12.2347 1.99388 12.3249C1.76082 12.4812 1.54163 12.6608 1.33847 12.8639C0.43566 13.7668 -0.00140287 14.9962 3.38246e-06 16.3125C0.00187838 18.1048 0.816753 20.0632 2.37657 21.6231C3.94172 23.1882 5.89032 24.0036 7.6875 24C8.99691 23.9974 10.2369 23.5599 11.1356 22.6612C11.3398 22.4571 11.5197 22.2363 11.6766 22.0019C11.7639 21.8808 11.8447 21.7425 11.92 21.5902C12.0967 21.2525 12.2313 20.8928 12.323 20.5166C12.6152 19.5421 12.8369 18.3835 13.1401 17.4398C13.287 16.9826 13.5223 16.5431 13.886 16.1795C14.1457 15.9198 14.443 15.7248 14.7561 15.5771C15.0191 15.453 15.2829 15.3521 15.5404 15.2639C15.8603 15.159 16.1449 14.9912 16.3795 14.7565C17.4015 13.7346 17.162 11.7735 15.9254 10.0096L21.2858 4.64915C21.464 4.82728 21.7529 4.82747 21.9311 4.64934L23.8664 2.71406C24.0445 2.53584 24.0445 2.247 23.8664 2.06887ZM7.74422 19.4912L4.51875 16.2657L5.16385 15.6206L8.38931 18.8461L7.74422 19.4912ZM12.5267 13.8922C11.8587 14.5601 10.7756 14.5601 10.1076 13.8922C9.4395 13.2242 9.4396 12.1411 10.1076 11.473C10.7755 10.8051 11.8586 10.8051 12.5267 11.473C13.1947 12.141 13.1947 13.2241 12.5267 13.8922Z"
        fill="#18160C"
      />
    </svg>
  );
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
        d="M14.6667 11.9997V1.99967C14.6667 1.82286 14.5965 1.65329 14.4714 1.52827C14.3464 1.40325 14.1769 1.33301 14 1.33301H6.00004C5.82323 1.33301 5.65366 1.40325 5.52864 1.52827C5.40361 1.65329 5.33337 1.82286 5.33337 1.99967V9.70367C4.92981 9.46372 4.46954 9.33577 4.00004 9.33301C3.47263 9.33301 2.95705 9.4894 2.51852 9.78242C2.07999 10.0754 1.7382 10.4919 1.53636 10.9792C1.33453 11.4665 1.28172 12.0026 1.38461 12.5199C1.48751 13.0372 1.74148 13.5124 2.11442 13.8853C2.48736 14.2582 2.96252 14.5122 3.4798 14.6151C3.99708 14.718 4.53326 14.6652 5.02053 14.4634C5.5078 14.2615 5.92428 13.9197 6.21729 13.4812C6.51031 13.0427 6.66671 12.5271 6.66671 11.9997V2.66634H13.3334V9.70367C12.9298 9.46372 12.4695 9.33577 12 9.33301C11.4726 9.33301 10.9571 9.4894 10.5185 9.78242C10.08 10.0754 9.7382 10.4919 9.53636 10.9792C9.33453 11.4665 9.28172 12.0026 9.38461 12.5199C9.48751 13.0372 9.74148 13.5124 10.1144 13.8853C10.4874 14.2582 10.9625 14.5122 11.4798 14.6151C11.9971 14.718 12.5333 14.6652 13.0205 14.4634C13.5078 14.2615 13.9243 13.9197 14.2173 13.4812C14.5103 13.0427 14.6667 12.5271 14.6667 11.9997ZM4.00004 13.333C3.73633 13.333 3.47855 13.2548 3.25928 13.1083C3.04002 12.9618 2.86912 12.7536 2.7682 12.5099C2.66729 12.2663 2.64088 11.9982 2.69233 11.7396C2.74377 11.4809 2.87076 11.2433 3.05723 11.0569C3.2437 10.8704 3.48128 10.7434 3.73992 10.692C3.99856 10.6405 4.26665 10.6669 4.51029 10.7678C4.75392 10.8688 4.96216 11.0396 5.10867 11.2589C5.25518 11.4782 5.33337 11.736 5.33337 11.9997C5.33337 12.3533 5.1929 12.6924 4.94285 12.9425C4.6928 13.1925 4.35366 13.333 4.00004 13.333ZM10.6667 11.9997C10.6667 11.736 10.7449 11.4782 10.8914 11.2589C11.0379 11.0396 11.2462 10.8688 11.4898 10.7678C11.7334 10.6669 12.0015 10.6405 12.2602 10.692C12.5188 10.7434 12.7564 10.8704 12.9429 11.0569C13.1293 11.2433 13.2563 11.4809 13.3078 11.7396C13.3592 11.9982 13.3328 12.2663 13.2319 12.5099C13.131 12.7536 12.9601 12.9618 12.7408 13.1083C12.5215 13.2548 12.2638 13.333 12 13.333C11.6464 13.333 11.3073 13.1925 11.0572 12.9425C10.8072 12.6924 10.6667 12.3533 10.6667 11.9997Z"
        fill={filled ? "#18160C" : "rgba(24, 22, 12, 0.2)"}
      />
    </svg>
  );
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
  );
}

// Song card component
function SongCard({ song }: { song: Song }) {
  // For now, display 4 filled notes and 1 faded (placeholder for future rating)
  const filledNotes = 4;
  const totalNotes = 5;

  return (
    <Link href={`/dashboard/songs/${song.id}`}>
      <div className="border-[3px] border-[#18160C] p-4 flex flex-col justify-between relative hover:bg-(--beige-900)/10 transition-colors">
        <div className="flex items-start justify-between">
          <div className="flex flex-col flex-1 min-w-0 pr-8">
            <h3 className="font-sans font-black text-xl sm:text-2xl md:text-[28px] leading-tight text-[#18160C] truncate">
              {song.title}
            </h3>
            <p className="font-sans font-medium text-base sm:text-lg text-[#18160C] truncate">
              {song.artist || "Artiste inconnu"}
            </p>
          </div>
          <GuitarIcon className="flex-shrink-0 absolute top-4 right-6" />
        </div>

        <div className="flex items-center justify-between mt-1">
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
  );
}

export function SongList({ songs }: SongListProps) {
  if (songs.length === 0) {
    return (
      <div className="border-[3px] border-dashed border-[#18160C] p-12">
        <div className="flex flex-col items-center justify-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#18160C]/10">
            <Music2 className="h-10 w-10 text-[#18160C] opacity-50" />
          </div>
          <h3 className="mt-6 text-xl font-semibold text-[#18160C]">
            Aucun morceau pour le moment
          </h3>
          <p className="mt-2 text-center text-sm text-[#18160C] opacity-70 max-w-sm">
            Commencez ton voyage musical en ajoutant ton premier morceau
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {songs.map((song) => (
        <SongCard key={song.id} song={song} />
      ))}
    </div>
  );
}
