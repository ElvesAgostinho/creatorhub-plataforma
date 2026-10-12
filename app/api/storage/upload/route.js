import { NextResponse } from "next/server"
import { getUser, papelDe } from "@/lib/auth"
import { storage, CONTENTORES } from "@/lib/storage"

export const maxDuration = 60

/**
 * Envio de ficheiros a partir do browser.
 *
 * Antes o navegador falava com a Supabase diretamente. Agora passa por aqui,
 * o que permite verificar três coisas que antes dependiam de políticas:
 * quem envia, para que contentor, e para que pasta.
 */
export async function POST(request) {
  const { data } = await getUser()
  if (!data.user) {
    return NextResponse.json({ error: "Inicia sessão para enviar ficheiros." }, { status: 401 })
  }

  const formulario = await request.formData()
  const contentor = String(formulario.get("contentor") || "")
  const caminho = String(formulario.get("caminho") || "")
  const upsert = formulario.get("upsert") === "1"
  const ficheiro = formulario.get("ficheiro")

  if (!CONTENTORES[contentor]) {
    return NextResponse.json({ error: `Contentor desconhecido: ${contentor}` }, { status: 400 })
  }
  if (!ficheiro || typeof ficheiro.arrayBuffer !== "function") {
    return NextResponse.json({ error: "Nenhum ficheiro recebido." }, { status: 400 })
  }
  if (caminho.includes("..") || caminho.startsWith("/")) {
    return NextResponse.json({ error: "Caminho inválido." }, { status: 400 })
  }

  // Cada criador escreve dentro da sua própria pasta. Sem isto, qualquer
  // utilizador autenticado podia substituir os ficheiros de outro.
  const { papel } = await papelDe(data.user.id)
  if (papel !== "admin" && !caminho.startsWith(`${data.user.id}/`)) {
    return NextResponse.json(
      { error: "Os ficheiros têm de ser enviados para a tua própria pasta." },
      { status: 403 }
    )
  }

  const limiteMb = Number(process.env.UPLOAD_LIMITE_MB || 500)
  if (ficheiro.size > limiteMb * 1024 * 1024) {
    return NextResponse.json({ error: `O ficheiro passa o limite de ${limiteMb} MB.` }, { status: 413 })
  }

  const { data: resultado, error } = await storage.from(contentor).upload(caminho, ficheiro, {
    upsert,
    contentType: ficheiro.type,
  })

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })

  const publico = CONTENTORES[contentor].publico
  return NextResponse.json({
    data: {
      ...resultado,
      publicUrl: publico ? storage.from(contentor).getPublicUrl(caminho).data.publicUrl : null,
    },
  })
}
