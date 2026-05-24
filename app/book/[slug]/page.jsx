import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getProductBySlug, hasActivePurchase } from "@/lib/data/products"
import { getAvailableSlots, getMyBookingForProduct } from "@/lib/data/mentorship"
import { bookSlot } from "./actions"

export const dynamic = "force-dynamic"

export default async function BookPage({ params }) {
  const item = await getProductBySlug(params.slug)
  if (!item || item.type !== "mentorship") notFound()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/book/${params.slug}`)

  const owned = await hasActivePurchase(item.id)
  if (!owned) redirect(`/checkout/${params.slug}`)

  const existing = await getMyBookingForProduct(item.id)
  const slots = await getAvailableSlots(item.id)

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
      <a href={`/product/${item.slug}`} className="text-xs text-neutral-500 hover:underline">← {item.title}</a>
      <h1 className="text-2xl font-extrabold mt-1">Agendar sessão</h1>
      <p className="text-neutral-600 mt-1 text-sm">com {item.instructor}</p>

      {existing && existing.status === "confirmed" && (
        <div className="mt-6 border border-green-200 rounded-2xl p-5 bg-green-50">
          <div className="font-bold text-green-900">Tens uma sessão confirmada</div>
          <div className="text-sm text-green-900/80 mt-1">
            {existing.mentorship_slots?.starts_at && new Date(existing.mentorship_slots.starts_at).toLocaleString("pt-PT")} · {existing.mentorship_slots?.duration_minutes} min
          </div>
          {existing.meeting_url && (
            <a href={existing.meeting_url} target="_blank" className="inline-block mt-3 bg-[#0E7C86] hover:bg-[#0a626a] text-white font-bold px-5 py-2 rounded-md text-sm">
              Entrar na sala
            </a>
          )}
        </div>
      )}

      {(!existing || existing.status !== "confirmed") && (
        <>
          <h2 className="font-bold mt-8">Slots disponíveis</h2>
          {slots.length === 0 ? (
            <p className="text-sm text-neutral-500 mt-3">Sem slots disponíveis no momento. Volta mais tarde ou contacta o mentor.</p>
          ) : (
            <div className="mt-3 grid sm:grid-cols-2 gap-3">
              {slots.map(s => (
                <form key={s.id} action={bookSlot} className="border border-neutral-200 rounded-xl p-4 bg-white flex flex-col gap-2">
                  <input type="hidden" name="slug" value={item.slug} />
                  <input type="hidden" name="slot_id" value={s.id} />
                  <div className="font-medium">{new Date(s.starts_at).toLocaleString("pt-PT", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}</div>
                  <div className="text-xs text-neutral-500">{s.duration_minutes} minutos</div>
                  <button className="mt-2 bg-[#0E7C86] hover:bg-[#0a626a] text-white font-bold px-4 py-2 rounded-md text-sm">
                    Reservar
                  </button>
                </form>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  )
}
