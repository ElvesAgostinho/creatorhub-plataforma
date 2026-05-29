"use server"

import { revalidatePath } from "next/cache"
import { createClient, createServiceClient } from "@/lib/supabase/server"

export async function updateStudentProfile(formData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado.")

  const svc = createServiceClient()
  
  const full_name = formData.get("full_name")?.toString().trim()
  const phone = formData.get("phone")?.toString().trim() || null
  const avatar_url = formData.get("avatar_url")?.toString().trim() || null

  const patch = {}
  if (full_name) patch.full_name = full_name
  if (avatar_url) patch.avatar_url = avatar_url

  const { error } = await svc.from("profiles").update(patch).eq("id", user.id)
  
  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/library/profile")
  revalidatePath("/library", "layout")
  
  return { ok: true }
}
