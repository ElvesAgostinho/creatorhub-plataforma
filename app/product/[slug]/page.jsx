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
        <div className="sticky top-24 border border-neutral-100 rounded-[2rem] p-8 bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] flex flex-col gap-6 relative overflow-hidden">
          {/* Subtle top accent line */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#FF4500] to-orange-400"></div>

          {owned ? (
            <>
              <div className="inline-flex items-center gap-1.5 bg-green-50 text-green-700 font-bold text-xs uppercase tracking-widest px-3 py-1.5 rounded-full w-fit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                Já é teu
              </div>
              {item.type === "course" && (
                <a href={`/learn/${item.slug}`} className="block w-full text-center bg-neutral-900 hover:bg-black transition-all hover:-translate-y-0.5 text-white font-extrabold py-4 rounded-xl shadow-lg">
                  Continuar curso
                </a>
              )}
              {item.type === "book" && (
                <a href={`/api/books/${item.slug}/download`} target="_blank" className="block w-full text-center bg-neutral-900 hover:bg-black transition-all hover:-translate-y-0.5 text-white font-extrabold py-4 rounded-xl shadow-lg">
                  Abrir PDF
                </a>
              )}
              {item.type === "mentorship" && (
                <a href={`/book/${item.slug}`} className="block w-full text-center bg-neutral-900 hover:bg-black transition-all hover:-translate-y-0.5 text-white font-extrabold py-4 rounded-xl shadow-lg">
                  Agendar sessão
                </a>
              )}
              {item.type === "event" && (
                <div className="pt-2">
                  <div className="text-sm font-bold text-neutral-800">O teu link de acesso:</div>
                  {item.event_meeting_url ? (
                    <a href={item.event_meeting_url} target="_blank" className="block mt-3 w-full text-center bg-[#FF4500] hover:bg-[#e63e00] transition-all hover:-translate-y-0.5 text-white font-extrabold py-4 rounded-xl shadow-[0_8px_20px_rgba(255,69,0,0.3)]">
                      Entrar na Sala (Ao vivo)
                    </a>
                  ) : (
                    <div className="text-sm text-neutral-500 mt-2 p-4 bg-neutral-50 rounded-xl text-center border border-neutral-100 font-medium">Link ainda não disponibilizado pelo criador.</div>
                  )}
                  {item.event_starts_at && (
                    <div className="text-xs text-neutral-500 mt-4 text-center bg-neutral-50 p-3 rounded-lg">
                      Data do evento: <br/><span className="font-bold text-neutral-800 text-sm">{new Date(item.event_starts_at).toLocaleString("pt-PT", { dateStyle: 'full', timeStyle: 'short' })}</span>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <>
              <div className="space-y-1">
                {item.discount > 0 ? (
                  <div className="flex items-center gap-2 mb-2">
                    <span className="bg-red-100 text-red-700 font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-sm">-{item.discount}% DESCONTO</span>
                    <span className="line-through text-neutral-400 text-sm font-medium">{fmt(item.originalPrice)} Kz</span>
                  </div>
                ) : (
                  <div className="text-[11px] font-bold uppercase tracking-widest text-neutral-400">Preço Oficial</div>
                )}
                
                <div className="flex items-start gap-1">
                  <span className="text-5xl font-black tracking-tighter text-neutral-900 leading-none">{fmt(item.price)}</span>
                  <span className="text-xl font-bold text-neutral-500 mt-1">Kz</span>
                </div>
              </div>

              <a href={`/checkout/${item.slug}${searchParams?.ref ? `?ref=${searchParams.ref}` : ''}`} className="relative block w-full text-center bg-gradient-to-r from-[#FF4500] to-[#FF6B33] hover:from-[#e63e00] hover:to-[#ff5c1f] transition-all duration-300 hover:-translate-y-1 text-white font-black text-lg py-4 rounded-xl shadow-[0_10px_25px_rgba(255,69,0,0.35)] overflow-hidden group">
                <div className="absolute inset-0 w-full h-full bg-white/20 -translate-x-full group-hover:translate-x-[200%] transition-transform duration-1000 skew-x-12"></div>
                Comprar agora
              </a>

              <div className="flex items-center justify-center gap-2 text-xs font-semibold text-neutral-500 pt-2">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
                Pagamento 100% Seguro
              </div>
            </>
          )}

          <div className="border-t border-neutral-100 pt-6 mt-2">
            <h4 className="text-sm font-bold text-neutral-900 mb-4">Este produto inclui:</h4>
            <ul className="space-y-3">
              {[
                "Acesso vitalício ao conteúdo",
                "Comunidade ativa de alunos",
                "Online e ao teu próprio ritmo",
                item.type === "course" && "Certificado de conclusão"
              ].filter(Boolean).map((benefit, i) => (
                <li key={i} className="flex items-start gap-3 text-sm font-medium text-neutral-600">
                  <div className="mt-0.5 bg-[#FF4500]/10 rounded-full p-0.5">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FF4500" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                  </div>
                  {benefit}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>
    </div>
  )
}
