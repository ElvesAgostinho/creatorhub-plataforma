"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import crypto from "crypto"

export async function generateAffiliateLink(formData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Not logged in")

  const product_id = formData.get("product_id")

  // Generate a unique 8-character code
  const code = crypto.randomBytes(4).toString("hex")

  const { error } = await supabase
    .from("affiliate_links")
    .insert({
      affiliate_id: user.id,
      product_id,
      code
    })

  if (error) {
    console.error("Error generating link:", error)
    throw new Error("Failed to generate link")
  }

  revalidatePath("/affiliate-panel")
}
