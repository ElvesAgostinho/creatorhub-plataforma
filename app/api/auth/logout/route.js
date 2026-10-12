import { NextResponse } from "next/server"
import { signOut } from "@/lib/auth"

export async function POST() {
  try {
    await signOut()
  } catch (e) {
    // Mesmo que a revogação em base de dados falhe, o cookie tem de cair
    console.error("[logout]", e.message)
  }
  return NextResponse.json({ data: { ok: true } })
}
