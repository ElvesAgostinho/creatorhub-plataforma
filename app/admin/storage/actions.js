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

async function assertAdmin() {
  const { user, profile } = await assertAuth()
  if (profile.role !== "admin") throw new Error("Apenas o superadmin pode executar esta ação.")
  return { user, profile }
}

// ─── Creator Actions ──────────────────────────────────────────────────────────

export async function joinStoragePlan(formData) {
  const { user } = await assertAuth()
  const svc = createServiceClient()

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

// ─── Admin: Activate / Deactivate / Block Individual Creator ──────────────────

export async function adminActivateStorage(formData) {
  await assertAdmin()
  const svc = createServiceClient()
  const userId = formData.get("user_id")

  const { error } = await svc.from("creator_storage_billing").upsert({
    user_id: userId,
    status: "active",
    storage_blocked: false,
    monthly_fee_cents: 2000000,
    next_billing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
  }, { onConflict: "user_id" })

  if (error) throw new Error(error.message)
  revalidatePath("/admin/storage")
  return { ok: true }
}

export async function adminDeactivateStorage(formData) {
  await assertAdmin()
  const svc = createServiceClient()
  const userId = formData.get("user_id")

  const { error } = await svc.from("creator_storage_billing").upsert({
    user_id: userId,
    status: "past_due",
    monthly_fee_cents: 2000000
  }, { onConflict: "user_id" })

  if (error) throw new Error(error.message)
  revalidatePath("/admin/storage")
  return { ok: true }
}

export async function adminBlockUserStorage(formData) {
  await assertAdmin()
  const svc = createServiceClient()
  const userId = formData.get("user_id")

  const { error } = await svc.from("creator_storage_billing").upsert({
    user_id: userId,
    storage_blocked: true,
    monthly_fee_cents: 2000000
  }, { onConflict: "user_id" })

  if (error) throw new Error(error.message)
  revalidatePath("/admin/storage")
  return { ok: true }
}

export async function adminUnblockUserStorage(formData) {
  await assertAdmin()
  const svc = createServiceClient()
  const userId = formData.get("user_id")

  const { error } = await svc.from("creator_storage_billing").upsert({
    user_id: userId,
    storage_blocked: false,
    monthly_fee_cents: 2000000
  }, { onConflict: "user_id" })

  if (error) throw new Error(error.message)
  revalidatePath("/admin/storage")
  return { ok: true }
}

// ─── Admin: Global Upload Toggles ────────────────────────────────────────────

export async function adminToggleVideoUpload(formData) {
  await assertAdmin()
  const svc = createServiceClient()
  const enabled = formData.get("enabled") === "true"

  const { error } = await svc.from("platform_settings").upsert({
    key: "upload_video_enabled",
    value: String(enabled),
    updated_at: new Date().toISOString(),
  }, { onConflict: "key" })

  if (error) throw new Error(error.message)
  revalidatePath("/admin/storage")
  revalidatePath("/api/platform-settings")
  return { ok: true }
}

export async function adminTogglePhotoUpload(formData) {
  await assertAdmin()
  const svc = createServiceClient()
  const enabled = formData.get("enabled") === "true"

  const { error } = await svc.from("platform_settings").upsert({
    key: "upload_photo_enabled",
    value: String(enabled),
    updated_at: new Date().toISOString(),
  }, { onConflict: "key" })

  if (error) throw new Error(error.message)
  revalidatePath("/admin/storage")
  revalidatePath("/api/platform-settings")
  return { ok: true }
}
