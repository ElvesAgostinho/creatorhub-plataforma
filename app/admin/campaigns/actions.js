"use server"

import { createServiceClient } from "@/lib/supabase/server"
import { sendMarketingBroadcast } from "@/lib/email"
import { revalidatePath } from "next/cache"

export async function addHeroHighlight(formData) {
  const productId = formData.get("product_id")
  const weight = parseInt(formData.get("weight") || "1", 10)
  const limitStr = formData.get("limit")
  const limit = limitStr ? parseInt(limitStr, 10) : null
  
  if (!productId) return { error: "Produto inválido" }

  const svc = createServiceClient()
  const { error } = await svc
    .from("hero_highlights")
    .upsert({
      product_id: productId,
      priority_weight: weight,
      impressions_limit: limit,
      is_active: true
    }, { onConflict: "product_id" })

  if (error) {
    console.error("Erro addHeroHighlight:", error)
    return { error: error.message }
  }

  revalidatePath("/marketplace")
  revalidatePath("/admin/campaigns")
  return { success: true }
}

export async function toggleHeroHighlight(id, isActive) {
  const svc = createServiceClient()
  const { error } = await svc
    .from("hero_highlights")
    .update({ is_active: isActive })
    .eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/marketplace")
  revalidatePath("/admin/campaigns")
  return { success: true }
}

export async function removeHeroHighlight(id) {
  const svc = createServiceClient()
  const { error } = await svc
    .from("hero_highlights")
    .delete()
    .eq("id", id)

  if (error) return { error: error.message }
  revalidatePath("/marketplace")
  revalidatePath("/admin/campaigns")
  return { success: true }
}

export async function sendEmailCampaign(formData) {
  const title = formData.get("title")
  const subject = formData.get("subject")
  const htmlBody = formData.get("html_body")

  if (!title || !subject || !htmlBody) return { error: "Preenche todos os campos." }

  const svc = createServiceClient()
  
  // 1. Save campaign record
  const { data: campaign, error: insertErr } = await svc
    .from("marketing_campaigns")
    .insert({
      title, subject, html_body, status: 'sending'
    })
    .select()
    .single()
    
  if (insertErr) return { error: insertErr.message }

  // 2. Fetch all user emails
  // Since "profiles" doesn't necessarily have the email, we fetch from auth.users using an RPC or we assume profiles has email.
  // Actually, standard Supabase: auth.users has email. 
  // Let's fetch using the Supabase admin API for users.
  const { data: usersData, error: usersErr } = await svc.auth.admin.listUsers()
  
  if (usersErr) {
    await svc.from("marketing_campaigns").update({ status: 'failed' }).eq("id", campaign.id)
    return { error: "Falha ao obter lista de utilizadores." }
  }

  const emails = usersData.users.map(u => u.email).filter(Boolean)

  if (emails.length === 0) {
    await svc.from("marketing_campaigns").update({ status: 'failed' }).eq("id", campaign.id)
    return { error: "Não há utilizadores com e-mail registado." }
  }

  // 3. Send via Resend
  const result = await sendMarketingBroadcast(emails, subject, htmlBody)
  
  if (!result.success) {
    await svc.from("marketing_campaigns").update({ status: 'failed' }).eq("id", campaign.id)
    return { error: "Falha ao enviar via Resend: " + result.error.message }
  }

  // 4. Update campaign status
  await svc.from("marketing_campaigns").update({ 
    status: 'sent', 
    sent_count: emails.length 
  }).eq("id", campaign.id)

  revalidatePath("/admin/campaigns")
  return { success: true, count: emails.length }
}
