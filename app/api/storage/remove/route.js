import { NextResponse } from "next/server"
import { getUser, papelDe } from "@/lib/auth"
import { storage, CONTENTORES } from "@/lib/storage"

export async function POST(request) {
  const { data } = await getUser()
  if (!data.user) return NextResponse.json({ error: "Sem sessão." }, { status: 401 })

  const { contentor, caminhos } = await request.json().catch(() => ({}))
  if (!CONTENTORES[contentor]) {
    return NextResponse.json({ error: `Contentor desconhecido: ${contentor}` }, { status: 400 })
  }

  const lista = (Array.isArray(caminhos) ? caminhos : [caminhos]).filter(Boolean).map(String)
  const { papel } = await papelDe(data.user.id)

  if (papel !== "admin") {
    const alheio = lista.find((c) => !c.startsWith(`${data.user.id}/`))
    if (alheio) {
      return NextResponse.json({ error: "Só podes apagar os teus próprios ficheiros." }, { status: 403 })
    }
  }

  const { error } = await storage.from(contentor).remove(lista)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  return NextResponse.json({ data: { removidos: lista.length } })
}
