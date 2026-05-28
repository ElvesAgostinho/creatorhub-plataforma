import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"


export const dynamic = "force-dynamic"

export default async function AnalyticsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/admin/analytics")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin" && profile?.role !== "creator") {
    redirect("/dashboard")
  }

  const isAdmin = profile.role === "admin"

  // Fetch user's products if they are a creator
  let myProductIds = []
  if (!isAdmin) {
    const { data: myProducts } = await supabase.from('products').select('id').eq('created_by', user.id)
    myProductIds = myProducts?.map(p => p.id) || []
  }

  // Fetch purchases
  let query = supabase.from("purchases").select(`
    id, amount_cents, status, created_at,
    product_id,
    products!inner ( title )
  `)
  
  if (!isAdmin) {
    if (myProductIds.length === 0) {
      // Creator has no products, so no purchases
      query = query.in('product_id', ['00000000-0000-0000-0000-000000000000'])
    } else {
      query = query.in('product_id', myProductIds)
    }
  }

  const { data: allPurchases } = await query

  const purchases = allPurchases || []
  const activePurchases = purchases.filter(p => p.status === 'active' || p.status === 'completed' || p.status === 'pending') // Usually active/completed means paid
  const revenueCents = activePurchases.reduce((acc, p) => acc + (p.amount_cents || 0), 0)
  const revenue = (revenueCents / 100).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' }) // ou EUR dependendo do país
  const activeStudents = new Set(activePurchases.map(p => p.user_id)).size // wait, user_id is not selected!
  
  // Calculate refunds
  const refundCount = purchases.filter(p => p.status === 'refunded').length
  const refundRate = purchases.length > 0 ? ((refundCount / purchases.length) * 100).toFixed(1) + '%' : '0%'

  const stats = [
    { label: "Receita Total", value: revenue, trend: "+0%" },
    { label: "Vendas Totais", value: activePurchases.length.toString(), trend: "+0%" },
    { label: "Taxa de Reembolso", value: refundRate, trend: "0%" },
    { label: "Compras Ativas", value: activePurchases.length.toString(), trend: "+0%" },
  ]

  // Top products
  const productSales = {}
  activePurchases.forEach(p => {
    const title = p.products?.title || 'Produto'
    productSales[title] = (productSales[title] || 0) + 1
  })
  const topProducts = Object.entries(productSales)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([title, sales]) => ({ title, sales }))

  // Chart data (Group by Month for the last 12 months)
  const monthNames = ["Jan", "Fev", "Mar", "Abr", "Mai", "Jun", "Jul", "Ago", "Set", "Out", "Nov", "Dez"]
  const currentMonth = new Date().getMonth()
  
  const chartLabels = []
  const chartData = []
  for (let i = 11; i >= 0; i--) {
    let d = new Date()
    d.setMonth(currentMonth - i)
    chartLabels.push(monthNames[d.getMonth()])
    
    // sum revenue for this month
    const m = d.getMonth()
    const y = d.getFullYear()
    const monthPurchases = activePurchases.filter(p => {
      const pDate = new Date(p.created_at)
      return pDate.getMonth() === m && pDate.getFullYear() === y
    })
    const mRevenue = monthPurchases.reduce((acc, p) => acc + (p.amount_cents || 0), 0) / 100
    chartData.push(mRevenue)
  }

  // Normalize chart data for UI (0 to 100 height)
  const maxRevenue = Math.max(...chartData, 1) // prevent division by zero
  const chartHeights = chartData.map(v => (v / maxRevenue) * 100)

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F5]">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10">
        
        <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
          <h1 className="text-3xl font-extrabold text-[#111]">{isAdmin ? "Admin — Análises (Global)" : "Análises de Vendas"}</h1>

        </div>

        <div className="flex items-center justify-between mb-8">
          <p className="text-neutral-500">Acompanha a performance do teu negócio digital.</p>
          <select className="border border-neutral-300 rounded-lg px-4 py-2 text-sm font-semibold bg-white outline-none">
            <option>Últimos 12 meses</option>
          </select>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map(s => (
            <div key={s.label} className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-sm">
              <div className="text-sm font-bold text-neutral-500 mb-2">{s.label}</div>
              <div className="flex items-end gap-3">
                <div className="text-3xl font-extrabold truncate max-w-full" title={s.value}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-3xl p-8">
            <h3 className="font-extrabold text-lg mb-6">Receita gerada</h3>
            <div className="h-64 flex items-end gap-2">
              {chartHeights.map((h, i) => (
                <div key={i} className="flex-1 bg-[#FF4500]/20 rounded-t-md hover:bg-[#FF4500] transition-colors relative group" style={{ height: `${Math.max(h, 2)}%` }}>
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity z-10">
                    {(chartData[i] || 0).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs font-bold text-neutral-400 mt-4 uppercase">
              {chartLabels.map((lbl, i) => <span key={i}>{lbl}</span>)}
            </div>
          </div>

          <div className="bg-white border border-neutral-200 rounded-3xl p-8">
            <h3 className="font-extrabold text-lg mb-6">Top Produtos (Vendas)</h3>
            <div className="space-y-6">
              {topProducts.length === 0 ? (
                <p className="text-neutral-500 text-sm">Ainda sem dados de vendas.</p>
              ) : (
                topProducts.map((p, i) => (
                  <div key={i} className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 shrink-0 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-xs text-neutral-500">
                        #{i + 1}
                      </div>
                      <div className="font-bold text-sm truncate" title={p.title}>{p.title}</div>
                    </div>
                    <div className="font-bold text-[#FF4500] shrink-0">{p.sales}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </main>
    </div>
  )
}
