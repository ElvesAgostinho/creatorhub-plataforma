import { redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"

import BarChartPremium from "@/components/charts/BarChartPremium"

export const dynamic = "force-dynamic"

export default async function AdminProducts() {
  const svc = createServiceClient()
  const { data: rows } = await svc
    .from("products")
    .select("id, slug, type, title, published, best_seller, students_count, price_cents")
    .order("created_at", { ascending: false })

  const fmt = n => (n ?? 0).toLocaleString("pt-PT")

  const totalProducts = rows?.length || 0;
  const activeProducts = rows?.filter(r => r.published)?.length || 0;
  
  // Calculate simulated revenue for the chart based on students count
  let totalRevenue = 0;
  const chartData = rows?.slice(0, 5).map(r => {
    const rev = (r.students_count || 0) * (r.price_cents / 100);
    totalRevenue += rev;
    return { name: r.title.length > 15 ? r.title.substring(0, 15) + '...' : r.title, value: rev }
  }) || [];

  return (
    <div className="bg-[#F9FAFB] min-h-screen text-neutral-900 pt-10 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-extrabold text-neutral-900">Painel de Criador</h1>
            <p className="text-neutral-500 mt-2 text-sm font-medium">Gere os teus cursos, mentorias e e-books com precisão analítica.</p>
          </div>
          <a href="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-neutral-200 hover:border-[#FF4500] hover:text-[#FF4500] text-sm font-semibold transition-all shadow-sm">
            Voltar à Biblioteca principal
          </a>
        </div>

        {/* KPI CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 relative overflow-hidden group shadow-sm">
            <p className="text-neutral-500 font-medium text-sm">Produtos Criados</p>
            <h3 className="text-4xl font-black mt-2 text-neutral-900">{totalProducts}</h3>
            <p className="text-xs text-[#0E7C86] mt-3 font-semibold">{activeProducts} publicados e ativos</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 relative overflow-hidden group shadow-sm">
            <p className="text-neutral-500 font-medium text-sm">Alunos Totais</p>
            <h3 className="text-4xl font-black mt-2 text-neutral-900">{rows?.reduce((acc, curr) => acc + (curr.students_count || 0), 0)}</h3>
            <p className="text-xs text-[#10B981] mt-3 font-semibold">Crescimento constante</p>
          </div>
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 relative overflow-hidden group shadow-sm">
            <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:opacity-[0.06] transition-opacity">
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#FF4500" strokeWidth="2"><path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
            </div>
            <p className="text-neutral-500 font-medium text-sm">Receita Estimada</p>
            <h3 className="text-4xl font-black mt-2 text-[#FF4500]">Kz {fmt(totalRevenue)}</h3>
            <p className="text-xs text-neutral-400 mt-3 font-semibold">Baseado no preço atual</p>
          </div>
        </div>

        {/* CHART SECTION & CREATE ACTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 shadow-sm">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-xl font-bold text-neutral-900">Receita por Produto (Top 5)</h2>
            </div>
            <BarChartPremium data={chartData.length > 0 ? chartData : undefined} />
          </div>

          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-gradient-to-br from-[#FF4500] to-[#E03E00] rounded-3xl p-8 text-white shadow-lg relative overflow-hidden h-full flex flex-col justify-between">
              <div className="absolute top-0 right-0 p-8 opacity-20">
                <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
              </div>
              <div>
                <h3 className="text-2xl font-black mb-2 relative z-10">Novo Produto</h3>
                <p className="text-white/80 text-sm relative z-10 font-medium">Expande o teu império digital. Cria cursos ou mentorias.</p>
              </div>
              <div className="relative z-10 mt-8">
                <a href="/admin/products/new" className="bg-white text-[#FF4500] hover:bg-neutral-100 font-bold py-4 px-6 rounded-xl transition-colors text-center shadow-lg block w-full">
                  + Iniciar Criação
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* PRODUCTS TABLE */}
        <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
          <div className="px-8 py-6 border-b border-neutral-100">
            <h2 className="text-xl font-bold text-neutral-900">Os teus Produtos</h2>
          </div>
          
          <div className="p-1 sm:p-4 space-y-8">
            {["course", "book", "mentorship", "event"].map(typeKey => {
              const typeRows = rows?.filter(r => r.type === typeKey) || []
              if (typeRows.length === 0) return null
              
              const typeLabels = {
                course: "🎓 Cursos",
                book: "📚 E-books / PDFs",
                mentorship: "🤝 Mentorias"
              }

              return (
                <div key={typeKey} className="bg-white rounded-2xl overflow-hidden border border-neutral-200 shadow-sm">
                  <div className="bg-neutral-50 px-6 py-4 border-b border-neutral-200">
                    <h3 className="font-bold text-neutral-900 text-base">{typeLabels[typeKey]} <span className="text-neutral-500 font-normal ml-2 text-sm">({typeRows.length})</span></h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="text-neutral-500 text-xs uppercase border-b border-neutral-100">
                        <tr>
                          <th className="text-left p-6 font-semibold">Título</th>
                          <th className="text-left p-6 font-semibold">Preço</th>
                          <th className="text-left p-6 font-semibold">Alunos</th>
                          <th className="text-left p-6 font-semibold">Estado</th>
                          <th className="p-6"></th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-neutral-100">
                        {typeRows.map(r => (
                          <tr key={r.id} className="hover:bg-neutral-50 transition-colors">
                            <td className="p-6 font-bold text-neutral-900 flex items-center gap-3">
                              {r.title}
                              {r.best_seller && <span className="text-[10px] bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full font-bold border border-yellow-200">BEST SELLER</span>}
                            </td>
                            <td className="p-6 text-neutral-600">Kz {fmt(Math.round(r.price_cents/100))}</td>
                            <td className="p-6 text-neutral-600 font-semibold">{r.students_count || 0}</td>
                            <td className="p-6">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${r.published ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-neutral-100 text-neutral-600 border border-neutral-200'}`}>
                                {r.published ? "Publicado" : "Rascunho"}
                              </span>
                            </td>
                            <td className="p-6 text-right">
                              <a href={`/admin/products/${r.id}`} className="inline-flex items-center justify-center bg-white border border-neutral-200 shadow-sm hover:bg-neutral-50 text-neutral-600 hover:text-[#FF4500] p-2 rounded-lg transition-colors" title="Editar Produto">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                              </a>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            })}
          </div>

          {(!rows || rows.length === 0) && (
            <div className="p-16 text-center text-neutral-500">
              Ainda não criaste nenhum produto. Utiliza o cartão em destaque acima para começar.
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
