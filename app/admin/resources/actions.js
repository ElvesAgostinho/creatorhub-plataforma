"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function createResource(formData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const title = formData.get("title")
  const type = formData.get("type")
  const category = formData.get("category")
  const subcategory = formData.get("subcategory")
  const content = formData.get("content")
  const external_link = formData.get("external_link")
  const cover_image_url = formData.get("cover_image_url")

  // Generate simple slug
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '') + '-' + Date.now()

  const { error } = await supabase
    .from("resources")
    .insert({
      title,
      slug,
      type,
      category,
      subcategory,
      content,
      external_link,
      cover_image_url,
      published_at: new Date().toISOString()
    })

  if (error) {
    console.error("Error creating resource:", error)
    throw new Error(error.message)
  }

  revalidatePath("/admin/resources")
  revalidatePath("/blog")
  revalidatePath("/resources")
  redirect("/admin/resources")
}

export async function deleteResource(formData) {
  const supabase = createClient()
  const id = formData.get("id")
  if (!id) return

  await supabase.from("resources").delete().eq("id", id)
  revalidatePath("/admin/resources")
  revalidatePath("/blog")
  revalidatePath("/resources")
}

export async function updateResource(formData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Unauthorized")

  const id = formData.get("id")
  if (!id) throw new Error("ID em falta")

  const title = formData.get("title")
  const type = formData.get("type")
  const category = formData.get("category")
  const subcategory = formData.get("subcategory")
  const content = formData.get("content")
  const external_link = formData.get("external_link")
  const cover_image_url = formData.get("cover_image_url")

  const { error } = await supabase
    .from("resources")
    .update({
      title,
      type,
      category,
      subcategory,
      content,
      external_link,
      cover_image_url
    })
    .eq("id", id)

  if (error) {
    console.error("Error updating resource:", error)
    throw new Error(error.message)
  }

  revalidatePath("/admin/resources")
  revalidatePath("/blog")
  revalidatePath("/resources")
  redirect("/admin/resources")
}
