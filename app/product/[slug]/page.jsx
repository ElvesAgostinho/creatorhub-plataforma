import { notFound } from "next/navigation"
import { getProductBySlug, hasActivePurchase, typeLabels } from "@/lib/data/products"
import { getLessonsForProduct } from "@/lib/data/lessons"
import { createServiceClient } from "@/lib/supabase/server"
import { Star, ShieldCheck, PlayCircle, Globe, BookOpen } from "lucide-react"
import ProductTabs from "@/components/ProductTabs"

export const revalidate = 60

export default async function ProductPage({ params, searchParams }) {
  const item = await getProductBySlug(params.slug)
  if (!item) notFound()

  const owned = await hasActivePurchase(item.id)
  const fmt = n => (n ?? 0).toLocaleString("pt-PT")

  const previewUrl = item.promoVideoUrl || item.youtube_preview_url || null
  const advantagesList = item.advantages ? item.advantages.split('\n').filter(Boolean) : []

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
              <span className="font-bold text-neutral-900">{item.reviewsPositive ? (item.reviewsPositive / 20).toFixed(1) : "5.0"}</span> 
              <span>({item.reviewsCount || 0} reviews)</span>
            </div>
            {item.bestSeller && (
              <div className="flex items-center gap-1 font-bold text-neutral-900">
                <span className="text-xl">👍</span> Top Rated
              </div>
            )}
            <div className="flex items-center gap-1">
              <span>🌎</span> English / Português
            </div>
            <div className="ml-auto flex items-center gap-2 font-bold text-neutral-900 cursor-pointer hover:text-[#FF4500] transition-colors">
              <span>Share</span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3"></circle><circle cx="6" cy="12" r="3"></circle><circle cx="18" cy="19" r="3"></circle><line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line><line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line></svg>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid lg:grid-cols-[1fr_360px] gap-12">
        
        {/* LEFT COLUMN: Content */}
        <div className="space-y-12">
          
          {/* Video Section */}
          {previewUrl && (
            <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden relative border border-neutral-200 shadow-lg group mb-10">
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <a href={previewUrl} target="_blank" className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform cursor-pointer shadow-2xl">
                  <PlayCircle className="w-10 h-10 text-black ml-1" />
                </a>
              </div>
              {item.image && <img src={item.image} alt="Video cover" className="w-full h-full object-cover opacity-60" />}
            </div>
          )}

          {/* Main Content Area: Image and Tabs */}
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/3 max-w-[280px] shrink-0">
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
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Learn more about the content creator</h2>
            <div className="flex flex-col sm:flex-row gap-6 items-start sm:items-center">
              <div className="w-24 h-24 bg-neutral-200 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-3xl font-bold text-neutral-500 border-4 border-white shadow-md">
                {item.avatar || creatorProfile?.avatar_url ? (
                  <img src={item.avatar || creatorProfile?.avatar_url} alt={item.instructor} className="w-full h-full object-cover" />
                ) : (
                  item.instructor?.charAt(0) || "U"
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-neutral-900 text-xl">{item.instructor || creatorProfile?.full_name}</h3>
                <p className="text-sm text-neutral-500 font-medium mt-1">{creatorProfile?.bio || item.role || "Content Creator"}</p>
                
                {/* Social Links */}
                <div className="flex flex-wrap gap-3 mt-4">
                  <SocialIcon type="website" url={creatorProfile?.website} />
                  <SocialIcon type="instagram" url={creatorProfile?.instagram} />
                  <SocialIcon type="facebook" url={creatorProfile?.facebook} />
                  <SocialIcon type="twitter" url={creatorProfile?.twitter} />
                  <SocialIcon type="youtube" url={creatorProfile?.youtube} />
                  <SocialIcon type="linkedin" url={creatorProfile?.linkedin} />
                  {/* Fallback demo links if none exist in DB */}
                  {!creatorProfile?.website && !creatorProfile?.instagram && (
                    <>
                      <SocialIcon type="instagram" url="https://instagram.com" />
                      <SocialIcon type="youtube" url="https://youtube.com" />
                      <SocialIcon type="website" url="https://example.com" />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <hr className="border-neutral-200" />

          {/* Evaluations */}
          <div>
            <div className="flex justify-between items-end mb-8">
              <h2 className="text-2xl font-bold text-neutral-900">Evaluations</h2>
              <button className="text-sm font-bold text-neutral-600 underline">Filter ≡</button>
            </div>
            
            <div className="flex gap-10 items-center mb-10">
              <div className="text-center">
                <div className="flex items-center gap-2">
                  <span className="text-6xl font-black text-neutral-900">{item.reviewsPositive ? (item.reviewsPositive / 20).toFixed(1) : "5.0"}</span>
                  <Star className="w-8 h-8 text-yellow-500 fill-yellow-500" />
                </div>
                <div className="text-sm text-neutral-500 font-medium mt-1">{item.reviewsCount || 0} reviews</div>
              </div>
              
              <div className="flex-1 max-w-xs space-y-2">
                {[5,4,3,2,1].map(stars => (
                  <div key={stars} className="flex items-center gap-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`w-3 h-3 ${i < stars ? "text-neutral-600 fill-neutral-600" : "text-neutral-200 fill-neutral-200"}`} />
                      ))}
                    </div>
                    <div className="flex-1 h-1.5 bg-neutral-200 rounded-full overflow-hidden">
                      <div className="h-full bg-neutral-600" style={{ width: stars === 5 ? '80%' : stars === 4 ? '15%' : '0%' }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Fake Reviews for Demo */}
            <div className="space-y-6">
              <div className="border-t border-neutral-100 pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold">5</span>
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs text-neutral-400 ml-2">12/31/2025</span>
                </div>
                <p className="text-neutral-900 mb-2">Like learning more</p>
                <div className="text-xs font-bold text-neutral-400 uppercase">HUSSAIN</div>
              </div>
              <div className="border-t border-neutral-100 pt-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="font-bold">5</span>
                  <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                  <span className="text-xs text-neutral-400 ml-2">10/20/2025</span>
                </div>
                <p className="text-neutral-900 mb-2">This is a Nice Platform.</p>
                <div className="text-xs font-bold text-neutral-400 uppercase">PEDRO ALMEIDA</div>
              </div>
            </div>
          </div>

          {/* Other products from the same creator */}
          {otherProducts.length > 0 && (
            <div className="pt-8">
              <h2 className="text-2xl font-bold text-neutral-900 mb-6">Other products from the same creator</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {otherProducts.map(p => (
                  <a href={`/product/${p.slug}`} key={p.id} className="group cursor-pointer">
                    <div className="aspect-square bg-neutral-100 rounded-xl overflow-hidden border border-neutral-200 mb-3">
                      {p.image_url ? (
                         <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      ) : null}
                    </div>
                    <h4 className="font-bold text-sm text-neutral-900 leading-snug line-clamp-2">{p.title}</h4>
                    <p className="text-xs text-neutral-500 mt-1">{item.instructor || creatorProfile?.full_name}</p>
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
                  className="block w-full text-center bg-[#00A859] hover:bg-[#009650] transition-colors text-white font-bold text-lg py-4 rounded-xl shadow-sm"
                >
                  Proceed to payment
                </a>

                {/* Guarantees and extra info */}
                <div className="space-y-4 pt-2">
                  <div className="flex gap-3 text-sm text-neutral-700 font-medium items-center">
                    <Star className="w-5 h-5 text-yellow-500 fill-yellow-500 shrink-0" />
                    <span>{item.reviewsPositive ? (item.reviewsPositive / 20).toFixed(1) : "5.0"} ({item.reviewsCount || 0})</span>
                    <span className="flex items-center gap-1 ml-auto text-neutral-500"><ShieldCheck className="w-4 h-4" /> Top Rated</span>
                  </div>
                  <div className="flex gap-3 text-sm text-neutral-700 font-medium items-center">
                    <ShieldCheck className="w-5 h-5 text-neutral-900 shrink-0" />
                    7-day guarantee
                  </div>
                </div>

                <div className="text-xs text-neutral-400 text-center mt-4">
                  After you purchase the product, you'll receive access instructions via email.
                </div>
              </div>
            )}

          </div>
        </aside>

      </div>
    </div>
  )
}
