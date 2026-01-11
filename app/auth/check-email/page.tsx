import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"
import Link from "next/link"

export default function CheckEmailPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-2xl">Vérifiez votre e-mail </CardTitle>
            <CardDescription>Nous vous avons envoyé un lien de confirmation pour vérifier votre compte</CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-sm text-muted-foreground mb-4">
              Cliquez sur le lien dans l'e-mail pour terminer votre inscription et commencer à utiliser Memo-Melo.
            </p>
            <Link href="/auth/login" className="text-sm underline underline-offset-4">
              Retour à la connexion
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
