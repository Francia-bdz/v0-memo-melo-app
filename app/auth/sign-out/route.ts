import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  const supabase = await createClient()
  
  await supabase.auth.signOut()

  const { origin } = new URL(request.url)
  const forwardedHost = request.headers.get("x-forwarded-host")
  const isLocalEnv = process.env.NODE_ENV === "development"

  if (isLocalEnv) {
    return NextResponse.redirect(`${origin}/`, { status: 302 })
  } else if (forwardedHost) {
    return NextResponse.redirect(`https://${forwardedHost}/`, { status: 302 })
  } else {
    return NextResponse.redirect(`${origin}/`, { status: 302 })
  }
}
