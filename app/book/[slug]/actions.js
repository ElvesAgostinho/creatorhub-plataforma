"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { jitsiRoomFor } from "@/lib/data/mentorship"

export async function bookSlot(formData) {
  const slug = formData.get("slug")
  const slotId = formData.get("slot_id")
  if (!slug || !slotId) return { ok: false, error: "Dados em falta." }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/book/${slug}`)

  const svc = createServiceClient()

  const { data: product } = await svc
    .from("products").select("id, slug, type").eq("slug", slug).maybeSingle()
  if (!product || product.type !== "mentorship") {
    return { ok: false, error: "Mentoria não encontrada." }
  }

  // tem compra ativa?
  const { data: purchase } = await svc
    .from("purchases").select("id")
    .eq("user_id", user.id).eq("product_id", product.id).eq("status", "active")
    .maybeSingle()
  if (!purchase) {
    redirect(`/checkout/${slug}`)
  }

  // slot ainda disponível?
  const { data: slot } = await svc
    .from("mentorship_slots").select("id, status, product_id")
    .eq("id", slotId).maybeSingle()
  if (!slot || slot.status !== "available" || slot.product_id !== product.id) {
    return { ok: false, error: "Slot já não está disponível." }
  }

  const { data: booking, error: be } = await svc
    .from("bookings")
    .insert({
      user_id: user.id,
      product_id: product.id,
      slot_id: slotId,
      status: "confirmed"
    })
    .select("id")
    .single()
  if (be) return { ok: false, error: be.message }

  const meetingUrl = jitsiRoomFor(booking.id)

  await svc.from("bookings").update({ meeting_url: meetingUrl }).eq("id", booking.id)
  await svc.from("mentorship_slots")
    .update({ status: "booked", meeting_url: meetingUrl })
    .eq("id", slotId)

  revalidatePath(`/book/${slug}`)
  revalidatePath(`/library`)
  redirect(`/book/${slug}/confirmado?b=${booking.id}`)
}
