"use server"

import { revalidatePath } from "next/cache"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { sendPaymentConfirmation, sendCreatorSaleNotification } from "@/lib/email"

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

  const { data: purchase, error: pe } = await svc
    .from("purchases")
    .select("*, products(title, affiliate_commission_pct, created_by), profiles(email, full_name)")
    .eq("id", id)
    .maybeSingle()

  if (pe || !purchase) return { ok: false, error: pe?.message || "Purchase not found" }

  const { error } = await svc
    .from("purchases")
    .update({ status: "active", granted_at: new Date().toISOString() })
    .eq("id", id)
  if (error) return { ok: false, error: error.message }

  // Send Email Confirmation via Resend to Buyer
  if (purchase.profiles?.email) {
    await sendPaymentConfirmation(purchase.profiles.email, {
      title: purchase.products?.title || "Produto ABOVE"
    })
  }

  // Send Notification to Creator
  if (purchase.products?.created_by) {
    const { data: creatorProfile } = await svc
      .from("profiles")
      .select("email")
      .eq("id", purchase.products.created_by)
      .maybeSingle()
      
    if (creatorProfile?.email) {
      const amountFormatted = new Intl.NumberFormat('pt-AO', { style: 'currency', currency: 'AOA' }).format(purchase.amount_cents)
      await sendCreatorSaleNotification(
        creatorProfile.email,
        purchase.products?.title || "Produto",
        purchase.profiles?.full_name || "Cliente",
        amountFormatted
      )
    }
  }

  // Se tiver um afiliado e o produto tiver comissão, gerar o record no affiliate_earnings
  if (purchase.affiliate_id && purchase.products?.affiliate_commission_pct > 0) {
    const commissionAmount = Math.round(purchase.amount_cents * (purchase.products.affiliate_commission_pct / 100))
    await svc.from("affiliate_earnings").insert({
      affiliate_id: purchase.affiliate_id,
      purchase_id: purchase.id,
      amount_cents: commissionAmount,
      status: "pending"
    })
  }

  // Webhooks Dispatch
  if (purchase.products?.created_by) {
    const { data: integrations } = await svc
      .from("creator_integrations")
      .select("*")
      .eq("creator_id", purchase.products.created_by)
      .eq("is_active", true)

    if (integrations && integrations.length > 0) {
      const payload = {
        event: "purchase.approved",
        purchase_id: purchase.id,
        amount_cents: purchase.amount_cents,
        product: {
          id: purchase.product_id,
          title: purchase.products.title
        },
        buyer: {
          id: purchase.user_id,
          email: purchase.profiles?.email,
          name: purchase.profiles?.full_name
        },
        approved_at: new Date().toISOString()
      }

      integrations.forEach((integration) => {
        if (integration.webhook_url) {
          fetch(integration.webhook_url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload)
          }).catch((err) => console.error("Webhook failed:", integration.provider, err))
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
