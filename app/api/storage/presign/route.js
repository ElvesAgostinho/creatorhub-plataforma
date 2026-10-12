import { NextResponse } from "next/server"
import { getUser, papelDe } from "@/lib/auth"
import { CONTENTORES } from "@/lib/storage"
import { Client } from "minio"

/**
 * Devolve um endereço assinado para o browser enviar o ficheiro diretamente
 * para o MinIO.
 *
 * Isto substitui o envio retomável por TUS que existia contra a Supabase. Os
 * vídeos das aulas podem ter centenas de megabytes e não devem passar pelo
 * servidor da aplicação: o endereço é assinado aqui, com validade curta, e o
 * ficheiro viaja do navegador para o armazenamento sem escalas.
 */
export async function POST(request) {
  const { data } = await getUser()
  if (!data.user) return NextResponse.json({ error: "Inicia sessão." }, { status: 401 })

  const { contentor, caminho, contentType } = await request.json().catch(() => ({}))

  if (!CONTENTORES[contentor]) {
    return NextResponse.json({ error: `Contentor desconhecido: ${contentor}` }, { status: 400 })
  }
  if (!caminho || caminho.includes("..") || caminho.startsWith("/")) {
    return NextResponse.json({ error: "Caminho inválido." }, { status: 400 })
  }

  const { papel } = await papelDe(data.user.id)
  if (papel !== "admin" && !caminho.startsWith(`${data.user.id}/`)) {
    return NextResponse.json({ error: "Só podes enviar para a tua própria pasta." }, { status: 403 })
  }

  try {
    const minio = new Client({
      endPoint: process.env.S3_ENDPOINT.replace(/^https?:\/\//, "").split(":")[0],
      port: Number(process.env.S3_PORT || (process.env.S3_SSL === "false" ? 9000 : 443)),
      useSSL: process.env.S3_SSL !== "false",
      accessKey: process.env.S3_ACCESS_KEY,
      secretKey: process.env.S3_SECRET_KEY,
      region: process.env.S3_REGION || "us-east-1",
    })

    const url = await minio.presignedPutObject(contentor, caminho, 60 * 30)

    return NextResponse.json({
      data: {
        url,
        caminho,
        referencia: `storage:${contentor}/${caminho}`,
        publico: CONTENTORES[contentor].publico,
      },
    })
  } catch (err) {
    console.error("[presign]", err.message)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
