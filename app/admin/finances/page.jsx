import { redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import AdminNav from "@/components/AdminNav"

export const dynamic = "force-dynamic"

export default async function FinancesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/admin/finances")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  const svc = createServiceClient()

  // 1. Fetch site settings to know base splits
  const { data: settings } = await svc
    .from("site_settings")
    .select("creator_commission_pct")
    .eq("id", "default")
    .single()

  const platformPct = 100 - (settings?.creator_commission_pct || 70)

  // 2. Fetch all completed/active purchases
  const { data: purchases } = await svc
    .from("purchases")
    .select(`
      id, amount_cents, status, created_at, affiliate_id,
      products ( title, affiliate_commission_pct, created_by ),
      profiles!purchases_user_id_profiles_fk ( full_name )
    `)
    .in("status", ["active", "completed"])
    .order("created_at", { ascending: false })

  // 3. Fetch affiliate earnings to match
  const { data: affEarnings } = await svc
    .from("affiliate_earnings")
    .select("purchase_id, amount_cents, status")

  const earningsMap = {}
  if (affEarnings) {
    affEarnings.forEach(e => {
      earningsMap[e.purchase_id] = e
    })
  }

  const fmt = n => (n ?? 0).toLocaleString("pt-PT")

  let totalGross = 0
  let totalPlatform = 0
  let totalCreators = 0
  let totalAffiliates = 0

  const processedPurchases = (purchases || []).map(p => {
    const gross = p.amount_cents || 0
    totalGross += gross

    // Affiliate Cut
    let affCut = 0
    if (p.affiliate_id && earningsMap[p.id]) {
      affCut = earningsMap[p.id].amount_cents
    } else if (p.affiliate_id && p.products?.affiliate_commission_pct) {
      affCut = Math.round(gross * (p.products.affiliate_commission_pct / 100))
    }
    totalAffiliates += affCut

    // Platform Cut
    const platCut = Math.round(gross * (platformPct / 100))
    totalPlatform += platCut

    // Creator Cut
    const creatorCut = gross - platCut - affCut
    totalCreators += creatorCut

    return {
      ...p,
      gross,
      platCut,
      creatorCut,
      affCut
    }
  })

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F5]">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10">
        
        <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
          <h1 className="text-3xl font-extrabold text-[#111]">Gestão Financeira e Comissões</h1>
          <AdminNav />
        </div>

        <div className="bg-white border border-neutral-200 rounded-3xl p-8 mb-10 shadow-sm">
          <h2 className="text-xl font-black mb-6">Resumo Global</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-neutral-50 p-6 rounded-2xl border border-neutral-200">
              <div className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">Vendas Brutas (Total)</div>
              <div className="text-3xl font-black text-neutral-900">{fmt(Math.round(totalGross/100))} <span className="text-lg text-neutral-400">Kz</span></div>
            </div>
            
            <div className="bg-orange-50 p-6 rounded-2xl border border-[#FF4500]/20">
              <div className="text-sm font-bold text-[#FF4500] uppercase tracking-wider mb-2">Lucro da Plataforma ({platformPct}%)</div>
              <div className="text-3xl font-black text-[#FF4500]">{fmt(Math.round(totalPlatform/100))} <span className="text-lg opacity-50">Kz</span></div>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
              <div className="text-sm font-bold text-blue-600 uppercase tracking-wider mb-2">A Pagar (Criadores)</div>
              <div className="text-3xl font-black text-blue-600">{fmt(Math.round(totalCreators/100))} <span className="text-lg opacity-50">Kz</span></div>
            </div>

            <div className="bg-green-50 p-6 rounded-2xl border border-green-200">
              <div className="text-sm font-bold text-green-600 uppercase tracking-wider mb-2">A Pagar (Afiliados)</div>
              <div className="text-3xl font-black text-green-600">{fmt(Math.round(totalAffiliates/100))} <span className="text-lg opacity-50">Kz</span></div>
            </div>
          </div>
          <p className="text-xs text-neutral-400 mt-4 text-center font-medium">Os valores representam todas as vendas com estado "Pago" (active/completed).</p>
        </div>

        <div className="bg-white border border-neutral-200 rounded-3xl p-8 shadow-sm">
          <h2 className="text-xl font-black mb-6">Split Automático por Venda</h2>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead>
                <tr className="border-b-2 border-neutral-100 text-neutral-400">
                  <th className="pb-3 font-bold uppercase tracking-wider">Data</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Produto</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Comprador</th>
                  <th className="pb-3 font-bold uppercase tracking-wider">Total (Bruto)</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-[#FF4500]">Plataforma</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-blue-600">Criador</th>
                  <th className="pb-3 font-bold uppercase tracking-wider text-green-600">Afiliado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {processedPurchases.length === 0 && (
                  <tr>
                    <td colSpan="7" className="py-8 text-center text-neutral-500 font-medium">Sem vendas concluídas.</td>
                  </tr>
                )}
                {processedPurchases.map(p => (
                  <tr key={p.id} className="hover:bg-neutral-50 transition-colors">
                    <td className="py-4 text-neutral-500 font-medium">
                      {new Date(p.created_at).toLocaleDateString("pt-PT")}
                    </td>
                    <td className="py-4 font-bold text-neutral-900 truncate max-w-[200px]" title={p.products?.title}>
                      {p.products?.title || "Produto Apagado"}
                    </td>
                    <td className="py-4 text-neutral-600">
                      {p.profiles?.full_name || "Desconhecido"}
                    </td>
                    <td className="py-4 font-black">
                      {fmt(Math.round(p.gross/100))} <span className="text-xs text-neutral-400 font-normal">Kz</span>
                    </td>
                    <td className="py-4 font-bold text-[#FF4500] bg-orange-50/50">
                      {fmt(Math.round(p.platCut/100))}
                    </td>
                    <td className="py-4 font-bold text-blue-600 bg-blue-50/50">
                      {fmt(Math.round(p.creatorCut/100))}
                    </td>
                    <td className="py-4 font-bold text-green-600 bg-green-50/50">
                      {fmt(Math.round(p.affCut/100))}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  )
}
