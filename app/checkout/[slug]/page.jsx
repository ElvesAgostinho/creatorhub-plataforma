import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getProductBySlug, typeLabels } from "@/lib/data/products"
import { createPendingPurchase } from "./actions"
import { CheckCircle2, Globe, Instagram, Youtube, Twitter, Facebook, ExternalLink } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CheckoutPage({ params, searchParams }) {
  const item = await getProductBySlug(params.slug)
  if (!item) notFound()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/checkout/${params.slug}`)

  // Fetch Site Settings
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .eq("id", "default")
    .single()

  // Fetch Modules
  const { data: modules } = await supabase
    .from("modules")
    .select("id, title")
    .eq("product_id", item.id)
    .order("position", { ascending: true })

  let lessons = []
  if (modules && modules.length > 0) {
    const { data: lData } = await supabase
      .from("lessons")
      .select("id, module_id, title")
      .in("module_id", modules.map(m => m.id))
      .order("position", { ascending: true })
    if (lData) lessons = lData
  }

  // Fetch Creator Profile (for avatar)
  // Assume creator is linked to the product. We can search by instructor name or if the product had created_by we could use it.
  // We'll just display what we have in `item`.

  const fmt = n => (n ?? 0).toLocaleString("pt-PT")

  const advantagesList = item.advantages ? item.advantages.split('\n').filter(Boolean) : []
  const socialLinks = item.creatorSocialLinks || {}

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid lg:grid-cols-[1.5fr_1fr] gap-12">
      {/* Esquerda: Informações do Produto e Criador (Estilo Hotmart) */}
      <div className="space-y-8">
        
        {/* Media Promocional (Vídeo ou Imagem) */}
        {item.promoVideoUrl ? (
          <div className="w-full aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border border-neutral-200">
            {(item.promoMediaSource === 'youtube' || item.promoVideoUrl.includes('youtube.com') || item.promoVideoUrl.includes('youtu.be')) ? (
              <iframe
                width="100%"
                height="100%"
                src={`https://www.youtube.com/embed/${item.promoVideoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([^&]{11})/)?.[1] || ''}?rel=0`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (item.promoMediaSource === 'vimeo' || item.promoVideoUrl.includes('vimeo.com')) ? (
              <iframe 
                src={`https://player.vimeo.com/video/${item.promoVideoUrl.split('/').pop()}?title=0&byline=0&portrait=0`} 
                width="100%" height="100%" frameBorder="0" allow="autoplay; fullscreen; picture-in-picture"
              ></iframe>
            ) : (item.promoMediaSource === 'google_drive' || item.promoVideoUrl.includes('drive.google.com')) ? (
              <iframe src={item.promoVideoUrl.replace('/view', '/preview')} width="100%" height="100%" allow="autoplay"></iframe>
            ) : (
               <video src={item.promoVideoUrl.startsWith("storage:") ? `/storage/products/${item.promoVideoUrl.replace("storage:products/", "")}` : item.promoVideoUrl} controls className="w-full h-full object-cover" controlsList="nodownload" />
            )}
          </div>
        ) : (
          <div className="w-full aspect-video bg-neutral-100 rounded-2xl overflow-hidden shadow-sm border border-neutral-200">
            <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div>
          <h1 className="text-3xl font-extrabold text-[#111]">{item.title}</h1>
          <p className="text-neutral-600 mt-2 text-lg">{item.description}</p>
        </div>

        {/* Informação do Criador */}
        <div className="flex items-center gap-4 p-4 bg-neutral-50 rounded-2xl border border-neutral-100">
          <div className="w-14 h-14 bg-gradient-to-tr from-[#FF4500] to-orange-400 rounded-full flex items-center justify-center text-white font-bold text-xl overflow-hidden shrink-0">
            {item.avatar ? (
              <img src={item.avatar} alt={item.instructor} className="w-full h-full object-cover" />
            ) : (
              item.instructor.charAt(0)
            )}
          </div>
          <div>
            <div className="text-sm text-neutral-500 font-medium">Criado por</div>
            <div className="font-bold text-lg">{item.instructor}</div>
            <div className="text-sm text-neutral-600">{item.role}</div>
          </div>
          
          {/* Social Links do Criador */}
          <div className="ml-auto flex gap-3 text-neutral-400">
            {socialLinks.instagram && <a href={socialLinks.instagram} target="_blank" className="hover:text-[#E1306C]"><Instagram size={20} /></a>}
            {socialLinks.youtube && <a href={socialLinks.youtube} target="_blank" className="hover:text-[#FF0000]"><Youtube size={20} /></a>}
            {socialLinks.twitter && <a href={socialLinks.twitter} target="_blank" className="hover:text-[#1DA1F2]"><Twitter size={20} /></a>}
            {socialLinks.website && <a href={socialLinks.website} target="_blank" className="hover:text-blue-500"><Globe size={20} /></a>}
          </div>
        </div>

        {/* Para quem é o curso */}
        {item.targetAudience && (
          <div>
            <h2 className="text-xl font-bold mb-3">Para quem é este curso?</h2>
            <p className="text-neutral-700 leading-relaxed bg-[#FF4500]/5 p-5 rounded-2xl border border-[#FF4500]/10">
              {item.targetAudience}
            </p>
          </div>
        )}

        {/* Vantagens */}
        {advantagesList.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Vantagens do Produto</h2>
            <ul className="space-y-3">
              {advantagesList.map((adv, i) => (
                <li key={i} className="flex gap-3 text-neutral-700">
                  <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
                  <span>{adv}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Módulos do Curso */}
        {item.type === "course" && modules && modules.length > 0 && (
          <div>
            <h2 className="text-xl font-bold mb-4">Conteúdo do Curso</h2>
            <div className="border border-neutral-200 rounded-2xl overflow-hidden bg-white">
              {modules.map((mod, i) => {
                const modLessons = lessons.filter(l => l.module_id === mod.id)
                return (
                  <div key={mod.id} className={`p-4 ${i !== modules.length - 1 ? 'border-b border-neutral-100' : ''}`}>
                    <div className="font-bold text-sm text-neutral-800 flex justify-between">
                      <span>Módulo {i + 1}</span>
                      <span className="text-xs bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full">{modLessons.length} aulas</span>
                    </div>
                    <div className="text-neutral-700 mt-1 font-medium">{mod.title}</div>
                    {modLessons.length > 0 && (
                      <ul className="mt-3 space-y-1.5 border-t border-neutral-50 pt-3">
                        {modLessons.map(l => (
                          <li key={l.id} className="text-sm text-neutral-500 flex items-start gap-2">
                            <span className="text-neutral-300 mt-0.5">▶</span>
                            <span>{l.title}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Informações Específicas de Outros Tipos */}
        {item.type === "book" && (
          <div className="p-6 border border-neutral-200 bg-white rounded-2xl flex items-start gap-4">
            <div className="w-12 h-12 shrink-0 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">E-book Digital (PDF)</h3>
              <p className="text-sm text-neutral-600 mt-1">
                Ao finalizar a compra, receberás acesso imediato ao ficheiro PDF deste livro, que poderás ler em qualquer dispositivo (telemóvel, tablet ou computador). O PDF é carimbado com o teu email para evitar pirataria.
              </p>
            </div>
          </div>
        )}

        {item.type === "mentorship" && (
          <div className="p-6 border border-neutral-200 bg-white rounded-2xl flex items-start gap-4">
            <div className="w-12 h-12 shrink-0 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">Sessão de Mentoria / Consultoria</h3>
              <p className="text-sm text-neutral-600 mt-1">
                Esta compra garante-te acesso a uma sessão exclusiva. Após o pagamento, poderás agendar diretamente na área de membros, escolhendo o horário que melhor se adapta à tua disponibilidade entre as vagas abertas pelo criador.
              </p>
            </div>
          </div>
        )}

        {item.type === "event" && (
          <div className="p-6 border border-neutral-200 bg-white rounded-2xl flex items-start gap-4">
            <div className="w-12 h-12 shrink-0 bg-orange-50 text-[#FF4500] rounded-xl flex items-center justify-center">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-lg">Evento Exclusivo</h3>
              <p className="text-sm text-neutral-600 mt-1">
                Acesso garantido ao evento ao vivo. Encontrarás o link de acesso seguro (Zoom, Meet, etc) na tua área de alunos. Mantém-te atento ao início do evento!
              </p>
            </div>
          </div>
        )}

        {/* Link Externo Opcional */}
        {item.externalSalesUrl && (
          <div className="mt-8 flex items-center justify-between p-5 border border-blue-100 bg-blue-50 rounded-2xl">
            <div>
              <div className="font-bold text-blue-900">Saber mais detalhes?</div>
              <div className="text-sm text-blue-700 mt-1">Visite a página oficial do criador para mais informações.</div>
            </div>
            <a href={item.externalSalesUrl} target="_blank" className="flex items-center gap-2 px-4 py-2 bg-white text-blue-700 font-bold rounded-xl text-sm border border-blue-200 hover:bg-blue-100 transition-colors">
              Página Oficial <ExternalLink size={16} />
            </a>
          </div>
        )}
      </div>

      {/* Direita: Checkout Form */}
      <aside>
        <form
          action={createPendingPurchase}
          className="border border-neutral-200 rounded-2xl p-6 bg-white shadow-xl shadow-black/5 space-y-6 sticky top-24"
        >
          <div>
            <h2 className="text-xl font-extrabold text-[#111]">Finalizar compra</h2>
            <p className="text-neutral-500 mt-1 text-xs">Transação 100% segura e encriptada.</p>
          </div>

          <input type="hidden" name="slug" value={item.slug} />
          {searchParams?.ref && <input type="hidden" name="ref" value={searchParams.ref} />}

          <div className="p-4 bg-neutral-50 rounded-xl border border-neutral-100 flex gap-4">
            <img src={item.image} alt={item.title} className="w-20 h-14 object-cover rounded-md" />
            <div>
               <div className="font-bold leading-tight">{item.title}</div>
               <div className="text-xs text-[#FF4500] font-bold mt-1 uppercase">{typeLabels[item.type]}</div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-baseline mb-2">
              <span className="text-neutral-600 font-medium">Total a pagar:</span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-[#111]">{fmt(item.price)} Kz</span>
              </div>
            </div>
            {item.discount > 0 && (
              <div className="flex justify-end gap-2 items-center">
                <span className="text-xs text-red-600 font-bold bg-red-50 px-2 py-0.5 rounded">- {item.discount}% desc.</span>
                <span className="text-sm line-through text-neutral-400">{fmt(item.originalPrice)} Kz</span>
              </div>
            )}
          </div>

          <div className="border-t border-neutral-100 pt-6">
            <label className="text-sm font-bold text-neutral-800">Método de Pagamento</label>
            <select
              name="payment_method"
              defaultValue="transfer"
              className="mt-2 w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4500] focus:border-transparent transition-all shadow-sm"
            >
              <option value="transfer">Transferência Bancária / Multicaixa Express</option>
              <option value="unitel_money">Unitel Money</option>
              <option value="africell_money">Africell Money</option>
            </select>
          </div>

          {/* Dados de Pagamento (Instruções) */}
          <div className="bg-[#FFF0EB] border border-[#FF4500]/20 rounded-xl p-4 text-sm text-neutral-800">
            Faz a transferência para:
            <div className="mt-2 font-mono bg-white px-3 py-2 rounded-lg border border-[#FF4500]/10 font-bold text-center">
              {settings?.platform_iban || "Não configurado"}
            </div>
            <div className="text-center mt-1 text-xs text-neutral-600">{settings?.platform_beneficiary}</div>
          </div>

          <div>
            <label className="text-sm font-bold text-neutral-800">Comprovativo / Referência</label>
            <input
              type="text"
              name="payment_ref"
              required
              placeholder="Ex: TRX-2026 ou últimos 6 dígitos"
              className="mt-2 w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4500] focus:border-transparent transition-all shadow-sm"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#FF4500] hover:bg-[#E03E00] text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#FF4500]/20 mt-4 uppercase tracking-wider text-sm flex justify-center items-center gap-2"
          >
            Confirmar Pedido Agora
          </button>

          <p className="text-xs text-center text-neutral-400 mt-4 px-4">
            Ao comprar, concordas com os Termos de Serviço e Política de Privacidade da CreatorHub.
          </p>
        </form>
      </aside>
    </div>
  )
}
