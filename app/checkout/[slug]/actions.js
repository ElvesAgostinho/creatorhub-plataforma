"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

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
  if (refCode) {
    const { data: linkData } = await supabase
      .from("affiliate_links")
      .select("affiliate_id")
      .eq("code", refCode)
      .maybeSingle()
    if (linkData) affiliate_id = linkData.affiliate_id
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
