import Link from "next/link"
import Image from "next/image"
import { Mail } from "lucide-react"

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-[var(--vert-600)] p-4">
      <div className="w-full max-w-4xl bg-[var(--beige-100)] border-4 border-[var(--vert-600)] p-8 md:p-12 lg:p-16">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 md:gap-16">
          {/* Content Section */}
          <div className="w-full md:w-1/2">
            <div className="mb-6 flex h-16 w-16 items-center justify-center border-2 border-foreground">
              <Mail className="h-8 w-8 text-foreground" />
            </div>
            
            <h1 className="font-caprasimo text-3xl md:text-4xl text-foreground uppercase tracking-wide mb-6">
              Vérifiez votre e-mail
            </h1>
            
            <p className="text-foreground mb-4">
              Nous vous avons envoyé un lien de confirmation pour vérifier votre compte.
            </p>
            
            <p className="text-sm text-muted-foreground mb-8">
              Cliquez sur le lien dans l'e-mail pour terminer votre inscription et commencer à utiliser Memo-Melo.
            </p>
            
            <Link 
              href="/auth/login" 
              className="text-sm text-foreground underline underline-offset-4 hover:text-primary"
            >
              Retour à la connexion
            </Link>
          </div>
          
          {/* Mascot Section */}
          <div className="w-full md:w-1/2 flex items-center justify-center">
            <Image
              src="/mascot-character.jpg"
              alt="Memo-Melo mascot"
              width={300}
              height={350}
              className="object-contain"
              priority
            />
          </div>
        </div>
      </div>
    </div>
  )
}
