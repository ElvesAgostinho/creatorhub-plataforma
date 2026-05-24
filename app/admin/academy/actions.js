"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveAcademySettings(formData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const name = formData.get("name")
  const primary_color = formData.get("primary_color")
  const logo_url = formData.get("logo_url")
  const hero_image_url = formData.get("hero_image_url")
  const hero_video_url = formData.get("hero_video_url")
  
  // New fields
  const description = formData.get("description")
  const price_monthly = parseFloat(formData.get("price_monthly")) || 0
  const price_monthly_cents = Math.round(price_monthly * 100)
  const published = formData.get("published") === "on"
  
  const theme_mode = formData.get("theme_mode")
  const layout_style = formData.get("layout_style")

  // Upsert the academy settings for this creator
  const { error } = await supabase
    .from("creator_academies")
    .upsert({
      creator_id: user.id,
      name,
      primary_color,
      theme_mode,
      layout_style,
      logo_url,
      hero_image_url,
      hero_video_url,
      description,
      price_monthly_cents,
      published,
      updated_at: new Date().toISOString()
    }, { onConflict: "creator_id" })

  if (error) {
    console.error("Error saving academy settings:", error)
    throw new Error(error.message)
  }

  revalidatePath("/admin/academy")
  revalidatePath("/academy")
}
