import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

import IntegrationsClient from "./IntegrationsClient"

export const dynamic = "force-dynamic"

export default async function IntegrationsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/admin/integrations")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "admin" && profile?.role !== "creator") {
    redirect("/dashboard")
  }

  const { data: existingIntegrations } = await supabase
    .from("creator_integrations")
    .select("*")
    .eq("creator_id", user.id)

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F5]">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10">
        
        <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
          <h1 className="text-3xl font-extrabold text-[#111]">Admin — Integrações</h1>

        </div>

        <p className="text-neutral-500 mb-8 max-w-2xl">
          Automatiza o teu fluxo de trabalho ligando a ABOVE às ferramentas que já utilizas. Aumenta a eficiência configurando webhooks que disparam sempre que uma nova venda for aprovada.
        </p>

        <IntegrationsClient existingIntegrations={existingIntegrations || []} />

      </main>
    </div>
  )
}
