import { redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { approvePurchase, rejectPurchase } from "./actions"
import PieChartPremium from "@/components/charts/PieChartPremium"
import { Wallet, TrendingUp, ShoppingCart, Clock, CheckCircle2, XCircle, CreditCard, Users, Megaphone, Check, Search } from "lucide-react"

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

  // Stats
  const pendingCount = rows?.filter(r => r.status === "pending").length || 0;
  const activeCount = rows?.filter(r => r.status === "active").length || 0;
  const cancelledCount = rows?.filter(r => r.status === "cancelled").length || 0;
  
  // Global platform stats
  const totalGMV = rows?.reduce((acc, r) => r.status !== 'cancelled' ? acc + (r.amount_cents || 0) : acc, 0) || 0;

  // Status styling map
  const statusStyles = {
    pending: { label: "Pendente", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
    active: { label: "Aprovado", color: "bg-[#00A859]/10 text-[#00A859] border-[#00A859]/20", icon: CheckCircle2 },
    cancelled: { label: "Cancelado", color: "bg-red-50 text-red-700 border-red-200", icon: XCircle }
  }

  return (
    <div className="bg-[#F4F5F7] min-h-screen text-neutral-900 pb-20 font-sans">
      
      {/* HEADER / HERO AREA */}
      <div className="bg-white border-b border-neutral-200 pt-8 pb-12 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-8">
            <div>
              <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Painel Principal</h1>
              <p className="text-neutral-500 mt-1 text-sm font-medium">Visão global da plataforma e gestão financeira.</p>
            </div>
            <div className="flex gap-3">
              <a href="/admin/creators" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-sm font-bold transition-all shadow-sm">
                <Users size={16} />
                Criadores
              </a>
              <a href="/admin/affiliates" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-neutral-50 border border-neutral-200 hover:bg-neutral-100 text-neutral-700 text-sm font-bold transition-all shadow-sm">
                <Megaphone size={16} />
                Afiliados
              </a>
            </div>
          </div>

          {/* QUICK STATS */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* BIG BALANCE CARD */}
            <div className="md:col-span-2 bg-[#1A1C23] text-white rounded-2xl p-6 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#FF4500]/30 to-transparent blur-3xl rounded-full opacity-50 -translate-y-1/2 translate-x-1/2"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div>
                  <div className="flex items-center gap-2 text-neutral-400 font-semibold mb-1">
                    <Wallet size={16} />
                    <span>Saldo Total (GMV)</span>
                  </div>
                  <h3 className="text-4xl sm:text-5xl font-black tracking-tight">Kz {fmt(Math.round(totalGMV/100))}</h3>
                </div>
                <div className="mt-8 flex items-center gap-2 text-sm font-bold text-[#00A859] bg-[#00A859]/10 w-fit px-3 py-1.5 rounded-lg border border-[#00A859]/20">
                  <TrendingUp size={16} />
                  <span>Crescimento contínuo</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col justify-center shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-600">
                    <ShoppingCart size={20} />
                  </div>
                  <span className="text-xs font-bold bg-neutral-100 text-neutral-600 px-2 py-1 rounded">Vendas</span>
               </div>
               <p className="text-neutral-500 text-sm font-medium mb-1">Total de Pedidos</p>
               <h3 className="text-3xl font-black text-neutral-900">{rows?.length || 0}</h3>
            </div>

            <div className="bg-white border border-neutral-200 rounded-2xl p-6 flex flex-col justify-center shadow-sm">
               <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-500">
                    <Clock size={20} />
                  </div>
                  <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded">Ação Necessária</span>
               </div>
               <p className="text-neutral-500 text-sm font-medium mb-1">Aprovação Pendente</p>
               <h3 className="text-3xl font-black text-neutral-900">{pendingCount}</h3>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-8 mt-8">
        
        {/* TRANSACTIONS TABLE */}
        <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden">
          
          <div className="border-b border-neutral-200 flex overflow-x-auto custom-scrollbar">
            {["pending","active","cancelled"].map(s => (
              <a
                key={s}
                href={`/admin?status=${s}`}
                className={`relative px-8 py-5 text-sm font-bold transition-colors whitespace-nowrap flex items-center gap-2 ${status===s ? "text-[#FF4500]" : "text-neutral-500 hover:text-neutral-800"}`}
              >
                {s === "pending" && <Clock size={16} />}
                {s === "active" && <CheckCircle2 size={16} />}
                {s === "cancelled" && <XCircle size={16} />}
                {s === "pending" ? `Pendentes (${pendingCount})` : s === "active" ? `Concluídos (${activeCount})` : `Cancelados (${cancelledCount})`}
                
                {status === s && (
                  <div className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF4500]"></div>
                )}
              </a>
            ))}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-neutral-400 text-xs uppercase bg-[#F8F9FA] border-b border-neutral-200 tracking-wider font-semibold">
                <tr>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Data e Comprador</th>
                  <th className="px-6 py-4">Produto</th>
                  <th className="px-6 py-4">Valor Total</th>
                  <th className="px-6 py-4">Método de Pag.</th>
                  <th className="px-6 py-4 text-right">Ação</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {(!filteredRows || filteredRows.length === 0) && (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center">
                      <div className="w-16 h-16 bg-neutral-50 rounded-full flex items-center justify-center text-neutral-300 mx-auto mb-3">
                        <Search size={24} />
                      </div>
                      <p className="text-neutral-500 font-medium">Nenhuma transação {statusStyles[status]?.label?.toLowerCase() || status} encontrada.</p>
                    </td>
                  </tr>
                )}
                
                {filteredRows?.map(r => {
                  const style = statusStyles[r.status] || { label: "Desconhecido", color: "bg-neutral-100 text-neutral-500", icon: Clock }
                  const SIcon = style.icon
                  return (
                    <tr key={r.id} className="hover:bg-neutral-50 transition-colors align-middle group">
                      {/* STATUS */}
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-bold uppercase tracking-wider border ${style.color}`}>
                          <SIcon size={12} strokeWidth={3} />
                          {style.label}
                        </span>
                      </td>

                      {/* DATA & BUYER */}
                      <td className="px-6 py-4">
                        <div className="font-bold text-neutral-900">{nameById[r.user_id] || "Cliente"}</div>
                        <div className="text-[11px] font-semibold text-neutral-500 mt-1 uppercase tracking-wider">
                          {new Date(r.created_at).toLocaleString("pt-PT", { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* PRODUCT */}
                      <td className="px-6 py-4 max-w-[200px]">
                        <a href={`/product/${r.products?.slug}`} className="font-bold text-[#111827] hover:text-[#FF4500] hover:underline line-clamp-1 truncate" title={r.products?.title}>
                          {r.products?.title}
                        </a>
                        <div className="text-[11px] text-neutral-500 mt-1 bg-neutral-100 w-fit px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                          {r.products?.type}
                        </div>
                      </td>

                      {/* VALUE */}
                      <td className="px-6 py-4">
                        <div className="font-black text-neutral-900 text-base">{fmt(Math.round((r.amount_cents||0)/100))} <span className="text-xs text-neutral-500">{r.currency}</span></div>
                      </td>

                      {/* PAYMENT METHOD */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-neutral-700 font-bold text-[13px]">
                          <CreditCard size={14} className="text-neutral-400" />
                          {r.payment_method || "N/A"}
                        </div>
                        {r.payment_ref && (
                          <div className="text-[10px] font-mono text-neutral-500 mt-1 bg-neutral-100 px-1.5 py-0.5 rounded w-fit border border-neutral-200 truncate max-w-[120px]" title={r.payment_ref}>
                            Ref: {r.payment_ref}
                          </div>
                        )}
                      </td>

                      {/* ACTIONS */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          {r.status === "pending" && (
                            <>
                              <form action={approvePurchase}>
                                <input type="hidden" name="id" value={r.id} />
                                <button className="bg-[#00A859] hover:bg-[#008f4c] text-white text-xs font-bold px-3 py-2 rounded-lg transition-colors shadow-sm flex items-center gap-1.5">
                                  <Check size={14} strokeWidth={3} />
                                  Aprovar
                                </button>
                              </form>
                              <form action={rejectPurchase}>
                                <input type="hidden" name="id" value={r.id} />
                                <button className="bg-white border border-neutral-300 hover:bg-neutral-50 text-neutral-600 text-xs font-bold px-3 py-2 rounded-lg transition-colors flex items-center gap-1.5">
                                  <XCircle size={14} />
                                  Rejeitar
                                </button>
                              </form>
                            </>
                          )}
                          {r.status === "active" && (
                            <form action={rejectPurchase}>
                              <input type="hidden" name="id" value={r.id} />
                              <button className="bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold px-3 py-2 rounded-lg transition-colors">
                                Cancelar Venda
                              </button>
                            </form>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          
          {filteredRows.length > 0 && (
            <div className="border-t border-neutral-200 px-6 py-4 flex items-center justify-between text-xs text-neutral-500 font-medium bg-[#F8F9FA]">
              Mostrando {filteredRows.length} resultados para "{statusStyles[status]?.label || status}"
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
