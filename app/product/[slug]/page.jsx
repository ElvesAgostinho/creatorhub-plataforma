import { notFound } from "next/navigation"
import { getProductBySlug, hasActivePurchase, typeLabels } from "@/lib/data/products"
import { getLessonsForProduct } from "@/lib/data/lessons"
import { createServiceClient } from "@/lib/supabase/server"
import { Star, ShieldCheck, PlayCircle, Globe, BookOpen } from "lucide-react"
import ProductTabs from "@/components/ProductTabs"
import ShareButton from "@/components/ShareButton"
import ReviewForm from "@/components/ReviewForm"

export const revalidate = 60

export default async function ProductPage({ params, searchParams }) {
  const item = await getProductBySlug(params.slug)
  if (!item) notFound()

  const owned = await hasActivePurchase(item.id)
  const fmt = n => (n ?? 0).toLocaleString("pt-PT")

  const previewUrl = item.promoVideoUrl || item.youtube_preview_url || null
  const advantagesList = item.advantages ? item.advantages.split('\n').filter(Boolean) : []

  // YouTube embed parser
  let embedUrl = null;
  if (previewUrl) {
    const ytMatch = previewUrl.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    if (ytMatch && ytMatch[2].length === 11) {
      embedUrl = `https://www.youtube.com/embed/${ytMatch[2]}`;
    }
  }

  // Fetch modules/lessons
  const lessons = await getLessonsForProduct(item.id)
  
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

  const SocialIcon = ({ type, url }) => {
    if (!url) return null
    let iconEl = <Globe className="w-5 h-5" />
    if (type === 'instagram') iconEl = <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
    if (type === 'facebook') iconEl = <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
    if (type === 'twitter') iconEl = <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path></svg>
    if (type === 'youtube') iconEl = <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
    if (type === 'linkedin') iconEl = <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
    return (
      <a href={url.startsWith('http') ? url : `https://${url}`} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600 hover:bg-[#FF4500] hover:text-white transition-colors">
        {iconEl}
      </a>
    )
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Top Banner */}
      <div className="border-b border-neutral-200 py-8 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-2 text-sm text-neutral-500 mb-4 font-medium uppercase tracking-wider">
            <a href="/marketplace" className="hover:text-neutral-900 transition-colors">Home</a>
            <span>/</span>
            <span className="text-neutral-900">{item.category || typeLabels[item.type]}</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl font-bold text-neutral-900 uppercase tracking-tight mb-4">
            {item.title}
          </h1>

          <div className="flex items-center gap-6 text-sm text-neutral-600 flex-wrap">
            <div className="flex items-center gap-2 font-medium">
              <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
              <span className="font-bold text-neutral-900">{averageRating}</span> 
              <span>({totalReviews} avaliações)</span>
            </div>
            {item.bestSeller && (
              <div className="flex items-center gap-1 font-bold text-neutral-900">
                <span className="text-xl">👍</span> Top Rated
              </div>
            )}
            <div className="flex items-center gap-1">
              <span>🌎</span> English / Português
            </div>
            <ShareButton title={item.title} text={item.description} url="" />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid lg:grid-cols-[1fr_360px] gap-12">
        
        {/* LEFT COLUMN: Content */}
        <div className="space-y-12">
          
          {/* Video Section */}
          {previewUrl && (
            <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden relative border border-neutral-200 shadow-lg group mb-10">
              {embedUrl ? (
                <iframe 
                  src={embedUrl} 
                  className="absolute inset-0 w-full h-full" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              ) : (
                <>
                  <div className="absolute inset-0 flex items-center justify-center z-10">
                    <a href={previewUrl.startsWith('http') ? previewUrl : `https://${previewUrl}`} target="_blank" className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform cursor-pointer shadow-2xl">
                      <PlayCircle className="w-10 h-10 text-black ml-1" />
                    </a>
                  </div>
                  {item.image && <img src={item.image} alt="Video cover" className="w-full h-full object-cover opacity-60" />}
                </>
              )}
            </div>
          )}

          {/* Main Content Area: Image and Tabs */}
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/4 max-w-[200px] shrink-0">
              <div className="aspect-square bg-neutral-100 rounded-2xl overflow-hidden relative border border-neutral-200 shadow-sm">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold">Sem capa</div>
                )}
              </div>
            </div>
            <div className="w-full md:flex-1">
              <ProductTabs 
                advantagesList={advantagesList} 
                lessons={lessons} 
                description={item.description} 
              />
            </div>
          </div>

          <hr className="border-neutral-200" />

          {/* Learn more about the content creator */}
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Sobre o Produtor</h2>
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="w-24 h-24 bg-neutral-200 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-3xl font-bold text-neutral-500 border-4 border-white shadow-md">
                {item.avatar || creatorProfile?.avatar_url ? (
                  <img src={item.avatar || creatorProfile?.avatar_url} alt={item.instructor} className="w-full h-full object-cover" />
                ) : (
                  (item.instructor || creatorProfile?.full_name)?.charAt(0) || "U"
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-neutral-900 text-xl">{creatorProfile?.full_name || item.instructor}</h3>
                <p className="text-sm text-neutral-500 font-medium mt-1">{creatorProfile?.specialty || item.role || "Criador de Conteúdo"}</p>
                {creatorProfile?.bio && (
                  <p className="text-sm text-neutral-700 mt-3">{creatorProfile.bio}</p>
                )}
                
                {/* Social Links */}
                <div className="flex flex-wrap gap-3 mt-4">
                  <SocialIcon type="website" url={creatorProfile?.website} />
                  <SocialIcon type="instagram" url={creatorProfile?.instagram} />
                  <SocialIcon type="facebook" url={creatorProfile?.facebook} />
                  <SocialIcon type="twitter" url={creatorProfile?.twitter} />
                  <SocialIcon type="youtube" url={creatorProfile?.youtube} />
                  <SocialIcon type="linkedin" url={creatorProfile?.linkedin} />
                </div>
              </div>
            </div>
          </div>

          <hr className="border-neutral-200" />

          {/* Evaluations */}
          <div>
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-2xl font-bold text-neutral-900">Avaliações</h2>
              {displayReviews.length > 0 && (
                <button className="text-sm font-bold text-neutral-600 underline">Filtrar ≡</button>
              )}
            </div>
            
            <div className="flex gap-10 items-center mb-10">
              <div className="text-center">
                <div className="flex items-center gap-2">
                  <span className="text-6xl font-black text-neutral-900">{averageRating}</span>
                  <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                </div>
                <div className="text-sm text-neutral-500 font-medium mt-1">{totalReviews} {totalReviews === 1 ? 'avaliação' : 'avaliações'}</div>
              </div>
              
              <div className="flex-1 max-w-xs space-y-2">
                {[5,4,3,2,1].map(stars => {
                  const count = displayReviews.filter(r => r.rating === stars).length;
                  const percent = totalReviews > 0 ? Math.round((count / totalReviews) * 100) : 0;
                  return (
                    <div key={stars} className="flex items-center gap-3">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`w-3 h-3 ${i < stars ? "text-neutral-600 fill-neutral-600" : "text-neutral-200 fill-neutral-200"}`} />
                        ))}
                      </div>
                      <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                        <div className="h-full bg-neutral-600 transition-all" style={{ width: `${percent}%` }}></div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Real Reviews */}
            <div className="space-y-6">
              {displayReviews.length === 0 ? (
                <div className="text-neutral-500 italic">Ainda não existem avaliações para este produto.</div>
              ) : (
                displayReviews.map(r => (
                  <div key={r.id} className="border-t border-neutral-100 pt-6">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="font-bold">{r.rating}</span>
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs text-neutral-400 ml-2">{new Date(r.created_at).toLocaleDateString()}</span>
                    </div>
                    {r.comment && <p className="text-neutral-900 mb-2">{r.comment}</p>}
                    <div className="text-xs font-bold text-neutral-400 uppercase">{r.user_name}</div>
                  </div>
                ))
              )}
            </div>

            {owned && (
              <ReviewForm productId={item.id} />
            )}
          </div>

          {/* FAQ Section */}
          <div className="pt-8 mb-8 border-t border-neutral-100">
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Perguntas Frequentes</h2>
            <div className="space-y-4">
              <div className="border border-neutral-200 rounded-xl p-5 bg-[#FAFAFA]">
                <h4 className="font-bold text-neutral-900">Como recebo o acesso ao produto?</h4>
                <p className="text-sm text-neutral-600 mt-2">Após a confirmação do pagamento, receberás automaticamente um e-mail com os teus dados de acesso e o link para a área de membros.</p>
              </div>
              <div className="border border-neutral-200 rounded-xl p-5 bg-[#FAFAFA]">
                <h4 className="font-bold text-neutral-900">Quais as formas de pagamento?</h4>
                <p className="text-sm text-neutral-600 mt-2">Aceitamos pagamentos por Referência Multicaixa (Express), Transferência Bancária, Cartão de Crédito e Unitel Money.</p>
              </div>
              <div className="border border-neutral-200 rounded-xl p-5 bg-[#FAFAFA]">
                <h4 className="font-bold text-neutral-900">Tenho garantia?</h4>
                <p className="text-sm text-neutral-600 mt-2">Sim, todos os produtos têm uma garantia de 7 dias. Se não ficares satisfeito, devolvemos 100% do teu dinheiro sem burocracias.</p>
              </div>
            </div>
          </div>

          {/* Other products from the same creator */}
          {otherProducts.length > 0 && (
            <div className="pt-8 border-t border-neutral-100">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Outros produtos deste produtor</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {otherProducts.map(p => (
                  <a href={`/product/${p.slug}`} key={p.id} className="group cursor-pointer">
                    <div className="aspect-square bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200 mb-3">
                      {p.image_url ? (
                         <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : null}
                    </div>
                    <h4 className="font-bold text-sm text-neutral-900 leading-snug line-clamp-2">{p.title}</h4>
                    <p className="text-xs text-neutral-500 mt-1">{creatorProfile?.full_name || item.instructor}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Sticky Sidebar */}
        <aside>
          <div className="sticky top-24">
            
            {owned ? (
              <div className="border border-neutral-200 rounded-2xl p-6 bg-white shadow-lg">
                <div className="flex items-center gap-2 text-green-600 font-bold mb-6">
                  <ShieldCheck className="w-6 h-6" /> Já tens este produto
                </div>
                {item.type === "course" && (
                  <a href={`/learn/${item.slug}`} className="block w-full text-center bg-neutral-900 hover:bg-black transition-all text-white font-bold py-4 rounded-xl">
                    Continuar curso
                  </a>
                )}
                {item.type === "book" && (
                  <a href={`/api/books/${item.slug}/download`} target="_blank" className="block w-full text-center bg-neutral-900 hover:bg-black transition-all text-white font-bold py-4 rounded-xl">
                    Abrir PDF
                  </a>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                
                {/* Price Display */}
                <div>
                  {item.discount > 0 && (
                    <div className="line-through text-neutral-400 font-medium mb-1">{fmt(item.originalPrice)} Kz</div>
                  )}
                  <div className="text-4xl font-bold text-neutral-900 tracking-tight">
                    {fmt(item.price)} Kz
                  </div>
                </div>

                {/* Hotmart style Green Button */}
                <a 
                  href={`/checkout/${item.slug}${searchParams?.ref ? `?ref=${searchParams.ref}` : ''}`} 
                  className="block w-full text-center bg-[#00A859] hover:bg-[#009650] transition-colors text-white font-bold text-lg py-4 rounded-xl shadow-[0_4px_14px_0_rgba(0,168,89,0.39)] hover:shadow-[0_6px_20px_rgba(0,168,89,0.23)] hover:-translate-y-0.5"
                >
                  Comprar agora
                </a>

                {/* Guarantees and extra info */}
                <div className="space-y-4 pt-2">
                  <div className="flex gap-3 text-sm text-neutral-700 font-medium items-center">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 shrink-0" />
                    <span>{averageRating} ({totalReviews})</span>
                    <span className="flex items-center gap-1 ml-auto text-neutral-500"><ShieldCheck className="w-4 h-4" /> Mais Vendido</span>
                  </div>
                  <div className="flex gap-3 text-sm text-neutral-700 font-medium items-center bg-[#F4FDF8] text-[#00A859] p-3 rounded-lg border border-[#E8F8F0]">
                    <ShieldCheck className="w-5 h-5 text-[#00A859] shrink-0" />
                    Garantia de 7 dias
                  </div>
                </div>

                <div className="text-xs text-neutral-400 text-center mt-4">
                  Após a compra, receberás as instruções de acesso por e-mail.
                </div>
              </div>
            )}

          </div>
        </aside>

      </div>
    </div>
  )
}
