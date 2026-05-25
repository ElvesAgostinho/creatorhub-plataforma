import { redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { CopyIcon } from "lucide-react"
import AreaChartPremium from "@/components/charts/AreaChartPremium"

export const dynamic = "force-dynamic"

export default async function AffiliatePanel() {
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
  const { data: products } = await svc
    .from("products")
    .select("id, slug, title, price_cents")
    .eq("published", true)

  return (
    <div className="bg-[#F9FAFB] min-h-screen text-neutral-900 pt-10 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-extrabold text-neutral-900">Dashboard de Afiliado</h1>
            <p className="text-neutral-500 mt-2 text-sm">Bem-vindo(a), {profile?.full_name?.split(' ')[0]}. Acompanha o teu desempenho em tempo real.</p>
          </div>
          <a href="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-neutral-200 hover:border-[#FF4500] hover:text-[#FF4500] text-sm font-semibold transition-all shadow-sm text-neutral-700">
            Voltar à Biblioteca principal
          </a>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {/* Card 1 */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 relative overflow-hidden group shadow-sm">
            <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FF4500" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <p className="text-neutral-500 font-medium text-sm">Total Ganho</p>
            <h3 className="text-4xl font-black mt-2 text-neutral-900">Kz {fmt(Math.round(total_earned/100))}</h3>
            <p className="text-xs text-[#10B981] mt-3 font-semibold">+12% este mês</p>
          </div>
          {/* Card 2 */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 relative overflow-hidden group shadow-sm">
            <p className="text-neutral-500 font-medium text-sm">Saldo Pendente</p>
            <h3 className="text-4xl font-black mt-2 text-neutral-900">Kz {fmt(Math.round(total_pending/100))}</h3>
            <p className="text-xs text-[#F59E0B] mt-3 font-semibold">Aguarda libertação</p>
          </div>
          {/* Card 3 */}
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 relative overflow-hidden group shadow-sm">
            <p className="text-neutral-500 font-medium text-sm">Saldo Disponível</p>
            <h3 className="text-4xl font-black mt-2 text-[#FF4500]">Kz {fmt(Math.round(total_paid/100))}</h3>
            <p className="text-xs text-neutral-400 mt-3 font-semibold">Pronto para saque</p>
          </div>
        </div>

        {/* CHART SECTION */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 mb-12 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-neutral-900">Evolução de Ganhos</h2>
            <select className="bg-neutral-50 border border-neutral-200 text-sm text-neutral-700 rounded-lg px-4 py-2 outline-none focus:border-[#FF4500] focus:ring-1 focus:ring-[#FF4500]">
              <option>Últimos 7 dias</option>
              <option>Últimos 30 dias</option>
              <option>Este Ano</option>
            </select>
          </div>
          <AreaChartPremium color="#FF4500" name="Comissões" />
        </div>

        {/* PRODUCTS LIST */}
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-8 py-5 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900">Produtos Disponíveis</h2>
            <span className="text-xs font-bold bg-[#FFF0EB] text-[#FF4500] px-3 py-1.5 rounded-full">{products?.length || 0} Produtos</span>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-neutral-500 text-xs uppercase bg-neutral-50/50">
                <tr>
                  <th className="px-8 py-4 font-semibold border-b border-neutral-100">Produto</th>
                  <th className="px-8 py-4 font-semibold border-b border-neutral-100">Preço Base</th>
                  <th className="px-8 py-4 font-semibold border-b border-neutral-100">Comissão Estimada (20%)</th>
                  <th className="px-8 py-4 font-semibold text-right border-b border-neutral-100">O Teu Link</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {products?.map(p => {
                  // Fake domain for example
                  const affiliateLink = `https://above.ao/course/${p.slug}?ref=${user.id.split('-')[0]}`
                  const comm = Math.round((p.price_cents * 0.2)/100)
                  return (
                    <tr key={p.id} className="hover:bg-neutral-50 transition-colors group bg-white">
                      <td className="px-8 py-5 font-bold text-neutral-900">{p.title}</td>
                      <td className="px-8 py-5 text-neutral-600">Kz {fmt(Math.round(p.price_cents/100))}</td>
                      <td className="px-8 py-5 text-[#10B981] font-bold">Kz {fmt(comm)}</td>
                      <td className="px-8 py-5 text-right">
                        <div className="inline-flex items-center bg-neutral-50 border border-neutral-200 rounded-lg p-1 group-hover:border-[#FF4500]/50 transition-colors">
                          <input 
                            type="text" 
                            readOnly 
                            value={affiliateLink} 
                            className="bg-transparent text-xs text-neutral-600 w-48 px-3 outline-none"
                          />
                          <button className="p-2 hover:bg-white rounded-md transition-colors text-neutral-500 hover:text-[#FF4500] shadow-sm border border-transparent hover:border-neutral-200" title="Copiar Link">
                            <CopyIcon size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {(!products || products.length === 0) && (
            <div className="p-12 text-center text-neutral-500">
              Nenhum produto disponível para promoção de momento.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
