import { notFound, redirect } from "next/navigation"
import { headers } from "next/headers"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { getProductBySlug, typeLabels } from "@/lib/data/products"
import { getLessonsForProduct } from "@/lib/data/lessons"
import {
  CheckCircle2, Star, Shield, Monitor, Users, TrendingUp,
  PlayCircle, ChevronDown, Award,
  Flame, ThumbsUp, Zap, ArrowRight, BadgeCheck, BarChart3,
  Package, Clock, Tag, ChevronLeft, ExternalLink
} from "lucide-react"
import MarketplaceAffiliateActions from "@/components/MarketplaceAffiliateActions"
import CreatorSocialLinks from "@/components/CreatorSocialLinks"

export const dynamic = "force-dynamic"

export default async function MarketplaceProductPage({ params }) {
  const item = await getProductBySlug(params.slug)
  if (!item) notFound()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Check affiliate status
  let affiliateStatus = null // null | 'pending' | 'approved' | 'rejected'
  let affiliateId = null
  if (user) {
    const { data: app } = await supabase
      .from("affiliate_applications")
      .select("status")
      .eq("user_id", user.id)
      .maybeSingle()
    affiliateStatus = app?.status || null
    affiliateId = user.id.split('-')[0]
  }

  const svc = createServiceClient()

  // Fetch extra product fields
  const { data: productRow } = await svc
    .from("products")
    .select("created_by, affiliate_commission_pct, affiliate_training_video, affiliate_materials_link")
    .eq("id", item.id)
    .single()

  const creatorId = productRow?.created_by
  const commissionPct = productRow?.affiliate_commission_pct || item.affiliate_commission_pct || 20
  const commValue = Math.round((item.price * commissionPct) / 100)

  // Creator profile
  let creatorProfile = null
  let creatorProductsCount = 0
  if (creatorId) {
    const { data: profData } = await svc.from("profiles").select("*").eq("id", creatorId).single()
    if (profData) creatorProfile = profData
    const { count } = await svc
      .from("products")
      .select("id", { count: "exact", head: true })
      .eq("created_by", creatorId)
      .eq("published", true)
    creatorProductsCount = count || 0
  }

  // Lessons & modules
  let lessons = []
  try { lessons = await getLessonsForProduct(item.id) || [] } catch (e) {}

  const modulesMap = {}
  lessons.forEach(l => {
    const key = l.module?.id || "general"
    const title = l.module?.title || "Módulo Geral"
    if (!modulesMap[key]) modulesMap[key] = { title, lessons: [] }
    modulesMap[key].lessons.push(l)
  })
  const moduleList = Object.values(modulesMap)

  // Reviews
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

  // Affiliate link preview dynamically resolved using request headers
  const headersList = headers()
  const host = headersList.get("host") || "bizlink.topconsultores.pt"
  const protocol = host.includes("localhost") || host.includes("127.0.0.1") ? "http" : "https"
  const domain = `${protocol}://${host}`
  const affiliateLink = affiliateStatus === 'approved' && affiliateId
    ? `${domain}/product/${item.slug}?ref=${affiliateId}`
    : null

  const isAffiliate = affiliateStatus === 'approved'
  const isPending = affiliateStatus === 'pending'

  return (
    <div className="bg-[#F7F7F7] min-h-screen">

      {/* ── TOP BAR ── */}
      <div className="bg-white border-b border-neutral-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
          <a href="/marketplace" className="flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-neutral-900 transition-colors">
            <ChevronLeft size={16} />
            Voltar ao Marketplace
          </a>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-2 text-sm font-bold text-[#00A859] bg-green-50 border border-green-200 px-3 py-1.5 rounded-full">
              <Zap size={14} className="fill-[#00A859]" />
              Comissão: {commissionPct}% · {fmt(commValue)} Kz/venda
            </div>
            <a href={`/product/${item.slug}`} target="_blank" className="text-sm font-semibold text-[#FF4500] hover:underline flex items-center gap-1">
              Ver página pública <ExternalLink size={13} />
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* ── HERO PRODUCT HEADER ── */}
        <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden mb-6">
          {/* Dark header */}
          <div className="bg-neutral-900 px-6 py-6">
            <div className="flex flex-col sm:flex-row gap-5 items-start sm:items-center">
              {/* Thumbnail */}
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
                  {isAffiliate && (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-[#00A859] text-white px-2 py-1 rounded flex items-center gap-1">
                      <BadgeCheck size={10} /> Já és afiliado
                    </span>
                  )}
                  {isPending && (
                    <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500 text-white px-2 py-1 rounded">
                      Candidatura pendente
                    </span>
                  )}
                </div>
                <h1 className="text-xl sm:text-2xl font-black text-white leading-tight">{item.title}</h1>
                <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-white/60">
                  <span>Produtor: <strong className="text-white">{creatorProfile?.full_name || item.instructor}</strong></span>
                  <div className="flex items-center gap-1">
                    <Star size={13} className="fill-yellow-400 text-yellow-400" />
                    <span className="text-white font-semibold">{avgRating}</span>
                    <span>({totalReviews} avaliações)</span>
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
              { icon: <Flame size={16} className="text-orange-500" />, label: "Aulas", value: lessons.length > 0 ? `${lessons.length}` : "—" },
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

          {/* LEFT COLUMN */}
          <div className="space-y-6">

            {/* Sobre o produto */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
                <Package size={16} className="text-neutral-500" />
                <h2 className="font-bold text-neutral-900">Sobre o Produto</h2>
              </div>
              <div className="p-6">
                <div className="flex gap-5 mb-5">
                  {item.image && (
                    <div className="w-28 h-28 shrink-0 rounded-xl overflow-hidden border border-neutral-200">
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                  <p className="text-sm text-neutral-700 leading-relaxed">{item.description}</p>
                </div>
                <div className="flex flex-wrap gap-2 text-xs">
                  {item.level && <span className="bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full font-semibold capitalize">{item.level}</span>}
                  {item.category && <span className="bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full font-semibold">{item.category}</span>}
                  <span className="bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full font-semibold">{typeLabels[item.type]}</span>
                  <span className="bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full font-semibold">Português</span>
                  {lessons.length > 0 && <span className="bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full font-semibold">{lessons.length} aulas</span>}
                </div>
              </div>
            </div>

            {/* O que o comprador recebe */}
            {advantagesList.length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
                  <CheckCircle2 size={16} className="text-[#00A859]" />
                  <h2 className="font-bold text-neutral-900">O que o comprador vai receber</h2>
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

            {/* Conteúdo do curso */}
            {item.type === 'course' && moduleList.length > 0 && (
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <PlayCircle size={16} className="text-[#FF4500]" />
                    <h2 className="font-bold text-neutral-900">Conteúdo do Curso</h2>
                  </div>
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

            {/* Sobre o criador */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
                <Users size={16} className="text-neutral-500" />
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
                  <div className="flex items-center gap-2 mt-2 text-xs text-neutral-500">
                    <BarChart3 size={12} />
                    <span>{creatorProductsCount} produto{creatorProductsCount !== 1 ? 's' : ''} publicado{creatorProductsCount !== 1 ? 's' : ''}</span>
                  </div>
                  {creatorProfile?.bio && (
                    <p className="text-sm text-neutral-600 mt-3 leading-relaxed">{creatorProfile.bio}</p>
                  )}
                <CreatorSocialLinks
                  socialLinks={{
                    website: creatorProfile?.website,
                    instagram: creatorProfile?.instagram,
                    youtube: creatorProfile?.youtube,
                    linkedin: creatorProfile?.linkedin,
                    twitter: creatorProfile?.twitter,
                    facebook: creatorProfile?.facebook,
                  }}
                  className="mt-3"
                />
                </div>
              </div>
            </div>

            {/* Tracking info */}
            <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-neutral-100 flex items-center gap-2">
                <Shield size={16} className="text-neutral-500" />
                <h2 className="font-bold text-neutral-900">Como funciona o rastreio</h2>
              </div>
              <div className="p-6 grid sm:grid-cols-3 gap-4">
                <div className="flex flex-col items-center text-center p-4 bg-neutral-50 rounded-xl gap-2">
                  <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center">
                    <Shield size={18} className="text-green-500" />
                  </div>
                  <p className="text-sm font-bold text-neutral-800">Cookie seguro</p>
                  <p className="text-xs text-neutral-500 leading-relaxed">As tuas vendas são rastreadas automaticamente via cookie de sessão</p>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-neutral-50 rounded-xl gap-2">
                  <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center">
                    <Clock size={18} className="text-blue-500" />
                  </div>
                  <p className="text-sm font-bold text-neutral-800">30 dias de cookie</p>
                  <p className="text-xs text-neutral-500 leading-relaxed">Se o utilizador comprar nos próximos 30 dias, ganhas a comissão</p>
                </div>
                <div className="flex flex-col items-center text-center p-4 bg-neutral-50 rounded-xl gap-2">
                  <div className="w-10 h-10 rounded-full bg-white border border-neutral-200 flex items-center justify-center">
                    <Tag size={18} className="text-purple-500" />
                  </div>
                  <p className="text-sm font-bold text-neutral-800">Parâmetro ?ref=</p>
                  <p className="text-xs text-neutral-500 leading-relaxed">O teu ID único é incluído no link para identificar as tuas conversões</p>
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: CTA Panel */}
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
                    <div className="font-black text-neutral-900 text-base">{lessons.length || "—"}</div>
                    <div className="text-[10px] text-neutral-400 uppercase font-bold mt-0.5">Aulas</div>
                  </div>
                </div>

                {/* CTA Actions — Client Component */}
                <MarketplaceAffiliateActions
                  isLoggedIn={!!user}
                  affiliateStatus={affiliateStatus}
                  affiliateLink={affiliateLink}
                  productSlug={item.slug}
                  productTitle={item.title}
                />
              </div>

              {/* How it works */}
              <div className="bg-white rounded-2xl border border-neutral-200 shadow-sm p-5">
                <h3 className="text-sm font-bold text-neutral-900 mb-4">Como começar a promover</h3>
                <div className="space-y-3">
                  {[
                    { step: "1", title: "Regista-te como afiliado", desc: "Cria a tua conta e candidata-te ao programa" },
                    { step: "2", title: "Aguarda aprovação", desc: "A nossa equipa analisa a tua candidatura" },
                    { step: "3", title: "Copia o teu link", desc: "Acede ao painel e obtém o teu link exclusivo" },
                    { step: "4", title: "Promove e ganha", desc: `${commissionPct}% de comissão por cada venda gerada` },
                  ].map((s, i) => (
                    <div key={i} className="flex gap-3 items-start">
                      <div className="w-6 h-6 rounded-full bg-[#FF4500] text-white text-xs font-black flex items-center justify-center shrink-0 mt-0.5">{s.step}</div>
                      <div>
                        <p className="text-xs font-bold text-neutral-800">{s.title}</p>
                        <p className="text-xs text-neutral-500 mt-0.5">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Trust signals */}
              <div className="bg-neutral-50 rounded-2xl border border-neutral-100 p-4 space-y-2.5 text-xs text-neutral-600">
                <div className="flex items-center gap-2"><Shield size={13} className="text-green-500" /> Rastreio automático por cookie</div>
                <div className="flex items-center gap-2"><Monitor size={13} className="text-blue-500" /> Funciona em todos os dispositivos</div>
                <div className="flex items-center gap-2"><Users size={13} className="text-purple-500" /> Cookie válido por 30 dias</div>
                <div className="flex items-center gap-2"><BadgeCheck size={13} className="text-[#FF4500]" /> Comissões pagas mensalmente</div>
              </div>

            </div>
          </aside>

        </div>
      </div>
    </div>
  )
}
