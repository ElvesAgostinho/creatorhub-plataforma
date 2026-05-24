import { createClient, createServiceClient } from "@/lib/supabase/server"

export async function getAvailableSlots(productId) {
  const supabase = createClient()
  const nowIso = new Date().toISOString()
  const { data, error } = await supabase
    .from("mentorship_slots")
    .select("id, starts_at, duration_minutes, status")
    .eq("product_id", productId)
    .eq("status", "available")
    .gte("starts_at", nowIso)
    .order("starts_at", { ascending: true })
  if (error) {
    console.error("[getAvailableSlots]", error.message)
    return []
  }
  return data || []
}

export async function getMyBookingForProduct(productId) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null
  const { data } = await supabase
    .from("bookings")
    .select("id, status, meeting_url, slot_id, mentorship_slots(starts_at, duration_minutes)")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()
  return data
}

export function jitsiRoomFor(bookingId) {
  return `https://meet.jit.si/CreatorHub-${bookingId.replace(/-/g, "").slice(0, 16)}`
}

export async function getMyBookings() {
  const svc = createServiceClient()
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data } = await svc
    .from("bookings")
    .select("id, status, meeting_url, created_at, product_id, slot_id, products(slug, title, instructor_name), mentorship_slots(starts_at, duration_minutes)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
  return data || []
}
