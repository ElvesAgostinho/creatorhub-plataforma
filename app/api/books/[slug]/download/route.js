import { NextResponse } from "next/server"
import { PDFDocument, StandardFonts, rgb, degrees } from "pdf-lib"
import { createClient, createServiceClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export async function GET(_req, { params }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.redirect(new URL(`/login?next=/library`, _req.url))
  }

  const svc = createServiceClient()

  const { data: product, error: pe } = await svc
    .from("products")
    .select("id, slug, title, file_path, type")
    .eq("slug", params.slug)
    .maybeSingle()

  if (pe) console.error("[BookDownload] DB error:", pe.message)
  if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
  if (product.type !== "book") return NextResponse.json({ error: "Apenas livros" }, { status: 400 })
  if (!product.file_path) return NextResponse.json({ error: "PDF ainda não disponível" }, { status: 404 })

  // Verificar entitlement (admin tem acesso sempre)
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
    if (!purchase) {
      return NextResponse.json({ error: "Compra não confirmada" }, { status: 403 })
    }
  }

  // Normalizar o path — remover prefixo do bucket se existir
  // Formatos possíveis: "storage:books/path/file.pdf", "books/path/file.pdf", "path/file.pdf"
  let filePath = product.file_path
  if (filePath.startsWith("storage:books/")) filePath = filePath.slice("storage:books/".length)
  else if (filePath.startsWith("books/")) filePath = filePath.slice("books/".length)
  else if (filePath.startsWith("/")) filePath = filePath.slice(1)

  console.log(`[BookDownload] bucket=books path="${filePath}" user=${user.id}`)

  // Tentar download direto primeiro
  let fileBlob = null
  const { data: file, error: fe } = await svc.storage.from("books").download(filePath)

  if (fe || !file) {
    console.error(`[BookDownload] Download direto falhou: ${fe?.message}. A tentar URL assinada...`)
    const { data: signed, error: se } = await svc.storage.from("books").createSignedUrl(filePath, 120)
    if (se || !signed?.signedUrl) {
      console.error(`[BookDownload] URL assinada falhou: ${se?.message}`)
      return NextResponse.json({
        error: "Erro a obter ficheiro",
        detail: fe?.message,
        path: filePath
      }, { status: 500 })
    }
    const resp = await fetch(signed.signedUrl)
    if (!resp.ok) {
      return NextResponse.json({ error: "Erro a descarregar ficheiro via URL assinada" }, { status: 500 })
    }
    fileBlob = await resp.blob()
  } else {
    fileBlob = file
  }

  // Watermark
  const buf = Buffer.from(await fileBlob.arrayBuffer())
  let pdfDoc
  try {
    pdfDoc = await PDFDocument.load(buf)
  } catch (e) {
    console.error(`[BookDownload] PDF inválido: ${e.message}`)
    return NextResponse.json({ error: "PDF inválido" }, { status: 500 })
  }

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const stamp = `Licenciado a ${user.email} · ${new Date().toISOString().slice(0, 10)}`

  const pages = pdfDoc.getPages()
  for (const page of pages) {
    const { width, height } = page.getSize()
    page.drawText(stamp, {
      x: width / 2 - 240,
      y: height / 2,
      size: 40,
      font,
      color: rgb(0.85, 0.85, 0.85),
      opacity: 0.25,
      rotate: degrees(-30)
    })
    page.drawText(stamp, {
      x: 30,
      y: 18,
      size: 9,
      font,
      color: rgb(0.4, 0.4, 0.4)
    })
  }

  const out = await pdfDoc.save()
  const filename = `${product.slug}.pdf`

  // Modo inline (viewer) vs download
  const url = new URL(_req.url)
  const isDownload = url.searchParams.get("download") === "1"
  const disposition = isDownload ? "attachment" : "inline"

  return new NextResponse(out, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `${disposition}; filename="${filename}"`,
      "Cache-Control": "private, no-store",
    }
  })
}
