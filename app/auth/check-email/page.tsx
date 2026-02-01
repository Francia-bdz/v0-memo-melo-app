"use client"

import Link from "next/link"
import Image from "next/image"
import { Mail } from "lucide-react"
import { useRouter } from "next/navigation"

export default function CheckEmailPage() {
  const router = useRouter()

  return (
    <div className="min-h-screen bg-primary p-2 sm:p-3 md:p-4">
      <div className="min-h-[calc(100vh-16px)] sm:min-h-[calc(100vh-24px)] md:min-h-[calc(100vh-32px)] bg-background flex flex-col justify-center px-6 sm:px-12 md:px-20 lg:px-32 py-12 sm:py-16 md:py-20">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8 lg:gap-12 max-w-7xl mx-auto w-full">

          {/* Content section */}
          <div className="w-full max-w-md">
            <div className="mb-8 flex h-16 w-16 items-center justify-center border-2 border-foreground">
              <Mail className="h-8 w-8 text-foreground" />
            </div>

            <h1 className="font-sans text-4xl font-black md:text-5xl text-foreground uppercase mb-6">
              Vérifiez votre e-mail
            </h1>

            <p className="text-lg text-foreground mb-4">
              Nous vous avons envoyé un lien de confirmation pour vérifier votre compte.
            </p>

            <p className="text-md text-muted-foreground mb-10">
              Cliquez sur le lien dans l’e-mail pour terminer votre inscription et commencer à utiliser Memo-Melo.
            </p>

            <Link
              href="/auth/login"
              className="text-lg font-bold underline underline-offset-4 hover:text-primary"
            >
              Retour à la connexion
            </Link>
          </div>

          {/* Mascot */}
          <div className="flex-shrink-0 w-48 sm:w-64 md:w-80 lg:w-96">
            <Image
              src="/memo-logo.svg"
              alt="Memo-Melo mascotte"
              width={400}
              height={400}
              className="w-full h-auto cursor-pointer"
              priority
              onClick={() => router.push("/")}
            />
          </div>

        </div>
      </div>
    </div>
  )
}
