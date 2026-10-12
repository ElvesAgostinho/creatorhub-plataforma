import { NextResponse } from "next/server"
import { signUp } from "@/lib/auth"

export async function POST(request) {
  const { email, password, options } = await request.json().catch(() => ({}))

  if (!email || !password) {
    return NextResponse.json({ error: "Indica o email e a palavra-passe." }, { status: 400 })
  }
  if (String(password).length < 8) {
    return NextResponse.json({ error: "A palavra-passe tem de ter pelo menos 8 caracteres." }, { status: 400 })
  }

  const { data, error } = await signUp({ email, password, options })
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  return NextResponse.json({ data: { user: data.user } })
}
