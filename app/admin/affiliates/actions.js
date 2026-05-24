"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function approveAffiliate(formData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const id = formData.get("id")

  // Verify Admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user?.id).maybeSingle()
  if (profile?.role !== "admin") throw new Error("Unauthorized")

  await supabase
    .from("affiliate_applications")
    .update({ status: "approved" })
    .eq("id", id)

  revalidatePath("/admin/affiliates")
}

export async function rejectAffiliate(formData) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const id = formData.get("id")

  // Verify Admin
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user?.id).maybeSingle()
  if (profile?.role !== "admin") throw new Error("Unauthorized")

  await supabase
    .from("affiliate_applications")
    .update({ status: "rejected" })
    .eq("id", id)

  revalidatePath("/admin/affiliates")
}
