import { redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function AffiliateDashboard() {
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

  return (
    <div className="pt-10 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
      
      {/* HEADER */}
      <div className="mb-12">
        <h1 className="text-4xl font-black text-neutral-900 tracking-tight">Dashboard de Afiliado</h1>
        <p className="text-neutral-500 mt-2 text-base font-medium">Bem-vindo(a), {profile?.full_name?.split(' ')[0]}. Acompanha o teu desempenho em tempo real.</p>
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

      {/* QUICK ACTIONS */}
      <div className="bg-white border border-neutral-100 rounded-3xl p-8 shadow-sm text-center">
        <h2 className="text-xl font-bold text-neutral-900 mb-4">Pronto para fazer mais vendas?</h2>
        <p className="text-neutral-500 mb-6 max-w-xl mx-auto">Pega nos teus links exclusivos ou descobre novos produtos no Mercado de Afiliação para promoveres para a tua audiência.</p>
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <a href="/affiliate-panel/my-links" className="px-6 py-3 bg-[#FF4500] hover:bg-[#E03E00] text-white font-bold rounded-xl transition-all shadow-md">
            Ver Meus Links
          </a>
          <a href="/marketplace/affiliates" className="px-6 py-3 bg-white border border-neutral-200 hover:border-[#FF4500] hover:text-[#FF4500] text-neutral-700 font-bold rounded-xl transition-all">
            Ir para o Mercado
          </a>
        </div>
      </div>

    </div>
  )
}
