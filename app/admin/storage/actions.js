"use server"

import { revalidatePath } from "next/cache"
import { createClient, createServiceClient } from "@/lib/supabase/server"

async function assertAuth() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado.")
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (!profile || (profile.role !== "admin" && profile.role !== "creator")) {
    throw new Error("Sem permissões.")
  }
  return { user, profile }
}

export async function joinStoragePlan(formData) {
  const { user } = await assertAuth()
  const svc = createServiceClient()

  // In a real app we would integrate with a payment gateway to subscribe.
  // Here we just mark it as pending.
  const { error } = await svc.from("creator_storage_billing").upsert({
    user_id: user.id,
    status: "pending",
    monthly_fee_cents: 2000000, // 20.000 AOA
    next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }, { onConflict: "user_id" })

  if (error) throw new Error(error.message)

  revalidatePath("/admin/storage")
  return { ok: true }
}

export async function cancelStoragePlan(formData) {
  const { user } = await assertAuth()
  const svc = createServiceClient()

  const { error } = await svc.from("creator_storage_billing").update({
    status: "cancelled"
  }).eq("user_id", user.id)

  if (error) throw new Error(error.message)

  revalidatePath("/admin/storage")
  return { ok: true }
}
