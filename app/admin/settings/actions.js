"use server"

import { revalidatePath } from "next/cache"
import { createClient, createServiceClient } from "@/lib/supabase/server"

async function assertAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado.")
  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (!profile || profile.role !== "admin") {
    throw new Error("Sem permissões.")
  }
  return { user, profile }
}

export async function updateSettings(formData) {
  await assertAdmin()
  const svc = createServiceClient()
  
  const creator_fee_cents = Number(formData.get("creator_fee_cents") || 0)
  const creator_commission_pct = Number(formData.get("creator_commission_pct") || 70)
  const bank_details = formData.get("bank_details")?.toString() || ""
  const platform_iban = formData.get("platform_iban")?.toString() || ""
  const platform_beneficiary = formData.get("platform_beneficiary")?.toString() || ""

  const { error } = await svc.from("site_settings").update({
    creator_fee_cents,
    creator_commission_pct,
    bank_details,
    platform_iban,
    platform_beneficiary
  }).eq("id", "default")

  if (error) throw new Error(error.message)

  revalidatePath("/admin/settings")
  revalidatePath("/become-creator")
  return { ok: true }
}
