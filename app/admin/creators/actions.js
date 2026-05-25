"use server"

import { createClient, createServiceClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

async function assertAdmin() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("Não autenticado")
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (profile?.role !== "admin") throw new Error("Acesso negado")
  return user
}

export async function approveCreator(formData) {
  await assertAdmin()
  const id = formData.get("id")
  const user_id = formData.get("user_id")

  const svc = createServiceClient()
  
  // 1. Mark application as approved
  await svc.from("creator_applications").update({ status: "approved" }).eq("id", id)
  
  // 2. Change user role to creator
  // Important: We only update to 'creator' if they are 'student'. 
  // If they are 'admin', we shouldn't downgrade them.
  const { data: profile } = await svc.from("profiles").select("role, email").eq("id", user_id).maybeSingle()
  if (profile && profile.role === "student") {
    await svc.from("profiles").update({ role: "creator" }).eq("id", user_id)
  }

  // Fetch email if not in profile
  let userEmail = profile?.email;
  if (!userEmail) {
    const { data: authUser } = await svc.auth.admin.getUserById(user_id)
    userEmail = authUser?.user?.email
  }

  if (userEmail) {
    const { sendRoleApprovalNotification } = require("@/lib/email")
    await sendRoleApprovalNotification(userEmail, "Criador ABOVE")
  }

  revalidatePath("/admin/creators")
}

export async function rejectCreator(formData) {
  await assertAdmin()
  const id = formData.get("id")

  const svc = createServiceClient()
  await svc.from("creator_applications").update({ status: "rejected" }).eq("id", id)

  revalidatePath("/admin/creators")
}
