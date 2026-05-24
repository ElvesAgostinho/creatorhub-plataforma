"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function applyForAffiliate(formData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) throw new Error("Not logged in")

  const application_text = formData.get("application_text")

  const { error } = await supabase
    .from("affiliate_applications")
    .insert({
      user_id: user.id,
      application_text,
      status: "pending"
    })

  if (error) {
    console.error("Error applying for affiliate:", error)
    throw new Error("Failed to apply")
  }

  revalidatePath("/affiliates")
}
