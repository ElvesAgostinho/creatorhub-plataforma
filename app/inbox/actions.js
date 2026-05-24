"use server"

import { createClient, createServiceClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function sendMessage(formData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado.")

  let recipient_id = formData.get("recipient_id")
  if (recipient_id === "undefined" || recipient_id === "null" || !recipient_id) {
    // If no specific recipient is provided (e.g. created_by is null), send it to the first Admin
    const { data: admin } = await supabase.from("profiles").select("id").eq("role", "admin").limit(1).maybeSingle()
    if (admin) recipient_id = admin.id
  }

  const subject = formData.get("subject") || ""
  const content = formData.get("content")
  
  let lesson_id = formData.get("lesson_id")
  if (lesson_id === "undefined" || lesson_id === "null" || !lesson_id) lesson_id = null

  let product_id = formData.get("product_id")
  if (product_id === "undefined" || product_id === "null" || !product_id) product_id = null

  if (!recipient_id || !content) {
    throw new Error("Destinatário e conteúdo são obrigatórios (Contacte o suporte se o erro persistir).")
  }

  const { error } = await supabase.from("messages").insert({
    sender_id: user.id,
    recipient_id,
    subject,
    content,
    lesson_id,
    product_id
  })

  if (error) throw new Error(error.message)
  
  revalidatePath("/inbox")
  return { ok: true }
}

export async function markAsRead(messageId) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from("messages").update({ is_read: true }).eq("id", messageId).eq("recipient_id", user.id)
  revalidatePath("/inbox")
}
