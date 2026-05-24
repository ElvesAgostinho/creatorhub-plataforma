import { notFound } from "next/navigation"
import { getProductBySlug, hasActivePurchase, typeLabels } from "@/lib/data/products"
import { getLessonsForProduct } from "@/lib/data/lessons"
import CoursePreview from "@/components/CoursePreview"

export const revalidate = 60

export default async function ProductPage({ params, searchParams }) {
  const item = await getProductBySlug(params.slug)
  if (!item) notFound()

  const owned = await hasActivePurchase(item.id)
  const fmt = n => (n ?? 0).toLocaleString("pt-PT")

  const previewUrl = item.youtube_preview_url || null

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-3 gap-10">
      <div className="lg:col-span-2 space-y-6">
        <CoursePreview image={item.image} title={item.title} previewUrl={previewUrl} />

        <div className="flex gap-2">
          {item.bestSeller && (
            <span className="bg-yellow-300 text-black text-xs font-extrabold px-2 py-1 rounded">BEST SELLER</span>
          )}
          <span className="bg-neutral-100 text-neutral-800 text-xs font-bold px-2 py-1 rounded">
            {typeLabels[item.type]?.toUpperCase()}
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl font-extrabold">{item.title}</h1>
        <p className="text-neutral-600">
          Um {typeLabels[item.type]?.toLowerCase()} por <span className="font-semibold text-neutral-900">{item.instructor}</span>{item.role ? ` · ${item.role}` : ""}
        </p>

        <div className="flex items-center gap-5 text-sm text-neutral-700">
          <span>👍 {item.reviewsPositive}% positivos ({item.reviewsCount})</span>
          <span>👤 {fmt(item.students)} alunos</span>
        </div>

        <div className="prose max-w-none text-neutral-700">
          <p>{item.description}</p>
          <p>
            Conteúdo completo com lições práticas, recursos para download e acompanhamento da comunidade.
            Ideal para quem quer aprofundar conhecimentos no tema.
          </p>
        </div>
      </div>

      <aside className="lg:col-span-1">
        <div className="sticky top-24 border border-neutral-200 rounded-2xl p-6 bg-white shadow-sm space-y-4">
          {owned ? (
            <>
              <div className="text-xs uppercase tracking-wider text-green-700 font-bold">Já é teu</div>
              {item.type === "course" && (
                <a href={`/learn/${item.slug}`} className="block w-full text-center bg-[#0E7C86] hover:bg-[#0a626a] transition text-white font-bold py-3 rounded-md">
                  Continuar curso
                </a>
              )}
              {item.type === "book" && (
                <a href={`/api/books/${item.slug}/download`} target="_blank" className="block w-full text-center bg-[#0E7C86] hover:bg-[#0a626a] transition text-white font-bold py-3 rounded-md">
                  Abrir PDF
                </a>
              )}
              {item.type === "mentorship" && (
                <a href={`/book/${item.slug}`} className="block w-full text-center bg-[#0E7C86] hover:bg-[#0a626a] transition text-white font-bold py-3 rounded-md">
                  Agendar sessão
                </a>
              )}
              {item.type === "event" && (
                <div className="pt-2">
                  <div className="text-sm font-bold text-neutral-800">O teu link de acesso:</div>
                  {item.event_meeting_url ? (
                    <a href={item.event_meeting_url} target="_blank" className="block mt-2 w-full text-center bg-[#0E7C86] hover:bg-[#0a626a] transition text-white font-bold py-3 rounded-md">
                      Entrar na Sala (Ao vivo)
                    </a>
                  ) : (
                    <div className="text-sm text-neutral-500 mt-2 p-3 bg-neutral-100 rounded text-center">Link ainda não disponibilizado.</div>
                  )}
                  {item.event_starts_at && (
                    <div className="text-xs text-neutral-500 mt-3 text-center">
                      Data do evento: <br/><span className="font-bold">{new Date(item.event_starts_at).toLocaleString("pt-PT", { dateStyle: 'full', timeStyle: 'short' })}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="text-xs uppercase tracking-wider text-neutral-500">Preço promocional</div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold">{fmt(item.price)} Kz</span>
              </div>
              {item.discount > 0 && (
                <div className="text-sm">
                  <span className="text-red-600 font-bold">{item.discount}% desc.</span>
                  <span className="line-through text-neutral-500 ml-2">{fmt(item.originalPrice)} Kz</span>
                </div>
              )}

              <a href={`/checkout/${item.slug}${searchParams?.ref ? `?ref=${searchParams.ref}` : ''}`} className="block w-full text-center bg-[#0E7C86] hover:bg-[#0a626a] transition text-white font-bold py-3 rounded-md">
                Comprar agora
              </a>
            </>
          )}

          <ul className="text-sm text-neutral-600 space-y-2 pt-2">
            <li>✓ Acesso vitalício</li>
            <li>✓ Comunidade ativa</li>
            <li>✓ Online e ao teu ritmo</li>
          </ul>
        </div>
      </aside>
    </div>
  )
}
