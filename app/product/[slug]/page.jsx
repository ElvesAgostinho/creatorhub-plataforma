import { notFound } from "next/navigation"
import { getProductBySlug, hasActivePurchase, typeLabels } from "@/lib/data/products"
import { createServiceClient } from "@/lib/supabase/server"
import { Star, ShieldCheck, PlayCircle, Users } from "lucide-react"

export const revalidate = 60

export default async function ProductPage({ params, searchParams }) {
  const item = await getProductBySlug(params.slug)
  if (!item) notFound()

  const owned = await hasActivePurchase(item.id)
  const fmt = n => (n ?? 0).toLocaleString("pt-PT")

  const previewUrl = item.promoVideoUrl || item.youtube_preview_url || null
  const advantagesList = item.advantages ? item.advantages.split('\n').filter(Boolean) : []

  // Get other products from the same creator
  const svc = createServiceClient()
  const { data: productRow } = await svc.from("products").select("created_by").eq("id", item.id).single()
  const creatorId = productRow?.created_by

  let otherProducts = []
  if (creatorId) {
    const { data } = await svc
      .from("products")
      .select("id, slug, title, image_url, price_cents, type")
      .eq("created_by", creatorId)
      .eq("published", true)
      .neq("id", item.id)
      .limit(4)
    if (data) otherProducts = data
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Top Banner (Breadcrumbs & Title) */}
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

          <div className="flex items-center gap-6 text-sm text-neutral-600">
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
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 grid lg:grid-cols-[1fr_360px] gap-12">
        
        {/* LEFT COLUMN: Hotmart Sequence */}
        <div className="space-y-12">
          
          {/* Main Content Area (Image + Description or Video) */}
          <div className="flex flex-col md:flex-row gap-8">
            <div className="w-full md:w-1/2 shrink-0">
              <div className="aspect-square bg-neutral-100 rounded-2xl overflow-hidden relative border border-neutral-200">
                {item.image ? (
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold">Sem capa</div>
                )}
              </div>
            </div>
            <div className="w-full md:w-1/2">
              <h3 className="text-xl font-bold text-neutral-900 mb-4">Details</h3>
              <p className="text-neutral-600 leading-relaxed text-[15px]">
                {item.description}
              </p>
              <p className="text-neutral-600 leading-relaxed text-[15px] mt-4">
                This is exactly the type of product that will help you achieve your goals with a proven step-by-step methodology, guided by an expert.
              </p>
            </div>
          </div>

          {/* Video Section (If exists) */}
          {previewUrl && (
            <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden relative border border-neutral-200 shadow-lg group">
              <div className="absolute inset-0 flex items-center justify-center z-10">
                <div className="w-20 h-20 bg-white/90 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform cursor-pointer shadow-2xl">
                  <PlayCircle className="w-10 h-10 text-black ml-1" />
                </div>
              </div>
              {item.image && <img src={item.image} alt="Video cover" className="w-full h-full object-cover opacity-60" />}
            </div>
          )}

          {/* Benefits Section */}
          {advantagesList.length > 0 && (
            <div>
              <div className="border-b border-neutral-200 flex gap-8 mb-6">
                <button className="pb-4 border-b-2 border-black font-bold text-neutral-900 text-lg">Benefits</button>
                <button className="pb-4 border-b-2 border-transparent font-medium text-neutral-500 text-lg hover:text-neutral-900 transition-colors">Details</button>
              </div>
              <ul className="space-y-4">
                {advantagesList.map((adv, i) => (
                  <li key={i} className="flex gap-3 text-neutral-700 text-[15px]">
                    <span className="text-green-500 font-black shrink-0">✓</span>
                    <span>{adv}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <hr className="border-neutral-200" />

          {/* Learn more about the content creator */}
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 mb-6">Learn more about the content creator</h2>
            <div className="flex gap-4 items-center">
              <div className="w-16 h-16 bg-neutral-200 rounded-full overflow-hidden shrink-0 flex items-center justify-center text-xl font-bold text-neutral-500">
                {item.avatar ? (
                  <img src={item.avatar} alt={item.instructor} className="w-full h-full object-cover" />
                ) : (
                  item.instructor?.charAt(0) || "U"
                )}
              </div>
              <div>
                <h3 className="font-bold text-neutral-900 text-lg">{item.instructor}</h3>
                <p className="text-sm text-neutral-500 font-medium">3 Hotmarter Years · {item.role}</p>
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
                    <p className="text-xs text-neutral-500 mt-1">{item.instructor}</p>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* RIGHT COLUMN: Sticky Sidebar with Pricing & Checkout Button */}
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
