import { redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { approvePurchase, rejectPurchase } from "./actions"
import PieChartPremium from "@/components/charts/PieChartPremium"

export const dynamic = "force-dynamic"

export default async function AdminPage({ searchParams }) {
  const params = await searchParams
  const status = params?.status || "pending"

  // Service client: bypassa RLS para o admin ver tudo
  const svc = createServiceClient()
  const { data: rows } = await svc
    .from("purchases")
    .select("id, status, amount_cents, currency, payment_method, payment_ref, created_at, granted_at, user_id, product_id, products(title, slug, type)")
    .order("created_at", { ascending: false })

  const userIds = [...new Set((rows || []).map(r => r.user_id))]
  let emailById = {}
  let nameById = {}
  if (userIds.length) {
    const { data: users } = await svc.auth.admin.listUsers({ page: 1, perPage: 1000 })
    emailById = Object.fromEntries((users?.users || []).map(u => [u.id, u.email]))

    const { data: profs } = await svc.from("profiles").select("id, full_name").in("id", userIds)
    nameById = Object.fromEntries((profs || []).map(p => [p.id, p.full_name]))
  }

  const fmt = n => (n ?? 0).toLocaleString("pt-PT")

  // Filter rows based on status for the table
  const filteredRows = rows?.filter(r => r.status === status) || []

  // Stats for the pie chart
  const pendingCount = rows?.filter(r => r.status === "pending").length || 0;
  const activeCount = rows?.filter(r => r.status === "active").length || 0;
  const cancelledCount = rows?.filter(r => r.status === "cancelled").length || 0;
  
  const pieData = [
    { name: 'Ativos', value: activeCount > 0 ? activeCount : 40, color: '#10B981' },
    { name: 'Pendentes', value: pendingCount > 0 ? pendingCount : 15, color: '#F59E0B' },
    { name: 'Cancelados', value: cancelledCount > 0 ? cancelledCount : 5, color: '#EF4444' },
  ];

  // Global platform stats
  const totalGMV = rows?.reduce((acc, r) => r.status !== 'cancelled' ? acc + (r.amount_cents || 0) : acc, 0) || 0;

  return (
    <div className="bg-[#F9FAFB] min-h-screen text-neutral-900 pt-10 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-3xl font-extrabold text-neutral-900">Super Admin</h1>
            <p className="text-neutral-500 mt-2 text-sm">Visão global da plataforma, aprovações e métricas de desempenho.</p>
          </div>
          <a href="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-neutral-200 hover:border-[#FF4500] hover:text-[#FF4500] text-sm font-semibold transition-all shadow-sm">
            Voltar à Biblioteca
          </a>
        </div>

        {/* TOP CARDS & CHART */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-neutral-200 rounded-2xl p-8 relative overflow-hidden shadow-sm">
              <p className="text-neutral-500 font-medium text-sm">Volume Transacionado (GMV)</p>
              <h3 className="text-4xl font-black mt-2 text-[#FF4500]">Kz {fmt(Math.round(totalGMV/100))}</h3>
              <p className="text-xs text-[#10B981] mt-3 font-semibold">+ Crescimento sustentado</p>
            </div>
            
            <div className="bg-white border border-neutral-200 rounded-2xl p-8 relative overflow-hidden shadow-sm">
              <p className="text-neutral-500 font-medium text-sm">Total de Transações</p>
              <h3 className="text-4xl font-black mt-2 text-neutral-900">{rows?.length || 0}</h3>
              <div className="flex gap-4 mt-3">
                <p className="text-xs text-[#10B981] font-semibold">{activeCount} concl</p>
                <p className="text-xs text-[#F59E0B] font-semibold">{pendingCount} pend</p>
              </div>
            </div>
            
            <div className="lg:col-span-2 bg-white border border-neutral-200 rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between shadow-sm gap-6">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Pedidos de Afiliados e Criadores</h3>
                <p className="text-neutral-500 text-sm max-w-sm">Verifica se há novas submissões de parceiros que desejam entrar na plataforma.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="/admin/affiliates" className="bg-white hover:bg-neutral-50 text-neutral-700 text-sm font-bold px-6 py-2.5 rounded-lg transition text-center border border-neutral-200 shadow-sm">Gerir Afiliados</a>
                <a href="/admin/creators" className="bg-white hover:bg-neutral-50 text-neutral-700 text-sm font-bold px-6 py-2.5 rounded-lg transition text-center border border-neutral-200 shadow-sm">Gerir Criadores</a>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1 bg-white border border-neutral-200 rounded-2xl p-6 sm:p-8 shadow-sm flex flex-col items-center">
            <h2 className="text-lg font-bold text-neutral-900 self-start mb-6">Status de Vendas</h2>
            <PieChartPremium data={pieData} />
          </div>
        </div>
        
        {/* TRANSACTIONS TABLE */}
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-8 py-5 border-b border-neutral-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-neutral-900">Gestão de Compras</h2>
          </div>
          
          <div className="px-8 py-0 bg-white border-b border-neutral-200 flex gap-6 text-sm font-semibold">
            {["pending","active","cancelled"].map(s => (
              <a
                key={s}
                href={`/admin?status=${s}`}
                className={`pb-4 pt-4 px-1 transition-all border-b-2 ${status===s ? "text-[#FF4500] border-[#FF4500]" : "text-neutral-500 border-transparent hover:text-neutral-900"}`}
              >
                {s === "pending" ? `Pendentes (${pendingCount})` : s === "active" ? `Ativos (${activeCount})` : `Cancelados (${cancelledCount})`}
              </a>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-neutral-500 text-xs uppercase bg-neutral-50/50">
                <tr>
                  <th className="p-5 font-semibold border-b border-neutral-100">Data</th>
                  <th className="p-5 font-semibold border-b border-neutral-100">Comprador</th>
                  <th className="p-5 font-semibold border-b border-neutral-100">Produto</th>
                  <th className="p-5 font-semibold border-b border-neutral-100">Valor</th>
                  <th className="p-5 font-semibold border-b border-neutral-100">Método & Ref</th>
                  <th className="p-5 font-semibold border-b border-neutral-100 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {(!filteredRows || filteredRows.length === 0) && (
                  <tr><td colSpan={6} className="p-12 text-center text-neutral-400 font-medium bg-white">Nenhum registo encontrado.</td></tr>
                )}
                {filteredRows?.map(r => (
                  <tr key={r.id} className="hover:bg-neutral-50 transition-colors align-middle bg-white">
                    <td className="p-5 whitespace-nowrap text-neutral-500 font-medium">{new Date(r.created_at).toLocaleString("pt-PT")}</td>
                    <td className="p-5">
                      <div className="font-bold text-neutral-900">{nameById[r.user_id] || "—"}</div>
                      <div className="text-xs text-neutral-500 mt-0.5">{emailById[r.user_id] || r.user_id.slice(0,8)}</div>
                    </td>
                    <td className="p-5">
                      <a href={`/product/${r.products?.slug}`} className="font-bold text-neutral-800 hover:text-[#FF4500] hover:underline">{r.products?.title}</a>
                      <div className="text-xs text-neutral-500 mt-0.5 uppercase">{r.products?.type}</div>
                    </td>
                    <td className="p-5 font-bold text-neutral-900 whitespace-nowrap">{fmt(Math.round((r.amount_cents||0)/100))} {r.currency}</td>
                    <td className="p-5">
                      <div className="text-neutral-700 font-medium">{r.payment_method || "—"}</div>
                      <div className="text-xs text-neutral-500 break-all mt-0.5">{r.payment_ref || "Sem Ref"}</div>
                    </td>
                    <td className="p-5">
                      <div className="flex justify-end gap-2">
                        {r.status === "pending" && (
                          <>
                            <form action={approvePurchase}>
                              <input type="hidden" name="id" value={r.id} />
                              <button className="bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 text-xs font-bold px-3 py-1.5 rounded-md transition-colors">
                                Aprovar
                              </button>
                            </form>
                            <form action={rejectPurchase}>
                              <input type="hidden" name="id" value={r.id} />
                              <button className="bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 text-xs font-bold px-3 py-1.5 rounded-md transition-colors">
                                Rejeitar
                              </button>
                            </form>
                          </>
                        )}
                        {r.status === "active" && (
                          <form action={rejectPurchase}>
                            <input type="hidden" name="id" value={r.id} />
                            <button className="border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold px-3 py-1.5 rounded-md transition-colors">
                              Cancelar
                            </button>
                          </form>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
