import { notFound, redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { getProductBySlug, typeLabels } from "@/lib/data/products"
import { getLessonsForProduct } from "@/lib/data/lessons"
import { CheckCircle2, Globe, Copy, PlayCircle, FolderDown, Link as LinkIcon, ExternalLink } from "lucide-react"

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

  const affiliateId = user.id.split('-')[0]
  const defaultAffiliateLink = `https://above.ao/product/${item.slug}?ref=${affiliateId}`
  const comm = Math.round((item.price * (item.affiliate_commission_pct || 20)) / 100)

  const advantagesList = item.advantages ? item.advantages.split('\n').filter(Boolean) : []
  const socialLinks = item.creatorSocialLinks || {}

  const svc = createServiceClient()
  
  // Get creator ID and extra affiliate details directly from products table
  const { data: productRow } = await svc.from("products").select("created_by, affiliate_training_video, affiliate_materials_link, affiliate_extra_links").eq("id", item.id).single()
  
  const creatorId = productRow?.created_by
  const affiliateTrainingVideo = productRow?.affiliate_training_video
  const affiliateMaterialsLink = productRow?.affiliate_materials_link
  const affiliateExtraLinks = productRow?.affiliate_extra_links || []

  // Fetch Modules
  let lessons = []
  try {
    lessons = await getLessonsForProduct(item.id) || []
  } catch(e) {}

  // Group modules
  const modulesSet = new Set()
  const moduleList = []
  if (lessons && item.type === 'course') {
    lessons.forEach(l => {
      const mName = l.module?.title || "Módulo Geral"
      if (!modulesSet.has(mName)) {
        modulesSet.add(mName)
        moduleList.push({ title: mName, lessonCount: 1 })
      } else {
        const m = moduleList.find(x => x.title === mName)
        if (m) m.lessonCount += 1
      }
    })
  }

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

  // YouTube embed parser
  let embedVideoUrl = null;
  if (affiliateTrainingVideo) {
    const ytMatch = affiliateTrainingVideo.match(/^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/);
    if (ytMatch && ytMatch[2].length === 11) {
      embedVideoUrl = `https://www.youtube.com/embed/${ytMatch[2]}`;
    }
  }

  return (
    <div className="bg-[#F9FAFB] min-h-screen pb-20">
      {/* Top Navbar */}
      <div className="bg-white border-b border-neutral-200 py-4 px-6 sticky top-0 z-10 flex items-center justify-between gap-4 shadow-sm">
        <a href="/affiliate-panel" className="text-sm font-bold text-neutral-500 hover:text-neutral-900 flex items-center gap-2">
          ← Painel de Afiliado
        </a>
        <div className="text-sm font-bold text-[#00A859] bg-[#F4FDF8] border border-[#E8F8F0] px-4 py-2 rounded-xl">
          Ganhas até {fmt(comm)} Kz por cada venda
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-[2fr_1fr] gap-12">
        {/* Esquerda: Informações e Ferramentas */}
        <div className="space-y-8">
          
          <div className="flex items-center gap-6 bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm relative overflow-hidden">
             <div className="w-32 h-32 bg-neutral-100 rounded-2xl shrink-0 overflow-hidden relative shadow-inner z-10">
               {item.image ? (
                 <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
               ) : (
                 <div className="w-full h-full flex items-center justify-center text-neutral-400 font-bold">Sem capa</div>
               )}
             </div>
             <div className="z-10">
               <span className="text-[10px] font-black uppercase tracking-wider bg-neutral-900 text-white px-2 py-1 rounded-md mb-3 inline-block">
                 {typeLabels[item.type]}
               </span>
               <h1 className="text-3xl font-black text-neutral-900 tracking-tight leading-tight">{item.title}</h1>
               <div className="text-sm text-neutral-500 font-medium mt-2 flex items-center gap-2">
                 Produtor: <span className="text-neutral-900 font-bold">{item.instructor}</span>
               </div>
             </div>
             <div className="absolute -right-10 -top-10 opacity-[0.03] scale-150 pointer-events-none">
                <CheckCircle2 size={300} />
             </div>
          </div>

          {/* Vídeo de Treino do Afiliado */}
          {affiliateTrainingVideo && (
            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
              <h2 className="text-xl font-bold mb-4 text-neutral-900 flex items-center gap-2">
                <PlayCircle className="text-[#FF4500]" /> Palavra do Produtor
              </h2>
              <p className="text-sm text-neutral-500 font-medium mb-6">Aprende as melhores estratégias para vender este produto diretamente com o criador.</p>
              <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden relative border border-neutral-200 shadow-sm">
                {embedVideoUrl ? (
                  <iframe 
                    src={embedVideoUrl} 
                    className="absolute inset-0 w-full h-full" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                    allowFullScreen
                  ></iframe>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <a href={affiliateTrainingVideo} target="_blank" className="bg-white text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 hover:scale-105 transition-transform">
                      <PlayCircle /> Assistir Vídeo de Treino
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Recursos / Material de Divulgação */}
          {affiliateMaterialsLink && (
            <div className="bg-gradient-to-br from-[#FF4500]/10 to-orange-50 p-8 rounded-3xl border border-[#FF4500]/20 shadow-sm flex flex-col sm:flex-row gap-6 items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-2 mb-2">
                  <FolderDown className="text-[#FF4500]" /> Material de Divulgação
                </h2>
                <p className="text-sm text-neutral-700 font-medium leading-relaxed">Acede a banners, vídeos, copys e criativos disponibilizados pelo produtor para usares nas tuas campanhas e aumentares as tuas conversões.</p>
              </div>
              <a href={affiliateMaterialsLink} target="_blank" className="shrink-0 bg-[#FF4500] hover:bg-[#E03E00] text-white px-8 py-4 rounded-xl font-bold transition-all shadow-lg hover:-translate-y-1 whitespace-nowrap">
                Aceder Materiais
              </a>
            </div>
          )}

          {/* Módulos do Curso */}
          {item.type === 'course' && moduleList && moduleList.length > 0 && (
            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
              <h2 className="text-xl font-bold mb-6 text-neutral-900">Conteúdo do Curso (O que estás a vender)</h2>
              <div className="space-y-3">
                {moduleList.map((mod, index) => (
                  <div key={index} className="border border-neutral-100 bg-neutral-50 rounded-xl p-4 flex justify-between items-center hover:bg-neutral-100 transition-colors cursor-default">
                    <div className="font-bold text-neutral-800 text-sm flex items-center gap-3">
                      <span className="w-8 h-8 rounded-lg bg-white border border-neutral-200 flex items-center justify-center text-xs text-neutral-500">{index + 1}</span>
                      {mod.title}
                    </div>
                    <div className="text-xs font-bold text-neutral-500 uppercase tracking-wider bg-white border border-neutral-200 px-3 py-1.5 rounded-lg">{mod.lessonCount} {mod.lessonCount === 1 ? 'Aula' : 'Aulas'}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Informações Extras */}
          <div className="grid md:grid-cols-2 gap-8">
            {advantagesList.length > 0 && (
              <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm">
                <h2 className="text-xl font-bold mb-6 text-neutral-900">Vantagens do Produto</h2>
                <ul className="space-y-4">
                  {advantagesList.map((adv, i) => (
                    <li key={i} className="flex gap-3 text-neutral-700">
                      <CheckCircle2 className="text-[#10B981] shrink-0 mt-0.5" size={20} />
                      <span className="font-medium text-sm leading-relaxed">{adv}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
            
            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm flex flex-col justify-center items-center text-center">
              <div className="w-20 h-20 bg-neutral-200 rounded-full flex items-center justify-center text-neutral-500 font-bold text-2xl overflow-hidden shadow-inner mb-4">
                {item.avatar ? (
                  <img src={item.avatar} alt={item.instructor} className="w-full h-full object-cover" />
                ) : (
                  item.instructor.charAt(0)
                )}
              </div>
              <div className="font-bold text-xl text-neutral-900">{item.instructor}</div>
              <div className="text-sm text-neutral-500 font-medium mt-1 mb-6">{item.role}</div>
              
              <div className="flex gap-4 text-neutral-400">
                {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center hover:bg-[#E1306C] hover:text-white transition-colors"><Globe size={18} /></a>}
                {socialLinks.youtube && <a href={socialLinks.youtube} target="_blank" className="w-10 h-10 rounded-full bg-neutral-50 flex items-center justify-center hover:bg-[#FF0000] hover:text-white transition-colors"><Globe size={18} /></a>}
              </div>
            </div>
          </div>

          {/* Outros Produtos do Criador */}
          {otherProducts.length > 0 && (
            <div>
              <h2 className="text-2xl font-black mb-6 text-neutral-900">Outros produtos de {item.instructor}</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {otherProducts.map(p => (
                  <a href={`/affiliate-panel/product/${p.slug}`} key={p.id} className="group bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-lg hover:border-[#FF4500]/30 transition-all flex items-center p-3 gap-4">
                     <div className="w-20 h-20 bg-neutral-100 rounded-xl shrink-0 overflow-hidden relative border border-neutral-100">
                       {p.image_url ? (
                         <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                       ) : null}
                     </div>
                     <div className="flex-1 py-1 pr-2">
                       <h3 className="font-bold text-sm text-neutral-900 line-clamp-2 leading-snug group-hover:text-[#FF4500] transition-colors">{p.title}</h3>
                       <p className="text-xs text-neutral-500 mt-1 font-medium">{fmt(Math.round(p.price_cents/100))} Kz</p>
                     </div>
                  </a>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Direita: Hotlinks de Afiliado */}
        <aside>
          <div className="border border-neutral-200 rounded-3xl bg-white shadow-xl sticky top-24 overflow-hidden">
            <div className="bg-neutral-900 p-8 text-white text-center">
              <h2 className="text-2xl font-black tracking-tight">Os teus HotLinks</h2>
              <p className="text-neutral-400 mt-2 text-sm font-medium">Partilha e recebe {item.affiliate_commission_pct || 20}% de comissão</p>
            </div>
            
            <div className="p-6 space-y-6">
              
              {/* Link Padrão */}
              <div>
                <label className="text-sm font-bold text-neutral-900 flex items-center gap-2 mb-2">
                  <LinkIcon size={16} className="text-[#FF4500]" /> Página do Produto (Principal)
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    readOnly 
                    value={defaultAffiliateLink} 
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl py-3 pl-3 pr-24 text-sm font-medium text-neutral-600 focus:outline-none focus:ring-2 focus:ring-[#FF4500] transition-all"
                  />
                  <div className="absolute right-1 top-1 bottom-1 flex gap-1">
                    <a href={defaultAffiliateLink} target="_blank" className="w-10 flex items-center justify-center bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-600 rounded-lg transition-colors" title="Testar Link"><ExternalLink size={16}/></a>
                    <button className="w-10 flex items-center justify-center bg-[#FF4500] hover:bg-[#E03E00] text-white rounded-lg transition-colors" title="Copiar"><Copy size={16}/></button>
                  </div>
                </div>
              </div>

              {/* Links Extras do Produtor */}
              {affiliateExtraLinks && affiliateExtraLinks.length > 0 && (
                <div className="pt-6 border-t border-neutral-100 space-y-6">
                  <h3 className="font-black text-sm text-neutral-900 uppercase tracking-wider mb-4">Links Alternativos</h3>
                  
                  {affiliateExtraLinks.map((linkObj, idx) => {
                    const hasQuery = linkObj.url.includes('?');
                    const separator = hasQuery ? '&' : '?';
                    const finalLink = `${linkObj.url}${separator}ref=${affiliateId}`;

                    return (
                      <div key={idx} className="bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
                        <label className="text-sm font-bold text-neutral-900 flex items-center gap-2 mb-2">
                          <LinkIcon size={14} className="text-neutral-400" /> {linkObj.label}
                        </label>
                        <div className="relative">
                          <input 
                            type="text" 
                            readOnly 
                            value={finalLink} 
                            className="w-full bg-white border border-neutral-200 rounded-xl py-3 pl-3 pr-24 text-sm font-medium text-neutral-600 focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-all"
                          />
                          <div className="absolute right-1 top-1 bottom-1 flex gap-1">
                            <a href={finalLink} target="_blank" className="w-10 flex items-center justify-center bg-white border border-neutral-200 hover:bg-neutral-50 text-neutral-600 rounded-lg transition-colors" title="Testar Link"><ExternalLink size={16}/></a>
                            <button className="w-10 flex items-center justify-center bg-neutral-800 hover:bg-black text-white rounded-lg transition-colors" title="Copiar"><Copy size={16}/></button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}

            </div>
          </div>
        </aside>
      </div>
    </div>
  )
}
