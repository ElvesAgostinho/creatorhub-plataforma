import { redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { approveCreator, rejectCreator } from "./actions"

export const dynamic = "force-dynamic"

export default async function AdminCreators() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/admin/creators")

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (!profile || profile.role !== "admin") redirect("/admin")

  const svc = createServiceClient()
  
  // Fetch pending applications
  const { data: pending } = await svc
    .from("creator_applications")
    .select("*")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  // Fetch users info for the applications
  let emailById = {}
  let nameById = {}
  
  if (pending && pending.length > 0) {
    const userIds = [...new Set(pending.map(r => r.user_id))]
    
    // Auth users (for email)
    const { data: usersData } = await svc.auth.admin.listUsers({ page: 1, perPage: 1000 })
    emailById = Object.fromEntries((usersData?.users || []).map(u => [u.id, u.email]))
    
    // Profiles (for full name)
    const { data: profs } = await svc.from("profiles").select("id, full_name").in("id", userIds)
    nameById = Object.fromEntries((profs || []).map(p => [p.id, p.full_name]))
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-extrabold text-[#111]">Admin — Candidaturas de Criadores</h1>
      </div>

      <div className="mt-8 overflow-x-auto border border-neutral-200 rounded-2xl bg-white">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50 text-neutral-600 text-xs uppercase">
            <tr>
              <th className="text-left p-4">Data</th>
              <th className="text-left p-4">Utilizador</th>
              <th className="text-left p-4 max-w-sm">Biografia / Motivação</th>
              <th className="text-left p-4">Links</th>
              <th className="text-right p-4">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {(!pending || pending.length === 0) && (
              <tr><td colSpan={5} className="p-8 text-center text-neutral-500">Sem candidaturas pendentes.</td></tr>
            )}
            {pending?.map(r => (
              <tr key={r.id} className="align-top">
                <td className="p-4 whitespace-nowrap text-neutral-500">{new Date(r.created_at).toLocaleDateString("pt-PT")}</td>
                <td className="p-4">
                  <div className="font-bold">{nameById[r.user_id] || "—"}</div>
                  <div className="text-xs text-neutral-500">{emailById[r.user_id]}</div>
                </td>
                <td className="p-4 max-w-sm whitespace-pre-wrap text-neutral-700">
                  {r.bio}
                </td>
                <td className="p-4">
                  <div className="space-y-2">
                    {r.portfolio_url && (
                      <a href={r.portfolio_url} target="_blank" className="block text-[#0E7C86] hover:underline break-all">Portefólio ↗</a>
                    )}
                    {r.payment_proof_url && (
                      <a href={r.payment_proof_url} target="_blank" className="block text-green-600 font-bold hover:underline break-all">Ver Comprovativo 📄</a>
                    )}
                    {!r.portfolio_url && !r.payment_proof_url && "—"}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-col gap-2 items-end">
                    <form action={approveCreator}>
                      <input type="hidden" name="id" value={r.id} />
                      <input type="hidden" name="user_id" value={r.user_id} />
                      <button className="bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1.5 rounded text-xs w-24">
                        Aprovar
                      </button>
                    </form>
                    <form action={rejectCreator}>
                      <input type="hidden" name="id" value={r.id} />
                      <button className="border border-red-300 text-red-600 hover:bg-red-50 font-bold px-3 py-1.5 rounded text-xs w-24">
                        Rejeitar
                      </button>
                    </form>
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
