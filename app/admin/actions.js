"use server"

import { revalidatePath } from "next/cache"
import { createClient, createServiceClient } from "@/lib/supabase/server"

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
    .select("*, products(affiliate_commission_pct)")
    .eq("id", id)
    .maybeSingle()

  if (pe || !purchase) return { ok: false, error: pe?.message || "Purchase not found" }

  const { error } = await svc
    .from("purchases")
    .update({ status: "active", granted_at: new Date().toISOString() })
    .eq("id", id)
  if (error) return { ok: false, error: error.message }

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
