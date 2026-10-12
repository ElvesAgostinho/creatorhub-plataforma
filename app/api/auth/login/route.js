import { NextResponse } from "next/server"
import { signInWithPassword } from "@/lib/auth"

export async function POST(request) {
  const { email, password } = await request.json().catch(() => ({}))

  if (!email || !password) {
    return NextResponse.json({ error: "Indica o email e a palavra-passe." }, { status: 400 })
  }

  try {
    const { data, error } = await signInWithPassword({ email, password })
    if (error) return NextResponse.json({ error: error.message }, { status: 401 })
    return NextResponse.json({ data: { user: data.user } })
  } catch (e) {
    console.error("[login]", e.message)
    return NextResponse.json(
      { error: "O serviço de contas está indisponível. Tenta daqui a pouco." },
      { status: 503 }
    )
  }
}
