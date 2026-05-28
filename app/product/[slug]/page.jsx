import { notFound } from "next/navigation"
import { getProductBySlug, hasActivePurchase, typeLabels } from "@/lib/data/products"
import { getLessonsForProduct } from "@/lib/data/lessons"
import { createServiceClient } from "@/lib/supabase/server"
import { Star, ShieldCheck, Globe, Monitor, Users, ThumbsUp } from "lucide-react"
import ShareButton from "@/components/ShareButton"
import ReviewForm from "@/components/ReviewForm"
import ProductTabsHotmart from "@/components/ProductTabsHotmart"
import CreatorSocialLinks from "@/components/CreatorSocialLinks"

export const revalidate = 60

export default async function ProductPage({ params, searchParams }) {
  const item = await getProductBySlug(params.slug)
  if (!item) notFound()

  const owned = await hasActivePurchase(item.id)
  const fmt = n => (n ?? 0).toLocaleString("pt-PT")

  const previewUrl = item.promoVideoUrl || item.youtube_preview_url || null
  const advantagesList = item.advantages ? item.advantages.split('\n').filter(Boolean) : []

  // YouTube embed parser
  let embedUrl = null
  if (previewUrl) {
    const ytMatch = previewUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)
    if (ytMatch && ytMatch[2].length === 11) {
      embedUrl = `https://www.youtube.com/embed/${ytMatch[2]}`
    }
  }

  // Fetch modules/lessons
  const lessons = await getLessonsForProduct(item.id)

  // Build module list from lessons
  const modulesMap = {}
  if (lessons) {
    lessons.forEach(l => {
      const key = l.module?.id || "general"
      const title = l.module?.title || "Módulo Geral"
      if (!modulesMap[key]) modulesMap[key] = { title, lessons: [] }
      modulesMap[key].lessons.push(l)
    })
  }
  const moduleList = Object.values(modulesMap)

  // Get creator info and other products
  const svc = createServiceClient()
  const { data: productRow } = await svc.from("products").select("created_by").eq("id", item.id).single()
  const creatorId = productRow?.created_by

  let otherProducts = []
  let creatorProfile = null

  if (creatorId) {
    const { data: pData } = await svc
      .from("products")
      .select("id, slug, title, image_url, price_cents, type")
      .eq("created_by", creatorId)
      .eq("published", true)
      .neq("id", item.id)
      .limit(4)
    if (pData) otherProducts = pData

    const { data: profData } = await svc.from("profiles").select("*").eq("id", creatorId).single()
    if (profData) creatorProfile = profData
  }

  // Fetch Reviews
  const { data: reviewsData } = await svc
    .from("product_reviews")
    .select("*")
    .eq("product_id", item.id)
    .order("created_at", { ascending: false })

  const reviews = reviewsData || []
  const totalReviews = reviews.length
  const averageRating = totalReviews > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1)
    : "5.0"

  const positiveReviewPct = totalReviews > 0
    ? Math.round((reviews.filter(r => r.rating >= 4).length / totalReviews) * 100)
    : 100

  // Fetch reviewers profiles
  const userIds = reviews.map(r => r.user_id)
  let reviewersMap = {}
  if (userIds.length > 0) {
    const { data: reviewersProfiles } = await svc.from("profiles").select("id, full_name").in("id", userIds)
    if (reviewersProfiles) {
      reviewersProfiles.forEach(p => reviewersMap[p.id] = p.full_name)
    }
  }

  const displayReviews = reviews.map(r => ({
    ...r,
    user_name: reviewersMap[r.user_id] || "Anónimo"
  }))

  // Social links object (dynamic, from creatorProfile)
  const socialLinks = {
    website: creatorProfile?.website || null,
    instagram: creatorProfile?.instagram || null,
    facebook: creatorProfile?.facebook || null,
    twitter: creatorProfile?.twitter || null,
    youtube: creatorProfile?.youtube || null,
    linkedin: creatorProfile?.linkedin || null,
  }

  return (
    <div className="bg-white min-h-screen text-neutral-900">

      {/* ─── BREADCRUMB + TITLE AREA ─── */}
      <div className="border-b border-neutral-200 py-5 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs text-neutral-400 font-medium mb-4">
            <a href="/marketplace" className="hover:text-neutral-700 transition-colors">Home</a>
            <span>›</span>
            <span className="text-neutral-600">{item.category || typeLabels[item.type]}</span>
            {item.subcategory && (
              <>
                <span>›</span>
                <span className="text-neutral-600">{item.subcategory}</span>
              </>
            )}
            <span>›</span>
            <span className="text-neutral-900 truncate max-w-[200px]">{item.title}</span>
          </nav>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 leading-tight mb-3">
            {item.title}
          </h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-neutral-600">
            {/* Rating */}
            <div className="flex items-center gap-1.5 font-semibold">
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-neutral-900 font-bold">{averageRating}</span>
              <a href="#avaliacoes" className="text-neutral-500 underline hover:text-neutral-900 font-normal">({totalReviews})</a>
            </div>

            {/* Best seller badge */}
            {item.bestSeller && (
              <div className="flex items-center gap-1.5 font-semibold text-neutral-800">
                <ThumbsUp className="w-4 h-4" /> Bem Avaliado
              </div>
            )}

            {/* Language */}
            <div className="flex items-center gap-1.5 text-neutral-600">
              <Monitor className="w-4 h-4" />
              <span>Português</span>
            </div>

            {/* Share — pushed right */}
            <div className="ml-auto">
              <ShareButton title={item.title} text={item.description} url="" />
            </div>
          </div>
        </div>
      </div>

      {/* ─── MAIN LAYOUT ─── */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-[1fr_340px] gap-10">

        {/* ═══ LEFT COLUMN ═══ */}
        <div>

          {/* VIDEO (if exists) */}
          {previewUrl && (
            <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative border border-neutral-200 shadow-md mb-8">
              {embedUrl ? (
                <iframe
                  src={embedUrl}
                  className="absolute inset-0 w-full h-full"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <a
                  href={previewUrl.startsWith('http') ? previewUrl : `https://${previewUrl}`}
                  target="_blank"
                  className="absolute inset-0 flex items-center justify-center bg-black/40"
                >
                  <div className="w-16 h-16 bg-white/90 rounded-full flex items-center justify-center shadow-xl">
                    <svg className="w-8 h-8 text-black ml-1" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                  </div>
                </a>
              )}
              {!embedUrl && item.image && (
                <img src={item.image} alt="cover" className="w-full h-full object-cover opacity-50" />
              )}
            </div>
          )}

          {/* IMAGE + DESCRIPTION (Hotmart style: image left, text right) */}
          <div className="flex gap-6 mb-8">
            {/* Product Thumbnail */}
            {item.image && (
              <div className="w-32 h-32 sm:w-40 sm:h-40 shrink-0 rounded-xl overflow-hidden border border-neutral-200 shadow-sm bg-neutral-100">
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              </div>
            )}
            {/* Description */}
            <div className="flex-1 text-sm text-neutral-700 leading-relaxed">
              <p>{item.description}</p>
            </div>
          </div>

          {/* ─── TABS: Conteúdo | Vantagens | Detalhes ─── */}
          <ProductTabsHotmart
            moduleList={moduleList}
            advantagesList={advantagesList}
            lessons={lessons || []}
            totalStudents={item.total_students || 0}
            level={item.level}
            type={item.type}
            category={item.category}
          />

          {/* ─── ABOUT THE CREATOR ─── */}
          <div className="mt-10 pt-8 border-t border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900 mb-5">Sobre o Produtor</h2>
            <div className="flex gap-5 items-start">
              <div className="w-16 h-16 rounded-full bg-neutral-200 overflow-hidden shrink-0 flex items-center justify-center text-2xl font-bold text-neutral-500 border-2 border-neutral-100">
                {item.avatar || creatorProfile?.avatar_url ? (
                  <img src={item.avatar || creatorProfile?.avatar_url} alt={item.instructor} className="w-full h-full object-cover" />
                ) : (
                  (item.instructor || creatorProfile?.full_name)?.charAt(0) || "U"
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-neutral-900">{creatorProfile?.full_name || item.instructor}</h3>
                <p className="text-sm text-neutral-500 mt-0.5">{creatorProfile?.specialty || item.role || "Criador de Conteúdo"}</p>
                {creatorProfile?.bio && (
                  <p className="text-sm text-neutral-700 mt-3 leading-relaxed">{creatorProfile.bio}</p>
                )}
                {/* Social Links — ícones específicos por rede */}
                <CreatorSocialLinks socialLinks={socialLinks} className="mt-3" />
              </div>
            </div>
          </div>

          {/* ─── RATINGS & REVIEWS ─── */}
          <div id="avaliacoes" className="mt-10 pt-8 border-t border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900 mb-6">Avaliações</h2>

            <div className="flex gap-8 items-center mb-8">
              <div className="text-center">
                <div className="text-6xl font-black text-neutral-900">{averageRating}</div>
                <div className="flex justify-center mt-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(averageRating)) ? "text-yellow-500 fill-yellow-500" : "text-neutral-200 fill-neutral-200"}`} />
                  ))}
                </div>
                <div className="text-xs text-neutral-500 mt-1">{totalReviews} avaliações</div>
              </div>

              <div className="flex-1 space-y-2 max-w-sm">
                {[5, 4, 3, 2, 1].map(stars => {
                  const count = displayReviews.filter(r => r.rating === stars).length
                  const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0
                  return (
                    <div key={stars} className="flex items-center gap-3 text-xs">
                      <div className="flex gap-0.5 shrink-0">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < stars ? "text-yellow-400 fill-yellow-400" : "text-neutral-200 fill-neutral-200"}`} />
                        ))}
                      </div>
                      <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400 rounded-full" style={{ width: `${percent}%` }} />
                      </div>
                      <span className="text-neutral-500 w-6 text-right">{percent}%</span>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Review list */}
            <div className="space-y-5">
              {displayReviews.length === 0 ? (
                <p className="text-neutral-500 text-sm italic">Ainda não há avaliações para este produto.</p>
              ) : displayReviews.map(r => (
                <div key={r.id} className="border-t border-neutral-100 pt-5">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i < r.rating ? "text-yellow-400 fill-yellow-400" : "text-neutral-200 fill-neutral-200"}`} />
                      ))}
                    </div>
                    <span className="text-xs text-neutral-400">{new Date(r.created_at).toLocaleDateString('pt-PT')}</span>
                  </div>
                  {r.comment && <p className="text-sm text-neutral-800 mb-1">{r.comment}</p>}
                  <div className="text-xs font-bold text-neutral-400 uppercase tracking-wide">{r.user_name}</div>
                </div>
              ))}
            </div>

            {owned && <ReviewForm productId={item.id} />}
          </div>

          {/* ─── FAQ ─── */}
          <div className="mt-10 pt-8 border-t border-neutral-200">
            <h2 className="text-xl font-bold text-neutral-900 mb-5">Perguntas Frequentes</h2>
            <div className="space-y-3">
              {[
                { q: "Como recebo o acesso ao produto?", a: "Após a confirmação do pagamento, receberás automaticamente um e-mail com os teus dados de acesso e o link para a área de membros." },
                { q: "Quais as formas de pagamento?", a: "Aceitamos pagamentos por Referência Multicaixa (Express), Transferência Bancária, Cartão de Crédito e Unitel Money." },
                { q: "Tenho garantia?", a: "Sim, todos os produtos têm uma garantia de 7 dias. Se não ficares satisfeito, devolvemos 100% do teu dinheiro sem burocracias." },
              ].map((item, i) => (
                <details key={i} className="border border-neutral-200 rounded-xl overflow-hidden group">
                  <summary className="px-5 py-4 font-semibold text-sm text-neutral-800 cursor-pointer hover:bg-neutral-50 transition-colors list-none flex justify-between items-center">
                    {item.q}
                    <span className="text-neutral-400 group-open:rotate-180 transition-transform text-lg">+</span>
                  </summary>
                  <div className="px-5 pb-4 text-sm text-neutral-600 leading-relaxed">{item.a}</div>
                </details>
              ))}
            </div>
          </div>

          {/* ─── OTHER PRODUCTS ─── */}
          {otherProducts.length > 0 && (
            <div className="mt-10 pt-8 border-t border-neutral-200">
              <h2 className="text-xl font-bold text-neutral-900 mb-5">Outros produtos de {creatorProfile?.full_name || item.instructor}</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {otherProducts.map(p => (
                  <a href={`/product/${p.slug}`} key={p.id} className="group">
                    <div className="aspect-square bg-neutral-100 rounded-lg overflow-hidden border border-neutral-200 mb-2">
                      {p.image_url && <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
                    </div>
                    <p className="text-xs font-bold text-neutral-900 line-clamp-2 leading-snug group-hover:text-[#FF4500] transition-colors">{p.title}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{creatorProfile?.full_name || item.instructor}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* ═══ RIGHT SIDEBAR (Sticky) ═══ */}
        <aside>
          <div className="sticky top-6 border border-neutral-200 rounded-2xl bg-white shadow-lg overflow-hidden">

            {owned ? (
              <div className="p-6">
                <div className="flex items-center gap-2 text-green-600 font-bold mb-5 text-sm">
                  <ShieldCheck className="w-5 h-5" /> Já tens este produto
                </div>
                {item.type === "course" && (
                  <a href={`/learn/${item.slug}`} className="block w-full text-center bg-neutral-900 hover:bg-black transition-colors text-white font-bold py-4 rounded-xl text-sm">
                    Continuar Curso
                  </a>
                )}
                {item.type === "book" && (
                  <a href={`/api/books/${item.slug}/download`} target="_blank" className="block w-full text-center bg-neutral-900 hover:bg-black transition-colors text-white font-bold py-4 rounded-xl text-sm">
                    Abrir PDF
                  </a>
                )}
              </div>
            ) : (
              <div className="p-6 space-y-4">
                {/* Price */}
                <div>
                  {item.discount > 0 && (
                    <div className="text-sm text-neutral-400 line-through mb-0.5">{fmt(item.originalPrice)} Kz</div>
                  )}
                  <div className="text-3xl font-bold text-neutral-900">{fmt(item.price)} Kz</div>
                </div>

                {/* CTA Button */}
                <a
                  href={`/checkout/${item.slug}${searchParams?.ref ? `?ref=${searchParams.ref}` : ''}`}
                  className="block w-full text-center bg-[#FF4500] hover:bg-[#E03E00] transition-colors text-white font-bold py-4 rounded-xl shadow-md hover:-translate-y-0.5 transition-transform"
                >
                  Ir para o carrinho
                </a>

                {/* Trust items */}
                <div className="pt-1 space-y-3 text-sm text-neutral-700">
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500 shrink-0" />
                    <span><strong>{averageRating}</strong> ({totalReviews})</span>
                    <span className="ml-auto text-neutral-500 flex items-center gap-1 text-xs"><ThumbsUp className="w-3.5 h-3.5" /> Bem Avaliado</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#00A859] shrink-0" />
                    <span>Garantia de 7 dias</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Monitor className="w-4 h-4 text-neutral-400 shrink-0" />
                    <span>Estuda no teu ritmo e em qualquer dispositivo</span>
                  </div>

                  {(item.total_students || 0) > 0 && (
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span>+{fmt(item.total_students)} estudantes</span>
                    </div>
                  )}

                  {totalReviews > 0 && (
                    <div className="flex items-center gap-2">
                      <Star className="w-4 h-4 text-neutral-400 shrink-0" />
                      <span>{positiveReviewPct}% de avaliações positivas</span>
                    </div>
                  )}
                </div>

                <div className="border-t border-neutral-100 pt-3 space-y-1 text-xs text-neutral-500">
                  <div><strong className="text-neutral-700">Formato:</strong> {typeLabels[item.type]}</div>
                  {item.category && <div><strong className="text-neutral-700">Categoria:</strong> {item.category}</div>}
                  {item.level && <div><strong className="text-neutral-700">Nível:</strong> {item.level}</div>}
                </div>
              </div>
            )}

          </div>
        </aside>

      </div>
    </div>
  )
}
