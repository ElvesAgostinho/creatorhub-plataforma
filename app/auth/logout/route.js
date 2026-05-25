import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function POST(request) {
  const supabase = createClient()
  await supabase.auth.signOut()
  
  // Use the origin header if available, which contains the exact URL the browser is at
  const originUrl = request.headers.get("origin") || process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  
  return NextResponse.redirect(new URL("/", originUrl), { status: 303 })
}

export async function GET(request) {
  return POST(request)
}
