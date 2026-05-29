import { NextResponse } from "next/server"
import { createClient, createServiceClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(req, { params }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "Não autenticado" }, { status: 401 })
  }

  const svc = createServiceClient()

  // Buscar produto
  const { data: product, error: pe } = await svc
    .from("products")
    .select("id, slug, title, audio_path, type")
    .eq("slug", params.slug)
    .maybeSingle()

  if (pe) console.error("[AudioStream] DB:", pe.message)
  if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
  if (product.type !== "audiobook") return NextResponse.json({ error: "Apenas audiobooks" }, { status: 400 })
  if (!product.audio_path) return NextResponse.json({ error: "Áudio ainda não disponível" }, { status: 404 })

  // Verificar acesso
  const { data: profile } = await svc.from("profiles").select("role").eq("id", user.id).maybeSingle()
  const isAdmin = profile?.role === "admin"

  if (!isAdmin) {
    const { data: purchase } = await svc
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .eq("status", "active")
      .maybeSingle()
    if (!purchase) return NextResponse.json({ error: "Acesso não autorizado" }, { status: 403 })
  }

  // Normalizar path do ficheiro
  // Formatos possíveis: "storage:audio/path/file.mp3", "audio/path/file.mp3", "path/file.mp3"
  let audioPath = product.audio_path
  if (audioPath.startsWith("storage:audio/")) audioPath = audioPath.slice("storage:audio/".length)
  else if (audioPath.startsWith("audio/")) audioPath = audioPath.slice("audio/".length)
  else if (audioPath.startsWith("/")) audioPath = audioPath.slice(1)

  console.log(`[AudioStream] bucket=audio path="${audioPath}" user=${user.id}`)

  // Criar URL assinada para streaming (1 hora de validade)
  const { data: signed, error: se } = await svc.storage.from("audio").createSignedUrl(audioPath, 3600)

  if (se || !signed?.signedUrl) {
    console.error(`[AudioStream] Erro ao criar URL assinada: ${se?.message}`)
    return NextResponse.json({ error: "Erro ao aceder ao áudio" }, { status: 500 })
  }

  // Suportar Range Requests para seeking no player
  const rangeHeader = req.headers.get("range")
  
  // Buscar o ficheiro e fazer streaming
  const fetchHeaders = {}
  if (rangeHeader) fetchHeaders["Range"] = rangeHeader

  const upstream = await fetch(signed.signedUrl, { headers: fetchHeaders })
  
  if (!upstream.ok && upstream.status !== 206) {
    return NextResponse.json({ error: "Erro ao fazer streaming do áudio" }, { status: 500 })
  }

  const responseHeaders = {
    "Content-Type": upstream.headers.get("content-type") || "audio/mpeg",
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, max-age=3600",
  }

  if (upstream.headers.get("content-length")) {
    responseHeaders["Content-Length"] = upstream.headers.get("content-length")
  }
  if (upstream.headers.get("content-range")) {
    responseHeaders["Content-Range"] = upstream.headers.get("content-range")
  }

  return new NextResponse(upstream.body, {
    status: upstream.status,
    headers: responseHeaders
  })
}
