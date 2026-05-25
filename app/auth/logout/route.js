import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request) {
  const supabase = createClient()
  await supabase.auth.signOut()
  return NextResponse.redirect(new URL("/", request.url), { status: 303 })
}

export async function GET(request) {
  return POST(request)
}
