"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { cookies } from "next/headers"
import { createClient } from "@/lib/supabase/server"

async function resolveAffiliateId(supabase, refCode) {
  if (!refCode) return null

  // 1. Tenta encontrar pelo código do link de afiliado (ex: hash de 8 caracteres)
  const { data: linkData } = await supabase
    .from("affiliate_links")
    .select("affiliate_id")
    .eq("code", refCode)
    .maybeSingle()
  if (linkData?.affiliate_id) return linkData.affiliate_id

  // 2. Tenta encontrar pelo prefixo do ID do perfil do afiliado (ex: c8df0b27)
  const { data: profileData } = await supabase
    .from("profiles")
    .select("id")
    .like("id", `${refCode}%`)
    .maybeSingle()
  if (profileData?.id) return profileData.id

  // 3. Verifica se é um UUID completo e válido
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (uuidRegex.test(refCode)) return refCode

  return null
}

export async function createPendingPurchase(formData) {
  const slug = formData.get("slug")
  const paymentMethod = formData.get("payment_method") || "transfer"
  const paymentRef = formData.get("payment_ref") || ""
  const refCode = formData.get("ref")

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/login?next=/checkout/${slug}`)
  }

  let affiliate_id = null
  
  // 1. Tenta ler pela tag na URL / formulário
  if (refCode) {
    affiliate_id = await resolveAffiliateId(supabase, refCode)
  }

  // 2. Procura no cookie de tracking do link direto (?ref=...)
  if (!affiliate_id) {
    const cookieStore = cookies()
    const cookieRef = cookieStore.get("ch_affiliate_ref")?.value
    if (cookieRef) {
      affiliate_id = await resolveAffiliateId(supabase, cookieRef)
    }
  }

  // 3. Procura no cookie global de tracking (setado em /ref/[code])
  if (!affiliate_id) {
    const cookieStore = cookies()
    const cookieAffiliateId = cookieStore.get("ch_affiliate_id")?.value
    if (cookieAffiliateId) {
      affiliate_id = cookieAffiliateId
    }
  }


  const { data: product, error: pe } = await supabase
    .from("products")
    .select("id, price_cents")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle()

  if (pe || !product) {
    return { ok: false, error: "Produto não encontrado." }
  }

  // Se já existe (qualquer estado), atualiza para pending novamente; senão, insere.
  const { data: existing } = await supabase
    .from("purchases")
    .select("id, status")
    .eq("user_id", user.id)
    .eq("product_id", product.id)
    .maybeSingle()

  if (existing) {
    if (existing.status === "active") {
      redirect(`/library`)
    }
    const { error: ue } = await supabase
      .from("purchases")
      .update({
        status: "pending",
        amount_cents: product.price_cents,
        payment_method: paymentMethod,
        payment_ref: paymentRef,
        affiliate_id
      })
      .eq("id", existing.id)
    if (ue) return { ok: false, error: ue.message }
  } else {
    const { error: ie } = await supabase.from("purchases").insert({
      user_id: user.id,
      product_id: product.id,
      status: "pending",
      amount_cents: product.price_cents,
      currency: "AOA",
      payment_method: paymentMethod,
      payment_ref: paymentRef,
      affiliate_id
    })
    if (ie) return { ok: false, error: ie.message }
  }

  revalidatePath("/library")
  revalidatePath("/admin")
  redirect(`/checkout/${slug}/obrigado`)
}
