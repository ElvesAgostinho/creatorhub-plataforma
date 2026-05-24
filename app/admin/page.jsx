import { redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { approvePurchase, rejectPurchase } from "./actions"

export const dynamic = "force-dynamic"

export default async function AdminPage({ searchParams }) {
  const params = await searchParams
  const status = params?.status || "pending"

  // Service client: bypassa RLS para o admin ver tudo (RLS também permite, mas garantimos).
  const svc = createServiceClient()
  const { data: rows } = await svc
    .from("purchases")
    .select("id, status, amount_cents, currency, payment_method, payment_ref, created_at, granted_at, user_id, product_id, products(title, slug, type)")
    .eq("status", status)
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

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900">Compras</h1>
          <p className="text-sm text-neutral-500 mt-1">Acompanha e gere todas as transações da plataforma.</p>
        </div>
      </div>
      
      <div className="flex gap-1 text-sm items-center border-b border-neutral-200 pb-4 mb-6">
        <span className="font-bold mr-3 text-neutral-500">Filtrar:</span>
        {["pending","active","cancelled"].map(s => (
          <a
            key={s}
            href={`/admin?status=${s}`}
            className={`px-4 py-2 font-semibold transition-colors border-b-2 -mb-[17px] ${status===s ? "text-[#FF4500] border-[#FF4500]" : "text-neutral-500 border-transparent hover:text-black"}`}
          >
            {s === "pending" ? "Pendentes" : s === "active" ? "Ativos" : "Cancelados"}
          </a>
        ))}
      </div>

      <div className="mt-6 overflow-x-auto border border-neutral-200 rounded-2xl bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600 text-xs uppercase">
            <tr>
              <th className="text-left p-3">Data</th>
              <th className="text-left p-3">Comprador</th>
              <th className="text-left p-3">Produto</th>
              <th className="text-left p-3">Valor</th>
              <th className="text-left p-3">Método</th>
              <th className="text-left p-3">Referência</th>
              <th className="text-right p-3">Ações</th>
            </tr>
          </thead>
          <tbody>
            {(!rows || rows.length === 0) && (
              <tr><td colSpan={7} className="p-6 text-center text-neutral-500">Sem registos.</td></tr>
            )}
            {rows?.map(r => (
              <tr key={r.id} className="border-t border-neutral-100 align-top">
                <td className="p-3 whitespace-nowrap">{new Date(r.created_at).toLocaleString("pt-PT")}</td>
                <td className="p-3">
                  <div className="font-medium">{nameById[r.user_id] || "—"}</div>
                  <div className="text-xs text-neutral-500">{emailById[r.user_id] || r.user_id.slice(0,8)}</div>
                </td>
                <td className="p-3">
                  <a href={`/product/${r.products?.slug}`} className="font-medium hover:underline">{r.products?.title}</a>
                  <div className="text-xs text-neutral-500">{r.products?.type}</div>
                </td>
                <td className="p-3 whitespace-nowrap">{fmt(Math.round((r.amount_cents||0)/100))} {r.currency}</td>
                <td className="p-3 text-xs">{r.payment_method || "—"}</td>
                <td className="p-3 text-xs break-all">{r.payment_ref || "—"}</td>
                <td className="p-3">
                  <div className="flex justify-end gap-2">
                    {r.status === "pending" && (
                      <>
                        <form action={approvePurchase}>
                          <input type="hidden" name="id" value={r.id} />
                          <button className="bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3 py-1.5 rounded">
                            Aprovar
                          </button>
                        </form>
                        <form action={rejectPurchase}>
                          <input type="hidden" name="id" value={r.id} />
                          <button className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-3 py-1.5 rounded">
                            Rejeitar
                          </button>
                        </form>
                      </>
                    )}
                    {r.status === "active" && (
                      <form action={rejectPurchase}>
                        <input type="hidden" name="id" value={r.id} />
                        <button className="border border-red-600 text-red-700 hover:bg-red-50 text-xs font-bold px-3 py-1.5 rounded">
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
  )
}
