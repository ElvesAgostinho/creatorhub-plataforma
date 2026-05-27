import { notFound, redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { getProductBySlug, typeLabels } from "@/lib/data/products"
import { getLessonsForProduct } from "@/lib/data/lessons"
import { 
  CheckCircle2, Star, Shield, Monitor, Users, TrendingUp, 
  PlayCircle, FolderDown, ChevronDown, Award, Globe,
  Flame, ThumbsUp, Zap
} from "lucide-react"
import AffiliateLinksPanel from "@/components/AffiliateLinksPanel"

export const dynamic = "force-dynamic"

export default async function AffiliateProductDetails({ params }) {
  const item = await getProductBySlug(params.slug)
  if (!item) notFound()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/affiliate-panel/product/${params.slug}`)

  const { data: application } = await supabase
    .from("affiliate_applications")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!application || application.status !== "approved") {
    redirect("/affiliates")
  }

  const affiliateId = user.id.split('-')[0]
  const commissionPct = item.affiliate_commission_pct || 20
  const commValue = Math.round((item.price * commissionPct) / 100)

  const svc = createServiceClient()
  const { data: productRow } = await svc
    .from("products")
    .select("created_by, affiliate_training_video, affiliate_materials_link, affiliate_extra_links")
    .eq("id", item.id)
    .single()

  const creatorId = productRow?.created_by
  const affiliateTrainingVideo = productRow?.affiliate_training_video
  const affiliateMaterialsLink = productRow?.affiliate_materials_link
  const affiliateExtraLinks = productRow?.affiliate_extra_links || []

  // Creator profile
  let creatorProfile = null
  let otherProducts = []
  if (creatorId) {
    const { data: profData } = await svc.from("profiles").select("*").eq("id", creatorId).single()
    if (profData) creatorProfile = profData

    const { data: pData } = await svc
      .from("products")
      .select("id, slug, title, image_url, price_cents, type, affiliate_commission_pct")
      .eq("created_by", creatorId)
      .eq("published", true)
      .neq("id", item.id)
      .limit(4)
    if (pData) otherProducts = pData
  }

  // Lessons & modules
  let lessons = []
  try { lessons = await getLessonsForProduct(item.id) || [] } catch(e) {}
  
  const modulesMap = {}
  lessons.forEach(l => {
    const key = l.module?.id || "general"
    const title = l.module?.title || "Módulo Geral"
    if (!modulesMap[key]) modulesMap[key] = { title, lessons: [] }
    modulesMap[key].lessons.push(l)
  })
  const moduleList = Object.values(modulesMap)

  // Reviews summary
  const { data: reviewsData } = await svc
    .from("product_reviews")
    .select("rating")
    .eq("product_id", item.id)
  const reviews = reviewsData || []
  const totalReviews = reviews.length
  const avgRating = totalReviews > 0
    ? (reviews.reduce((a, r) => a + r.rating, 0) / totalReviews).toFixed(1)
    : "5.0"
  const positiveReviewPct = totalReviews > 0
    ? Math.round(reviews.filter(r => r.rating >= 4).length / totalReviews * 100)
    : 100

  const advantagesList = item.advantages ? item.advantages.split('\n').filter(Boolean) : []
  const fmt = n => (n ?? 0).toLocaleString("pt-PT")

  // YouTube embed
  let embedVideoUrl = null
  if (affiliateTrainingVideo) {
    const m = affiliateTrainingVideo.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/)
    if (m && m[2].length === 11) embedVideoUrl = `https://www.youtube.com/embed/${m[2]}`
  }

  // Build affiliate links array
  const baseLink = `https://above.ao/product/${item.slug}?ref=${affiliateId}`
  const allLinks = [
    { label: "Página do Produto", url: baseLink },
    ...(item.external_sales_url ? [{
      label: "Página de Vendas Externa",
      url: `${item.external_sales_url}${item.external_sales_url.includes('?') ? '&' : '?'}ref=${affiliateId}`
    }] : []),
    ...(affiliateExtraLinks || []).map(l => ({
      label: l.label,
      url: `${l.url}${l.url.includes('?') ? '&' : '?'}ref=${affiliateId}`
    }))
  ]

  return (
    <div className="bg-[#F7F7F7] min-h-screen">
      {/* ── TOP BAR ── */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <a href="/affiliate-panel" className="flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors">
            ← Voltar ao painel
          </a>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm font-bold text-[#00A859] bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              <Zap size={14} className="fill-[#00A859]" />
              Comissão: {commissionPct}% · {fmt(commValue)} Kz/venda
            </div>
            <a href={`/product/${item.slug}`} target="_blank" className="text-sm font-semibold text-[#FF4500] hover:underline">
              Ver página pública ↗
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* ── HERO PRODUCT HEADER (Hotmart style) ── */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden mb-6">
          <div className="bg-neutral-900 px-6 py-5">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              {/* Product thumbnail */}
              <div className="w-24 h-24 rounded-xl overflow-hidden border-2 border-white/20 shrink-0 bg-neutral-700">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/30 font-bold text-2xl">?</div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className="text-[10px] font-black uppercase tracking-wider bg-[#FF4500] text-white px-2 py-1 rounded">
                    {typeLabels[item.type]}
                  </span>
                  {item.category && (
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-white/10 text-white/70 px-2 py-1 rounded">
                      {item.category}
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">{item.title}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-white/60">
                  <span>Produtor: <strong className="text-white">{creatorProfile?.full_name || item.instructor}</strong></span>
                  <div className="flex items-center gap-1">
                    <Star size={13} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-semibold">{avgRating}</span>
                    <span>({totalReviews})</span>
                  </div>
                  {item.level && <span className="capitalize">{item.level}</span>}
                </div>
              </div>
            </div>
          </div>

          {/* Stats bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-neutral-100 border-t border-neutral-200">
            {[
              { icon: <TrendingUp size={16} className="text-[#FF4500]" />, label: "Comissão", value: `${commissionPct}%` },
              { icon: <Award size={16} className="text-yellow-500" />, label: "Avaliação", value: `${avgRating} ⭐` },
              { icon: <ThumbsUp size={16} className="text-green-500" />, label: "Positivas", value: `${positiveReviewPct}%` },
              { icon: <Flame size={16} className="text-orange-500" />, label: "Links disponíveis", value: `${allLinks.length}` },
            ].map((stat, i) => (
              <div key={i} className="flex flex-col items-center justify-center py-4 px-3 text-center gap-1">
                {stat.icon}
                <div className="font-black text-lg text-neutral-900">{stat.value}</div>
                <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-semibold">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ── MAIN 2-COL LAYOUT ── */}
        <div className="grid lg:grid-cols-[1fr_380px] gap-6">

          {/* LEFT */}
          <div className="space-y-6">

            {/* Vídeo de treino do criador */}
            {affiliateTrainingVideo && (
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
                  <PlayCircle size={18} className="text-[#FF4500]" />
                  <h2 className="font-bold text-neutral-900">Palavra do Produtor</h2>
                  <span className="ml-auto text-xs text-neutral-400">Como vender este produto</span>
                </div>
                <div className="p-4">
                  <div className="w-full aspect-video bg-black rounded-xl overflow-hidden relative">
                    {embedVideoUrl ? (
                      <iframe
                        src={embedVideoUrl}
                        className="absolute inset-0 w-full h-full"
                        frameBorder="0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      />
                    ) : (
                      <a href={affiliateTrainingVideo} target="_blank" className="absolute inset-0 flex items-center justify-center">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-xl">
                          <PlayCircle size={32} className="text-[#FF4500] ml-1" />
                        </div>
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-neutral-500 mt-3 leading-relaxed">
                    O criador preparou este vídeo especificamente para os seus afiliados. Aprende as melhores estratégias e argumentos de venda para maximizares as tuas conversões.
                  </p>
                </div>
              </div>
            )}

            {/* Material de divulgação */}
            {affiliateMaterialsLink && (
              <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-2xl border border-orange-200 p-5 flex flex-col sm:flex-row items-center gap-4 justify-between">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#FF4500] flex items-center justify-center shrink-0">
                    <FolderDown size={20} className="text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-neutral-900">Material Promocional</h3>
                    <p className="text-sm text-neutral-600 mt-0.5">Banners, copys, vídeos e criativos prontos para usar nas tuas campanhas.</p>
                  </div>
                </div>
                <a
                  href={affiliateMaterialsLink}
                  target="_blank"
                  className="shrink-0 bg-[#FF4500] hover:bg-[#E03E00] text-white font-bold px-6 py-3 rounded-xl transition-all shadow-md hover:-translate-y-0.5 text-sm whitespace-nowrap"
                >
                  Aceder ao Material
                </a>
              </div>
            )}

            {/* Sobre o produto */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-100">
                <h2 className="font-bold text-neutral-900">Sobre o Produto</h2>
              </div>
              <div className="p-6">
                {/* Image + Description */}
                <div className="flex gap-5 mb-6">
                  {item.image && (
                    <div className="w-28 h-28 shrink-0 rounded-xl overflow-hidden border border-neutral-200">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <p className="text-sm text-neutral-700 leading-relaxed">{item.description}</p>
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 text-xs">
                  {item.level && <span className="bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full font-semibold capitalize">{item.level}</span>}
                  {item.category && <span className="bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full font-semibold">{item.category}</span>}
                  <span className="bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full font-semibold">{typeLabels[item.type]}</span>
                  <span className="bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full font-semibold">Português</span>
                  {lessons.length > 0 && <span className="bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full font-semibold">{lessons.length} aulas</span>}
                </div>
              </div>
            </div>

            {/* Conteúdo do curso (módulos) */}
            {item.type === 'course' && moduleList.length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                  <h2 className="font-bold text-neutral-900">Conteúdo do Curso</h2>
                  <span className="text-xs text-neutral-400">{moduleList.length} módulos · {lessons.length} aulas</span>
                </div>
                <div className="divide-y divide-neutral-100">
                  {moduleList.map((mod, idx) => (
                    <details key={idx} className="group">
                      <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-neutral-50 transition-colors list-none">
                        <div className="flex items-center gap-3">
                          <span className="w-7 h-7 rounded-lg bg-neutral-100 text-neutral-600 flex items-center justify-center text-xs font-bold shrink-0">{idx + 1}</span>
                          <span className="text-sm font-semibold text-neutral-800">{mod.title}</span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-neutral-400">
                          <span>{mod.lessons.length} aulas</span>
                          <ChevronDown size={14} className="group-open:rotate-180 transition-transform" />
                        </div>
                      </summary>
                      <div className="bg-neutral-50 divide-y divide-neutral-100">
                        {mod.lessons.map((l, li) => (
                          <div key={li} className="flex items-center gap-3 px-6 py-3">
                            <PlayCircle size={14} className="text-neutral-300 shrink-0" />
                            <span className="text-sm text-neutral-600 flex-1">{l.title}</span>
                            {l.is_preview && (
                              <span className="text-[10px] bg-green-100 text-green-700 font-bold px-2 py-0.5 rounded-full">Grátis</span>
                            )}
                            {l.duration_seconds > 0 && (
                              <span className="text-xs text-neutral-400">{Math.floor(l.duration_seconds / 60)}min</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </details>
                  ))}
                </div>
              </div>
            )}

            {/* Vantagens */}
            {advantagesList.length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-100">
                  <h2 className="font-bold text-neutral-900">O que o cliente vai receber</h2>
                </div>
                <div className="p-6 grid sm:grid-cols-2 gap-3">
                  {advantagesList.map((adv, i) => (
                    <div key={i} className="flex items-start gap-2.5">
                      <CheckCircle2 size={16} className="text-[#00A859] shrink-0 mt-0.5" />
                      <span className="text-sm text-neutral-700 leading-relaxed">{adv}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Sobre o criador */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-100">
                <h2 className="font-bold text-neutral-900">Sobre o Produtor</h2>
              </div>
              <div className="p-6 flex gap-5 items-start">
                <div className="w-16 h-16 rounded-full bg-neutral-200 overflow-hidden shrink-0 flex items-center justify-center text-xl font-bold text-neutral-500">
                  {item.avatar || creatorProfile?.avatar_url ? (
                    <img src={item.avatar || creatorProfile?.avatar_url} alt={item.instructor} className="w-full h-full object-cover" />
                  ) : (
                    (item.instructor || "?").charAt(0)
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-neutral-900">{creatorProfile?.full_name || item.instructor}</h3>
                  <p className="text-sm text-neutral-500 mt-0.5">{creatorProfile?.specialty || item.role || "Criador de Conteúdo"}</p>
                  {creatorProfile?.bio && (
                    <p className="text-sm text-neutral-600 mt-3 leading-relaxed">{creatorProfile.bio}</p>
                  )}
                  <div className="flex gap-2 mt-3 flex-wrap">
                    {[creatorProfile?.website, creatorProfile?.instagram, creatorProfile?.youtube, creatorProfile?.linkedin].filter(Boolean).map((url, i) => (
                      <a key={i} href={url.startsWith('http') ? url : `https://${url}`} target="_blank"
                        className="w-8 h-8 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500 hover:bg-[#FF4500] hover:text-white transition-colors">
                        <Globe size={14} />
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Outros produtos do criador */}
            {otherProducts.length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-100">
                  <h2 className="font-bold text-neutral-900">Outros produtos de {creatorProfile?.full_name || item.instructor}</h2>
                </div>
                <div className="p-4 grid sm:grid-cols-2 gap-3">
                  {otherProducts.map(p => (
                    <a key={p.id} href={`/affiliate-panel/product/${p.slug}`}
                      className="flex items-center gap-3 p-3 rounded-xl border border-neutral-100 hover:border-[#FF4500]/30 hover:bg-neutral-50 transition-all group">
                      <div className="w-14 h-14 rounded-lg overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                        {p.image_url && <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-neutral-800 line-clamp-2 leading-snug group-hover:text-[#FF4500] transition-colors">{p.title}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-neutral-500 font-medium">{fmt(Math.round(p.price_cents / 100))} Kz</span>
                          <span className="text-[10px] bg-green-50 text-green-700 font-bold px-1.5 py-0.5 rounded">{p.affiliate_commission_pct || 20}% com.</span>
                        </div>
                      </div>
                    </a>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT: Sticky links panel */}
          <aside>
            <div className="sticky top-20 space-y-4">

              {/* Commission card */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-br from-neutral-900 to-neutral-800 p-5 text-center">
                  <p className="text-xs text-neutral-400 uppercase tracking-wider font-bold mb-1">Ganhas por venda</p>
                  <div className="text-4xl font-black text-white">{fmt(commValue)} <span className="text-xl text-neutral-400">Kz</span></div>
                  <div className="mt-2 inline-flex items-center gap-1.5 bg-white/10 text-white/80 text-xs font-semibold px-3 py-1 rounded-full">
                    <TrendingUp size={12} />
                    {commissionPct}% sobre {fmt(item.price)} Kz
                  </div>
                </div>

                <div className="p-4 grid grid-cols-3 divide-x divide-neutral-100 border-b border-neutral-100 text-center">
                  <div className="px-2">
                    <div className="font-black text-neutral-900 text-base">{avgRating}</div>
                    <div className="text-[10px] text-neutral-400 uppercase font-bold mt-0.5">Avaliação</div>
                  </div>
                  <div className="px-2">
                    <div className="font-black text-neutral-900 text-base">{positiveReviewPct}%</div>
                    <div className="text-[10px] text-neutral-400 uppercase font-bold mt-0.5">Positivas</div>
                  </div>
                  <div className="px-2">
                    <div className="font-black text-neutral-900 text-base">{allLinks.length}</div>
                    <div className="text-[10px] text-neutral-400 uppercase font-bold mt-0.5">Links</div>
                  </div>
                </div>

                <div className="p-4 space-y-3 text-xs text-neutral-600">
                  <div className="flex items-center gap-2"><Shield size={13} className="text-green-500" /> Rastreio automático por cookie</div>
                  <div className="flex items-center gap-2"><Monitor size={13} className="text-blue-500" /> Funciona em todos os dispositivos</div>
                  <div className="flex items-center gap-2"><Users size={13} className="text-purple-500" /> Cookie de 30 dias</div>
                </div>
              </div>

              {/* Links panel */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-neutral-100">
                  <h3 className="font-bold text-neutral-900 text-sm">Os teus links de afiliado</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">{allLinks.length} {allLinks.length === 1 ? 'link disponível' : 'links disponíveis'}</p>
                </div>
                <div className="p-5">
                  <AffiliateLinksPanel links={allLinks} commission={commissionPct} affiliateId={affiliateId} />
                </div>
              </div>

            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}
