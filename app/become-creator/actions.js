"use server"

import { createClient, createServiceClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function submitApplication(formData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Não autenticado." }

  const bio = formData.get("bio")
  const portfolio_url = formData.get("portfolio_url")
  const payment_proof_url = formData.get("payment_proof_url") || null

  if (!bio) return { error: "A biografia é obrigatória." }

  const svc = createServiceClient()
  
  // Check if there's already a pending or approved application
  const { data: existing } = await svc.from("creator_applications")
    .select("status").eq("user_id", user.id).neq("status", "rejected").maybeSingle()
    
  if (existing) {
    return { error: "Já tens uma candidatura em análise ou aprovada." }
  }

  const { error } = await svc.from("creator_applications").insert({
    user_id: user.id,
    bio,
    portfolio_url,
    payment_proof_url
  })

  if (error) {
    console.error("[submitApplication]", error)
    return { error: "Erro ao submeter a candidatura." }
  }

  revalidatePath("/become-creator")
  redirect("/become-creator?success=1")
}
