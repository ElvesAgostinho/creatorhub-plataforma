"use server"

import { revalidatePath } from "next/cache"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { sendPaymentConfirmation, sendCreatorSaleNotification, sendAdminSaleAlert } from "@/lib/email"

async function requireAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Não autenticado." }
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()
  if (!profile || profile.role !== "admin") {
    return { ok: false, error: "Sem permissões." }
  }
  return { ok: true, user, profile }
}

export async function approvePurchase(formData) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth

  const id = formData.get("id")
  if (!id) return { ok: false, error: "ID em falta." }

  const svc = createServiceClient()

  // Buscar compra com produto e criador
  const { data: purchase, error: pe } = await svc
    .from("purchases")
    .select("*, products(title, affiliate_commission_pct, created_by)")
    .eq("id", id)
    .maybeSingle()

  if (pe || !purchase) return { ok: false, error: pe?.message || "Compra não encontrada" }

  // Buscar perfil do comprador
  const { data: buyerProfile } = await svc
    .from("profiles")
    .select("email, full_name")
    .eq("id", purchase.user_id)
    .maybeSingle()

  purchase.profiles = buyerProfile

  // Aprovar a compra
  const { error } = await svc
    .from("purchases")
    .update({ status: "active", granted_at: new Date().toISOString() })
    .eq("id", id)
  if (error) return { ok: false, error: error.message }

  const amountFormatted = new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(
    (purchase.amount_cents || 0) / 100
  )

  // ── EMAIL 1: Comprador ──────────────────────────────────────────────────────
  const buyerEmail = buyerProfile?.email
  if (buyerEmail) {
    const r1 = await sendPaymentConfirmation(buyerEmail, {
      title: purchase.products?.title || "Produto ABOVE"
    })
    if (!r1.success) console.error("[approvePurchase] Falha email comprador:", r1.error)
    else console.log("[approvePurchase] Email comprador enviado:", buyerEmail)
  } else {
    console.warn("[approvePurchase] Email do comprador não encontrado para purchase:", id)
  }

  // ── EMAIL 2: Criador ────────────────────────────────────────────────────────
  if (purchase.products?.created_by) {
    const { data: creatorProfile } = await svc
      .from("profiles")
      .select("email")
      .eq("id", purchase.products.created_by)
      .maybeSingle()

    if (creatorProfile?.email) {
      const r2 = await sendCreatorSaleNotification(
        creatorProfile.email,
        purchase.products?.title || "Produto",
        buyerProfile?.full_name || "Cliente",
        amountFormatted
      )
      if (!r2.success) console.error("[approvePurchase] Falha email criador:", r2.error)
      else console.log("[approvePurchase] Email criador enviado:", creatorProfile.email)
    }
  }

  // ── EMAIL 3: Superadmin ─────────────────────────────────────────────────────
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail) {
    const r3 = await sendAdminSaleAlert(adminEmail, {
      productTitle: purchase.products?.title || "Produto ABOVE",
      buyerName: buyerProfile?.full_name,
      buyerEmail: buyerProfile?.email,
      amountStr: amountFormatted,
      purchaseId: purchase.id
    })
    if (!r3.success) console.error("[approvePurchase] Falha email admin:", r3.error)
    else console.log("[approvePurchase] Email admin enviado:", adminEmail)
  } else {
    console.warn("[approvePurchase] ADMIN_EMAIL não configurado em .env.local")
  }

  // ── Comissão de Afiliado ────────────────────────────────────────────────────
  if (purchase.affiliate_id && purchase.products?.affiliate_commission_pct > 0) {
    const commissionAmount = Math.round(
      (purchase.amount_cents * purchase.products.affiliate_commission_pct) / 100
    )
    await svc.from("affiliate_earnings").insert({
      affiliate_id: purchase.affiliate_id,
      purchase_id: purchase.id,
      amount_cents: commissionAmount,
      status: "pending"
    })
  }

  // ── Webhooks ────────────────────────────────────────────────────────────────
  if (purchase.products?.created_by) {
    const { data: integrations } = await svc
      .from("creator_integrations")
      .select("*")
      .eq("creator_id", purchase.products.created_by)
      .eq("is_active", true)

    if (integrations?.length > 0) {
      const payload = {
        event: "purchase.approved",
        purchase_id: purchase.id,
        amount_cents: purchase.amount_cents,
        product: { id: purchase.product_id, title: purchase.products.title },
        buyer: {
          id: purchase.user_id,
          email: buyerProfile?.email,
          name: buyerProfile?.full_name
        },
        approved_at: new Date().toISOString()
      }

      integrations.forEach((integration) => {
        if (integration.webhook_url) {
          fetch(integration.webhook_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }).catch((err) => console.error("[Webhook] Falhou:", integration.provider, err))
        }
      })
    }
  }

  revalidatePath("/admin")
  revalidatePath("/library")
  return { ok: true }
}

export async function rejectPurchase(formData) {
  const auth = await requireAdmin()
  if (!auth.ok) return auth

  const id = formData.get("id")
  if (!id) return { ok: false, error: "ID em falta." }

  const svc = createServiceClient()
  const { error } = await svc
    .from("purchases")
    .update({ status: "cancelled" })
    .eq("id", id)
  if (error) return { ok: false, error: error.message }

  revalidatePath("/admin")
  return { ok: true }
}
