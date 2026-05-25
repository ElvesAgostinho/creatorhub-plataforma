import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { approveAffiliate, rejectAffiliate } from "./actions"
import { PremiumButton } from "@/components/PremiumForms"
import AffiliateFilter from "@/components/AffiliateFilter"
import { Suspense } from "react"

export const dynamic = "force-dynamic"

export default async function AdminAffiliates({ searchParams }) {
  const params = await searchParams;
  const statusFilter = params?.status || "all"
  const searchFilter = (params?.q || "").toLowerCase()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/admin/affiliates")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile || profile.role !== "admin") {
    redirect("/")
  }

  // Fetch applications
  let query = supabase
    .from("affiliate_applications")
    .select("*")
    .order("created_at", { ascending: false })

  if (statusFilter !== "all") {
    query = query.eq("status", statusFilter)
  }

  const { data: appsData, error: appsError } = await query

  let applications = appsData || []

  if (applications.length > 0) {
    const userIds = [...new Set(applications.map(app => app.user_id))]
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, full_name")
      .in("id", userIds)

    const nameById = Object.fromEntries((profs || []).map(p => [p.id, p.full_name]))
    
    applications = applications.map(app => ({
      ...app,
      profiles: { full_name: nameById[app.user_id] || "Sem Nome" }
    }))
  }

  // Apply name search filter in memory
  if (searchFilter) {
    applications = applications.filter(app => 
      app.profiles?.full_name?.toLowerCase().includes(searchFilter)
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-neutral-900 mb-2">Gestão de Afiliados</h1>
        <p className="text-neutral-500 font-medium">Aprova ou rejeita candidatos ao programa de afiliados.</p>
      </div>

      <Suspense fallback={<div className="h-12 bg-neutral-100 rounded-xl w-full mb-6 animate-pulse" />}>
        <AffiliateFilter />
      </Suspense>

      <div className="bg-white border border-neutral-200 rounded-3xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-neutral-500 text-xs uppercase tracking-wider border-b border-neutral-200">
                <th className="px-6 py-4 font-semibold">Candidato</th>
                <th className="px-6 py-4 font-semibold">Data</th>
                <th className="px-6 py-4 font-semibold">Motivação</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-sm">
              {applications?.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-6 py-8 text-center text-neutral-500">
                    Nenhuma candidatura encontrada.
                  </td>
                </tr>
              )}
              {applications?.map(app => (
                <tr key={app.id} className="hover:bg-neutral-50 transition">
                  <td className="px-6 py-4">
                    <div className="font-bold text-neutral-900">{app.profiles?.full_name || "Sem Nome"}</div>
                  </td>
                  <td className="px-6 py-4 text-neutral-500">
                    {new Date(app.created_at).toLocaleDateString("pt-PT")}
                  </td>
                  <td className="px-6 py-4 max-w-xs truncate text-neutral-600" title={app.application_text}>
                    {app.application_text}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-bold ${
                      app.status === 'approved' ? 'bg-green-100 text-green-800' :
                      app.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-orange-100 text-orange-800'
                    }`}>
                      {app.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {app.status === "pending" && (
                      <div className="flex justify-end gap-2">
                        <form action={approveAffiliate}>
                          <input type="hidden" name="id" value={app.id} />
                          <PremiumButton type="submit" variant="secondary" className="!px-3 !py-1.5 !text-xs !bg-green-50 !text-green-700 !border-green-200 hover:!bg-green-100">
                            Aprovar
                          </PremiumButton>
                        </form>
                        <form action={rejectAffiliate}>
                          <input type="hidden" name="id" value={app.id} />
                          <PremiumButton type="submit" variant="secondary" className="!px-3 !py-1.5 !text-xs !bg-red-50 !text-red-700 !border-red-200 hover:!bg-red-100">
                            Rejeitar
                          </PremiumButton>
                        </form>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
