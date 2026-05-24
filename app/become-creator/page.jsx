import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { submitApplication } from "./actions"
import BecomeCreatorForm from "@/components/BecomeCreatorForm"

export const dynamic = "force-dynamic"

export default async function BecomeCreatorPage({ searchParams }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/become-creator")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role === "admin" || profile?.role === "creator") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto mb-4 text-3xl">✓</div>
        <h1 className="text-2xl font-extrabold">Já és um Criador!</h1>
        <p className="text-neutral-600 mt-2">A tua conta já tem permissões para criar e gerir produtos.</p>
        <a href="/admin/products" className="inline-block mt-6 bg-[#0E7C86] hover:bg-[#0a626a] text-white font-bold px-6 py-2.5 rounded-md">
          Aceder à Área do Criador
        </a>
      </div>
    )
  }

  // Check if they already applied
  const { data: application } = await supabase
    .from("creator_applications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  if (application && application.status === "pending") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-yellow-100 text-yellow-600 flex items-center justify-center mx-auto mb-4 text-3xl">⏳</div>
        <h1 className="text-2xl font-extrabold">Candidatura em análise</h1>
        <p className="text-neutral-600 mt-2">
          Recebemos o teu pedido em {new Date(application.created_at).toLocaleDateString("pt-PT")}. A nossa equipa está a analisar o teu perfil.
          Serás notificado assim que houver uma decisão.
        </p>
        <a href="/dashboard" className="inline-block mt-6 border border-neutral-300 hover:bg-neutral-50 px-6 py-2.5 rounded-md font-bold">
          Voltar à Conta
        </a>
      </div>
    )
  }

  if (application && application.status === "rejected") {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto mb-4 text-3xl">✖</div>
        <h1 className="text-2xl font-extrabold">Candidatura não aceite</h1>
        <p className="text-neutral-600 mt-2">
          Infelizmente não pudemos aceitar a tua candidatura de momento. Podes tentar novamente no futuro.
        </p>
      </div>
    )
  }

  const { data: settings } = await supabase.from("site_settings").select("*").eq("id", "default").single()
  const fee = settings?.creator_fee_cents || 0
  const comm = settings?.creator_commission_pct || 70

  return (
    <div className="max-w-2xl mx-auto px-4 py-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-extrabold">Partilha o teu conhecimento</h1>
        <p className="text-neutral-600 mt-2">Torna-te um professor na plataforma e alcança milhares de alunos.</p>
      </div>

      {searchParams?.success && (
        <div className="bg-green-50 text-green-800 p-4 rounded-lg mb-6 text-sm border border-green-200">
          Candidatura submetida com sucesso! A nossa equipa irá avaliar.
        </div>
      )}

      {fee > 0 && !searchParams?.success && (
        <div className="bg-[#0E7C86]/10 border border-[#0E7C86]/20 p-5 rounded-xl mb-6">
          <h2 className="font-bold text-[#0E7C86] mb-2">Condições para Criadores</h2>
          <ul className="text-sm text-neutral-700 space-y-2 list-disc list-inside">
            <li>Taxa única de adesão: <strong>{(fee/100).toLocaleString("pt-PT")} Kz</strong>.</li>
            <li>Receberás <strong>{comm}%</strong> do valor de cada venda dos teus produtos.</li>
            <li>Transfere a taxa para o IBAN: <span className="font-mono bg-white px-2 py-0.5 rounded border border-neutral-200">{settings?.bank_details}</span></li>
          </ul>
        </div>
      )}

      <BecomeCreatorForm userEmail={user.email} fee={fee} />
    </div>
  )
}
