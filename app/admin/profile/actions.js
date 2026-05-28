"use server"

import { revalidatePath } from "next/cache"
import { createClient, createServiceClient } from "@/lib/supabase/server"

export async function updateProfile(formData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado.")

  const svc = createServiceClient()
  
  const full_name = formData.get("full_name")?.toString().trim()
  const specialty = formData.get("specialty")?.toString().trim() || null
  const bio = formData.get("bio")?.toString().trim() || null
  const instagram = formData.get("instagram")?.toString().trim() || null
  const facebook = formData.get("facebook")?.toString().trim() || null
  const twitter = formData.get("twitter")?.toString().trim() || null
  const youtube = formData.get("youtube")?.toString().trim() || null
  const linkedin = formData.get("linkedin")?.toString().trim() || null
  const website = formData.get("website")?.toString().trim() || null
  const avatar_url = formData.get("avatar_url")?.toString().trim() || null

  const patch = {}
  if (full_name) patch.full_name = full_name
  patch.specialty = specialty
  patch.bio = bio
  patch.instagram = instagram
  patch.facebook = facebook
  patch.twitter = twitter
  patch.youtube = youtube
  patch.linkedin = linkedin
  patch.website = website
  if (avatar_url) patch.avatar_url = avatar_url

  const { error } = await svc.from("profiles").update(patch).eq("id", user.id)
  
  if (error) {
    throw new Error(error.message)
  }

  revalidatePath("/admin/profile")
  revalidatePath("/checkout/[slug]", "page")
  revalidatePath("/product/[slug]", "page")
  revalidatePath("/marketplace/product/[slug]", "page")
  revalidatePath("/affiliate-panel/product/[slug]", "page")
  
  return { ok: true }
}
