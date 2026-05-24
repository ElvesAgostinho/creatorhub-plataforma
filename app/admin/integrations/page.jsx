import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AdminNav from "@/components/AdminNav"

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

  const integrations = [
    { name: "HubSpot", desc: "Sincroniza os teus novos alunos com o teu CRM automaticamente.", status: "Desconectado", icon: "🔗" },
    { name: "Mailchimp", desc: "Adiciona compradores à tua newsletter e sequências de email.", status: "Desconectado", icon: "📧" },
    { name: "Zapier", desc: "Conecta a plataforma a mais de 5000 apps via Webhooks.", status: "Conectado", icon: "⚡" },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#F8F7F5]">
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-10">
        
        <div className="flex items-center justify-between flex-wrap gap-3 mb-8">
          <h1 className="text-3xl font-extrabold text-[#111]">Admin — Integrações</h1>
          <AdminNav />
        </div>

        <p className="text-neutral-500 mb-8 max-w-2xl">
          Automatiza o teu fluxo de trabalho ligando a ABOVE às ferramentas que já utilizas. Aumenta a eficiência do teu marketing e suporte.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {integrations.map(int => (
            <div key={int.name} className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm flex flex-col">
              <div className="text-4xl mb-4">{int.icon}</div>
              <h3 className="font-extrabold text-xl mb-2">{int.name}</h3>
              <p className="text-sm text-neutral-600 mb-6 flex-1">{int.desc}</p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className={`text-xs font-bold px-2 py-1 rounded ${int.status === 'Conectado' ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-500'}`}>
                  {int.status}
                </span>
                <button className="text-sm font-bold text-[#FF4500] hover:underline">
                  {int.status === 'Conectado' ? 'Gerir' : 'Conectar'}
                </button>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  )
}
