import { notFound, redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { getProductBySlug, typeLabels } from "@/lib/data/products"
import { CheckCircle2, Globe, Copy } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AffiliateProductDetails({ params }) {
  const item = await getProductBySlug(params.slug)
  if (!item) notFound()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/affiliate-panel/product/${params.slug}`)

  // Verify affiliate status
  const { data: application } = await supabase
    .from("affiliate_applications")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!application || application.status !== "approved") {
    redirect("/affiliates")
  }

  const affiliateLink = `https://above.ao/product/${item.slug}?ref=${user.id.split('-')[0]}`
  const comm = Math.round((item.price * 0.2)) // 20% commission

  const advantagesList = item.advantages ? item.advantages.split('\n').filter(Boolean) : []
  const socialLinks = item.creatorSocialLinks || {}

  const svc = createServiceClient()
  
  // Get creator ID to fetch other products
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

  const fmt = n => (n ?? 0).toLocaleString("pt-PT")

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-20">
      {/* Top Navbar */}
      <div className="bg-white border-b border-neutral-200 py-4 px-6 sticky top-0 z-10 flex items-center gap-4">
        <a href="/affiliate-panel" className="text-sm font-bold text-neutral-500 hover:text-neutral-900">
          ← Voltar ao Painel
        </a>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-[1.5fr_1fr] gap-12">
        {/* Esquerda: Informações do Produto (Visão do Afiliado) */}
        <div className="space-y-8">
          
          <div className="w-full aspect-video bg-neutral-100 rounded-3xl overflow-hidden shadow-sm border border-neutral-200 relative">
            {item.image ? (
               <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold">Sem capa</div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
            <div className="absolute bottom-6 left-6 text-white">
               <span className="text-xs font-black uppercase tracking-wider bg-[#FF4500] px-3 py-1 rounded-lg mb-2 inline-block">
                 {typeLabels[item.type]}
               </span>
               <h1 className="text-4xl font-black mt-2 leading-tight">{item.title}</h1>
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm">
            <h2 className="text-xl font-bold mb-3 text-neutral-900">Sobre o Produto</h2>
            <p className="text-neutral-600 text-lg leading-relaxed">{item.description}</p>
          </div>

          {/* Informação do Criador */}
          <div className="flex items-center gap-5 p-6 bg-white rounded-3xl border border-neutral-100 shadow-sm">
            <div className="w-16 h-16 bg-gradient-to-tr from-[#FF4500] to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-2xl overflow-hidden shrink-0 shadow-inner">
              {item.avatar ? (
                <img src={item.avatar} alt={item.instructor} className="w-full h-full object-cover" />
              ) : (
                item.instructor.charAt(0)
              )}
            </div>
            <div>
              <div className="text-xs text-neutral-400 font-bold uppercase tracking-wider">Criador</div>
              <div className="font-black text-xl text-neutral-900">{item.instructor}</div>
              <div className="text-sm text-neutral-500 font-medium mt-0.5">{item.role}</div>
            </div>
            
            <div className="ml-auto flex gap-4 text-neutral-400">
              {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" className="hover:text-[#E1306C] transition-colors"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg></a>}
              {socialLinks.youtube && <a href={socialLinks.youtube} target="_blank" className="hover:text-[#FF0000] transition-colors"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg></a>}
              {socialLinks.website && <a href={socialLinks.website} target="_blank" className="hover:text-blue-500 transition-colors"><Globe size={24} /></a>}
            </div>
          </div>

          {advantagesList.length > 0 && (
            <div className="bg-white p-8 rounded-3xl border border-neutral-100 shadow-sm">
              <h2 className="text-xl font-bold mb-6 text-neutral-900">O que vais vender? (Vantagens)</h2>
              <ul className="grid sm:grid-cols-2 gap-4">
                {advantagesList.map((adv, i) => (
                  <li key={i} className="flex gap-3 text-neutral-700 bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                    <CheckCircle2 className="text-[#10B981] shrink-0 mt-0.5" size={20} />
                    <span className="font-medium text-sm">{adv}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Outros Produtos do Criador */}
          {otherProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-black mb-6 text-neutral-900">Mais produtos de {item.instructor}</h2>
              <div className="grid sm:grid-cols-2 gap-6">
                {otherProducts.map(p => (
                  <a href={`/affiliate-panel/product/${p.slug}`} key={p.id} className="group bg-white border border-neutral-100 rounded-3xl overflow-hidden hover:shadow-lg hover:border-[#FF4500]/30 transition-all flex items-center p-3 gap-4">
                     <div className="w-24 h-24 bg-neutral-100 rounded-2xl shrink-0 overflow-hidden relative">
                       {p.image_url ? (
                         <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                       ) : null}
                     </div>
                     <div className="flex-1 py-2 pr-2">
                       <h3 className="font-bold text-sm text-neutral-900 line-clamp-2 leading-snug group-hover:text-[#FF4500] transition-colors">{p.title}</h3>
                       <p className="text-xs text-neutral-500 mt-2 font-medium">{fmt(Math.round(p.price_cents/100))} Kz</p>
                     </div>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Direita: Painel de Afiliação */}
        <aside>
          <div className="border border-neutral-200 rounded-[2.5rem] p-8 bg-white shadow-[0_20px_40px_-15px_rgba(0,0,0,0.05)] sticky top-24">
            <h2 className="text-2xl font-black text-neutral-900 tracking-tight text-center">Afiliação</h2>
            <p className="text-neutral-500 mt-2 text-sm text-center font-medium">Partilha o teu link e ganha comissões</p>

            <div className="mt-8 bg-neutral-50 rounded-3xl p-6 flex flex-col items-center justify-center border border-neutral-100">
              <span className="text-xs font-black text-neutral-400 uppercase tracking-widest mb-2">Comissão por Venda</span>
              <div className="text-5xl font-black text-[#10B981] tracking-tighter">
                {fmt(comm)} <span className="text-2xl text-neutral-400">Kz</span>
              </div>
              <div className="mt-4 text-sm font-bold text-neutral-500 bg-white px-4 py-2 rounded-xl shadow-sm border border-neutral-100">
                Preço Base: {fmt(item.price)} Kz
              </div>
            </div>

            <div className="mt-8">
              <label className="text-sm font-black text-neutral-900 ml-2">O teu Link Exclusivo</label>
              <div className="mt-3 relative">
                <input 
                  type="text" 
                  readOnly 
                  value={affiliateLink} 
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-2xl py-4 pl-4 pr-16 text-sm font-medium text-neutral-600 focus:outline-none focus:ring-2 focus:ring-[#FF4500]/50 focus:border-[#FF4500] transition-all"
                  id="affLink"
                />
                <button 
                  className="absolute right-2 top-2 bottom-2 bg-white border border-neutral-200 hover:border-[#FF4500] hover:text-[#FF4500] text-neutral-700 px-4 rounded-xl flex items-center justify-center shadow-sm transition-all active:scale-95"
                  title="Copiar Link"
                  // Note: Client component interactivity would be better here for clipboard, 
                  // but for MVP a simple input is selectable. We'll add a simple onClick script if needed.
                >
                  <Copy size={18} />
                </button>
              </div>
              <p className="text-xs text-neutral-400 font-medium mt-3 ml-2 text-center">
                Usa este link exato nas tuas redes sociais, site ou WhatsApp. O rastreio é automático.
              </p>
            </div>
            
            <a 
              href={affiliateLink} 
              target="_blank"
              className="mt-6 w-full bg-neutral-900 hover:bg-black text-white font-bold py-4 rounded-2xl flex justify-center items-center gap-2 transition-all shadow-lg"
            >
              Testar o meu Link
            </a>

          </div>
        </aside>
      </div>
    </div>
  )
}
