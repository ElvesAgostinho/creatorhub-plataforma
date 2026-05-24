import { notFound, redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { getProductBySlug } from "@/lib/data/products"

export const dynamic = "force-dynamic"

export default async function ConfirmedPage({ params, searchParams }) {
  const item = await getProductBySlug(params.slug)
  if (!item) notFound()
  const bookingId = searchParams?.b
  if (!bookingId) redirect(`/book/${params.slug}`)

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login`)

  const svc = createServiceClient()
  const { data: booking } = await svc
    .from("bookings")
    .select("id, status, meeting_url, user_id, mentorship_slots(starts_at, duration_minutes)")
    .eq("id", bookingId)
    .maybeSingle()

  if (!booking || booking.user_id !== user.id) notFound()

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-16 text-center">
      <div className="text-5xl">📅</div>
      <h1 className="text-3xl font-extrabold mt-4">Sessão confirmada</h1>
      <p className="text-neutral-600 mt-3">
        {booking.mentorship_slots?.starts_at && new Date(booking.mentorship_slots.starts_at).toLocaleString("pt-PT")}
        <br/>
        Duração: {booking.mentorship_slots?.duration_minutes} min
      </p>

      <div className="mt-8 border border-neutral-200 rounded-2xl p-6 bg-neutral-50 text-left text-sm">
        <p className="font-bold">Link da sala</p>
        <a href={booking.meeting_url} target="_blank" className="text-[#0E7C86] hover:underline break-all">{booking.meeting_url}</a>
        <p className="text-xs text-neutral-500 mt-3">
          Sala Jitsi (grátis, sem instalação). Vai estar disponível à hora marcada.
        </p>
      </div>

      <div className="mt-8 flex gap-3 justify-center">
        <a href="/library" className="bg-[#0E7C86] hover:bg-[#0a626a] text-white font-bold px-5 py-2.5 rounded-md">
          Ver biblioteca
        </a>
      </div>
    </div>
  )
}
