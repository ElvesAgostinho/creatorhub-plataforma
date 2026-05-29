import { NextResponse } from "next/server"
import { createServiceClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET(req) {
  const url = new URL(req.url)
  const dest = url.searchParams.get("url")
  const ref = url.searchParams.get("ref")
  const productId = url.searchParams.get("product_id")

  if (!dest) {
    return NextResponse.json({ error: "URL de destino em falta" }, { status: 400 })
  }

  // Validar URL destino (segurança)
  let destUrl
  try {
    destUrl = new URL(dest)
    if (!["http:", "https:"].includes(destUrl.protocol)) {
      throw new Error("Protocolo inválido")
    }
  } catch {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 })
  }

  const svc = createServiceClient()

  // Resolver affiliate_id a partir do código ref
  let affiliateId = null
  if (ref) {
    // 1. Tentar pelo código de link
    const { data: linkData } = await svc
      .from("affiliate_links")
      .select("affiliate_id")
      .eq("code", ref)
      .maybeSingle()
    if (linkData?.affiliate_id) affiliateId = linkData.affiliate_id

    // 2. Tentar pelo cookie existente
    if (!affiliateId) {
      const cookieStore = cookies()
      affiliateId = cookieStore.get("ch_affiliate_id")?.value || null
    }

    // 3. UUID completo
    if (!affiliateId) {
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      if (uuidRegex.test(ref)) affiliateId = ref
    }
  } else {
    // Ler do cookie se não houver ref na URL
    const cookieStore = cookies()
    affiliateId = cookieStore.get("ch_affiliate_id")?.value || null
  }

  // Registar clique (best-effort, não bloqueia o redirect)
  if (affiliateId) {
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown"
    const userAgent = req.headers.get("user-agent") || ""

    svc.from("affiliate_clicks").insert({
      affiliate_id: affiliateId,
      product_id: productId || null,
      url: dest,
      ip: ip.split(",")[0].trim(),
      user_agent: userAgent.slice(0, 500)
    }).then(({ error }) => {
      if (error) console.error("[track-click] Erro ao registar clique:", error.message)
    })
  }

  // Construir resposta de redirect
  const response = NextResponse.redirect(dest, { status: 302 })

  // Renovar cookie de afiliado (30 dias) se tivermos um affiliateId
  if (affiliateId) {
    response.cookies.set("ch_affiliate_id", affiliateId, {
      path: "/",
      maxAge: 30 * 24 * 60 * 60, // 30 dias
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production"
    })
  }

  return response
}
