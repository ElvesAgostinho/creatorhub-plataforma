import { redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { updateSettings } from "./actions"

export const dynamic = "force-dynamic"

export default async function AdminSettings() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/admin/settings")

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (!profile || profile.role !== "admin") redirect("/admin")

  const svc = createServiceClient()
  
  const { data: settings } = await svc
    .from("site_settings")
    .select("*")
    .eq("id", "default")
    .single()

  const cls = "mt-1 w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E7C86]"

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-extrabold">Admin — Definições Gerais</h1>
        <nav className="flex gap-2 text-sm">
          <a href="/admin" className="px-3 py-1.5 rounded-md border bg-white border-neutral-300 hover:bg-neutral-50">← Voltar</a>
        </nav>
      </div>

      <div className="mt-8 max-w-2xl border border-neutral-200 rounded-2xl p-6 bg-white shadow-sm">
        <form action={updateSettings} className="space-y-6">
          
          <div>
            <h2 className="font-bold text-lg border-b pb-2 mb-4">Admissão de Criadores</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Taxa de Inscrição (Kz)</label>
                <p className="text-xs text-neutral-500 mb-1">Custo único pago pelos novos candidatos a criador.</p>
                <input 
                  type="number" 
                  name="creator_fee_cents" 
                  defaultValue={Math.round((settings?.creator_fee_cents || 0) / 100)} 
                  className={cls} 
                />
              </div>

              <div>
                <label className="text-sm font-medium">Comissão do Criador (%)</label>
                <p className="text-xs text-neutral-500 mb-1">Qual a percentagem da venda que fica para o criador? (Ex: 70)</p>
                <input 
                  type="number" 
                  name="creator_commission_pct" 
                  defaultValue={settings?.creator_commission_pct || 70} 
                  className={cls} 
                  min="0" max="100"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Dados de Pagamento (IBAN)</label>
                <p className="text-xs text-neutral-500 mb-1">Para onde o candidato deve transferir a taxa?</p>
                <textarea 
                  name="bank_details" 
                  rows={3} 
                  defaultValue={settings?.bank_details || ""} 
                  className={cls} 
                />
              </div>
            </div>
          </div>

          <button type="submit" className="bg-[#0E7C86] hover:bg-[#0a626a] text-white font-bold py-2.5 px-6 rounded-md">
            Guardar Definições
          </button>
        </form>
      </div>
    </div>
  )
}
