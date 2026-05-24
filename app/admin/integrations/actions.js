"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function saveIntegration(provider, webhook_url, is_active) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Não autenticado." }

  const { error } = await supabase
    .from("creator_integrations")
    .upsert({
      creator_id: user.id,
      provider,
      webhook_url,
      is_active,
      updated_at: new Date().toISOString()
    }, { onConflict: "creator_id, provider" })

  if (error) return { ok: false, error: error.message }
  
  revalidatePath("/admin/integrations")
  return { ok: true }
}
