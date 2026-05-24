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

  const { data: product } = await svc
    .from("products")
    .select("id, slug, title, file_path, type")
    .eq("slug", params.slug)
    .maybeSingle()
  if (!product) return NextResponse.json({ error: "Produto não encontrado" }, { status: 404 })
  if (product.type !== "book") return NextResponse.json({ error: "Apenas livros" }, { status: 400 })
  if (!product.file_path) return NextResponse.json({ error: "PDF ainda não disponível" }, { status: 404 })

  // Verificar entitlement
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

  // Buscar o PDF do storage
  const { data: file, error: fe } = await svc.storage.from("books").download(product.file_path)
  if (fe || !file) {
    return NextResponse.json({ error: "Erro a obter ficheiro" }, { status: 500 })
  }

  // Watermark
  const buf = Buffer.from(await file.arrayBuffer())
  let pdfDoc
  try {
    pdfDoc = await PDFDocument.load(buf)
  } catch (e) {
    return NextResponse.json({ error: "PDF inválido" }, { status: 500 })
  }
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const stamp = `Licenciado a ${user.email} · ${new Date().toISOString().slice(0,10)}`

  const pages = pdfDoc.getPages()
  for (const page of pages) {
    const { width, height } = page.getSize()
    // diagonal
    page.drawText(stamp, {
      x: width / 2 - 240,
      y: height / 2,
      size: 40,
      font,
      color: rgb(0.85, 0.85, 0.85),
      opacity: 0.25,
      rotate: degrees(-30)
    })
    // rodapé
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

  return new NextResponse(out, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${filename}"`,
      "Cache-Control": "private, no-store"
    }
  })
}
