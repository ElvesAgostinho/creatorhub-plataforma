import { redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { CopyIcon } from "lucide-react"
import AreaChartPremium from "@/components/charts/AreaChartPremium"
import PanelSearch from "@/components/PanelSearch"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

export default async function AffiliatePanel({ searchParams }) {
  const params = await searchParams;
  const searchFilter = (params?.q || "").toLowerCase()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/affiliate-panel")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  const { data: application } = await supabase
    .from("affiliate_applications")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!application || application.status !== "approved") {
    redirect("/affiliates")
  }

  const svc = createServiceClient()
  const { data: earnings } = await svc
    .from("affiliate_earnings")
    .select("*")
    .eq("affiliate_id", user.id)

  const fmt = n => (n ?? 0).toLocaleString("pt-PT")

  let total_earned = 0
  let total_pending = 0
  let total_paid = 0

  if (earnings) {
    total_earned = earnings.reduce((acc, curr) => acc + curr.amount_cents, 0)
    total_pending = earnings.filter(e => e.status === "pending").reduce((acc, curr) => acc + curr.amount_cents, 0)
    total_paid = earnings.filter(e => e.status === "paid").reduce((acc, curr) => acc + curr.amount_cents, 0)
  }

  // Get products the affiliate can promote
  let productsQuery = svc
    .from("products")
    .select("id, slug, title, price_cents, image_url, type")
    .eq("published", true)
  
  if (searchFilter) {
    productsQuery = productsQuery.ilike("title", `%${searchFilter}%`)
  }

  const { data: products } = await productsQuery

  const typeLabels = {
    course: "Curso",
    book: "E-book",
    mentorship: "Mentoria",
    event: "Evento"
  }

  const typeBadge = {
    course: "bg-[#FFF8E7] text-yellow-700 border border-yellow-200",
    book: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    mentorship: "bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200",
    event: "bg-sky-50 text-sky-700 border border-sky-200"
  }

  return (
    <div className="bg-[#F9FAFB] min-h-screen text-neutral-900 pt-10 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Dashboard de Afiliado</h1>
            <p className="text-neutral-500 mt-2 text-base font-medium">Bem-vindo(a), {profile?.full_name?.split(' ')[0]}. Acompanha o teu desempenho em tempo real.</p>
          </div>
          <a href="/dashboard" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white border border-neutral-200 hover:border-[#FF4500] hover:text-[#FF4500] text-sm font-bold transition-all shadow-sm text-neutral-700">
            Voltar à Biblioteca
          </a>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-white border border-neutral-100 rounded-3xl p-8 relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_8px_30px_rgba(255,69,0,0.1)] transition-all">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FF4500" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <p className="text-neutral-500 font-bold text-sm tracking-wide uppercase">Total Ganho</p>
            <h3 className="text-4xl font-black mt-2 text-neutral-900">Kz {fmt(Math.round(total_earned/100))}</h3>
            <p className="text-xs text-[#10B981] mt-3 font-bold bg-emerald-50 w-max px-2.5 py-1 rounded-md">+12% este mês</p>
          </div>
          {/* Card 2 */}
          <div className="bg-white border border-neutral-100 rounded-3xl p-8 relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <p className="text-neutral-500 font-bold text-sm tracking-wide uppercase">Saldo Pendente</p>
            <h3 className="text-4xl font-black mt-2 text-neutral-900">Kz {fmt(Math.round(total_pending/100))}</h3>
            <p className="text-xs text-[#F59E0B] mt-3 font-bold bg-amber-50 w-max px-2.5 py-1 rounded-md">Aguarda libertação</p>
          </div>
          {/* Card 3 */}
          <div className="bg-white border border-neutral-100 rounded-3xl p-8 relative overflow-hidden group shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <p className="text-neutral-500 font-bold text-sm tracking-wide uppercase">Saldo Disponível</p>
            <h3 className="text-4xl font-black mt-2 text-[#FF4500]">Kz {fmt(Math.round(total_paid/100))}</h3>
            <p className="text-xs text-neutral-400 mt-3 font-bold bg-neutral-100 w-max px-2.5 py-1 rounded-md">Pronto para saque</p>
          </div>
        </div>

        {/* CHART SECTION */}
        <div className="bg-white border border-neutral-100 rounded-3xl p-6 sm:p-8 mb-16 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-black text-neutral-900 tracking-tight">Evolução de Ganhos</h2>
            <select className="bg-neutral-50 border border-neutral-200 font-bold text-sm text-neutral-700 rounded-xl px-4 py-2 outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500] shadow-sm">
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
              <option>Este Ano</option>
            </select>
          </div>
          <AreaChartPremium color="#FF4500" name="Comissões" />
        </div>

        {/* PRODUCTS GRID */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-black text-neutral-900 tracking-tight">O que queres vender hoje?</h2>
              <span className="text-sm font-black bg-[#FF4500]/10 text-[#FF4500] px-3 py-1.5 rounded-xl">{products?.length || 0} Produtos</span>
            </div>
            <Suspense fallback={<div className="h-10 bg-neutral-100 rounded-xl w-full max-w-md animate-pulse" />}>
              <PanelSearch placeholder="Pesquisar produtos pelo nome..." />
            </Suspense>
          </div>
          
          {(!products || products.length === 0) ? (
            <div className="bg-white border border-neutral-100 rounded-3xl p-16 text-center shadow-sm">
              <p className="text-xl font-bold text-neutral-500">Nenhum produto encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {products.map(p => {
                const affiliateLink = `https://above.ao/product/${p.slug}?ref=${user.id.split('-')[0]}`
                const comm = Math.round((p.price_cents * 0.2)/100)
                
                return (
                  <div key={p.id} className="group relative bg-white border border-neutral-100 rounded-[2rem] overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(255,69,0,0.2)] hover:border-[#FF4500]/30 transition-all duration-500 flex flex-col text-neutral-900">
                    <div className="relative block aspect-[16/9] overflow-hidden bg-neutral-100">
                      {p.image_url ? (
                        <img
                          src={p.image_url}
                          alt={p.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-neutral-400 text-xs font-bold">
                          Sem capa
                        </div>
                      )}
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-500" />
                      
                      <div className="absolute top-4 left-4 flex gap-2 flex-wrap z-10">
                        <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg shadow-md ${typeBadge[p.type] || "bg-white text-neutral-900 border border-neutral-200"}`}>
                          {typeLabels[p.type]?.toUpperCase() || "PRODUTO"}
                        </span>
                      </div>
                    </div>

                    <div className="p-6 flex flex-col gap-4 flex-1">
                      <h3 className="font-extrabold text-[18px] leading-snug line-clamp-2 text-neutral-900">
                        {p.title}
                      </h3>

                      <div className="flex items-center justify-between border-t border-neutral-100 pt-4 mt-auto">
                        <div>
                          <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Preço Base</p>
                          <p className="font-bold text-neutral-600">{fmt(Math.round(p.price_cents/100))} Kz</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] font-black text-[#10B981] uppercase tracking-wider">Comissão (20%)</p>
                          <p className="font-black text-xl text-[#10B981]">{fmt(comm)} Kz</p>
                        </div>
                      </div>

                      <div className="mt-2 bg-neutral-50 rounded-xl p-1.5 flex items-center border border-neutral-200 group-hover:border-[#FF4500]/40 transition-colors">
                        <input 
                          type="text" 
                          readOnly 
                          value={affiliateLink} 
                          className="bg-transparent text-xs text-neutral-500 font-medium w-full px-3 outline-none"
                        />
                        <button 
                          className="shrink-0 bg-white p-2.5 rounded-lg border border-neutral-200 hover:border-[#FF4500] hover:text-[#FF4500] text-neutral-600 shadow-sm transition-all"
                          title="Copiar Link"
                          onClick={() => { /* Add copy functionality here if needed, or rely on browser copy */ }}
                        >
                          <CopyIcon size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
