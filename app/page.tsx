import { Plus } from "lucide-react"
import Image from "next/image"
import Link from "next/link"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#009A4B] p-2 sm:p-3 md:p-4">
      {/* Inner container with beige background */}
      <div className="min-h-[calc(100vh-16px)] sm:min-h-[calc(100vh-24px)] md:min-h-[calc(100vh-32px)] bg-[#E9E5D3] flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-32 py-12 sm:py-16 md:py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 max-w-7xl mx-auto w-full">
          {/* Left content */}
          <div className="flex flex-col items-center lg:items-start text-center lg:text-left">
            {/* Title */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-[#18160C] tracking-tight leading-none">
              MÉMO-MELO
            </h1>
            
            {/* Tagline */}
            <p className="mt-4 sm:mt-6 text-xl sm:text-2xl md:text-3xl font-bold text-[#18160C]">
              Gardez le rythme de votre progression
            </p>
            
            {/* Buttons */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
              {/* Primary button - S'INSCRIRE */}
              <Link href="/auth/sign-up">
                <button className="flex items-center justify-center gap-3 bg-[#009A4B] hover:bg-[#008B44] text-white font-extrabold text-sm sm:text-base uppercase tracking-wide px-6 sm:px-8 py-3 sm:py-4 transition-colors">
                  <span>{"S'INSCRIRE"}</span>
                  <Plus className="h-5 w-5" strokeWidth={3} />
                </button>
              </Link>
              
              {/* Secondary button - SE CONNECTER */}
              <Link href="/auth/login">
                <button className="flex items-center justify-center gap-3 bg-[#E9E5D3] hover:bg-[#D8D2B1] text-[#18160C] font-extrabold text-sm sm:text-base uppercase tracking-wide px-6 sm:px-8 py-3 sm:py-4 border-2 border-[#18160C] transition-colors">
                  <span>SE CONNECTER</span>
                  <Plus className="h-5 w-5" strokeWidth={3} />
                </button>
              </Link>
            </div>
          </div>
          
          {/* Right content - Mascot */}
          <div className="flex-shrink-0 w-48 sm:w-64 md:w-80 lg:w-96">
            <Image
              src="/mascot.jpg"
              alt="Mémo-Melo mascotte - notes de musique souriantes"
              width={400}
              height={400}
              className="w-full h-auto"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}
