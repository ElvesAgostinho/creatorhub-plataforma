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
  const audience = formData.get("audience") || "todos"

  if (!title || !subject || !htmlBody) return { error: "Preenche todos os campos." }

  const svc = createServiceClient()
  
  // 1. Save campaign record
  const { data: campaign, error: insertErr } = await svc
    .from("marketing_campaigns")
    .insert({
      title: `${title} [Alvo: ${audience}]`, subject, html_body: htmlBody, status: 'sending'
    })
    .select()
    .single()
    
  if (insertErr) return { error: insertErr.message }

  // 2. Fetch all user emails
  const { data: usersData, error: usersErr } = await svc.auth.admin.listUsers()
  
  if (usersErr) {
    await svc.from("marketing_campaigns").update({ status: 'failed' }).eq("id", campaign.id)
    return { error: "Falha ao obter lista de utilizadores." }
  }

  let usersToEmail = usersData.users || []

  // 3. Filter Audience
  if (audience !== "todos") {
    // Para filtrar, precisamos de cruzar com dados de purchases e profiles
    const { data: purchases } = await svc.from("purchases").select("user_id")
    const { data: profiles } = await svc.from("profiles").select("id, role")

    const buyerIds = new Set((purchases || []).map(p => p.user_id))
    const creatorIds = new Set((profiles || []).filter(p => p.role === "creator").map(p => p.id))

    usersToEmail = usersToEmail.filter(u => {
      if (audience === "compradores") return buyerIds.has(u.id)
      if (audience === "sem_compras") return !buyerIds.has(u.id)
      if (audience === "criadores") return creatorIds.has(u.id)
      return true
    })
  }

  const emails = usersToEmail.map(u => u.email).filter(Boolean)

  if (emails.length === 0) {
    await svc.from("marketing_campaigns").update({ status: 'failed' }).eq("id", campaign.id)
    return { error: `Não foram encontrados utilizadores para a audiência '${audience}'.` }
  }

  // 4. Send via Resend
  const result = await sendMarketingBroadcast(emails, subject, htmlBody)
  
  if (!result.success) {
    await svc.from("marketing_campaigns").update({ status: 'failed' }).eq("id", campaign.id)
    return { error: "Falha ao enviar via Resend: " + result.error.message }
  }

  // 5. Update campaign status
  await svc.from("marketing_campaigns").update({ 
    status: 'sent', 
    sent_count: emails.length 
  }).eq("id", campaign.id)

  revalidatePath("/admin/campaigns")
  return { success: true, count: emails.length }
}
