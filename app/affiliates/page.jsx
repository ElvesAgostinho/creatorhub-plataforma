import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { applyForAffiliate } from "./actions"
import Header from "@/components/Header"

export const dynamic = "force-dynamic"

export default async function AffiliatesLanding() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  let application = null
  if (user) {
    const { data } = await supabase
      .from("affiliate_applications")
      .select("*")
      .eq("user_id", user.id)
      .maybeSingle()
    application = data
  }

  // Se já estiver aprovado, manda direto para o Dashboard de Afiliado
  if (application?.status === "approved") {
    redirect("/affiliate-panel")
  }

  return (
    <div className="min-h-screen bg-[#F8F7F5] text-neutral-900 font-sans">
      
      <main className="flex-1 flex flex-col items-center justify-center p-4 mt-8">
        <div className="max-w-2xl w-full bg-white border border-neutral-200 rounded-3xl p-8 sm:p-12 shadow-sm text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-neutral-900 mb-4">
            Torna-te num Parceiro de Vendas
          </h1>
          <p className="text-lg text-neutral-500 mb-8">
            Ganha dinheiro promovendo os melhores infoprodutos da nossa plataforma. Comissões atrativas, pagamentos automáticos e tracking transparente.
          </p>

          {!user ? (
            <div className="bg-neutral-100 p-8 rounded-2xl">
              <h2 className="text-xl font-bold mb-2">Cria conta ou faz login para começar</h2>
              <p className="text-sm text-neutral-500 mb-6">Precisas de uma conta na plataforma para te tornares afiliado.</p>
              <a href="/login?next=/affiliates" className="bg-[#FF4500] hover:bg-[#e03d00] text-white font-bold py-3 px-8 rounded-xl transition inline-block">
                Criar Conta Grátis
              </a>
            </div>
          ) : application ? (
            <div className={`p-8 rounded-2xl ${application.status === 'pending' ? 'bg-orange-50 border border-orange-200' : 'bg-red-50 border border-red-200'}`}>
              <h2 className={`text-xl font-bold mb-2 ${application.status === 'pending' ? 'text-orange-800' : 'text-red-800'}`}>
                {application.status === 'pending' ? '⏳ Candidatura em Análise' : '❌ Candidatura Rejeitada'}
              </h2>
              <p className={`text-sm ${application.status === 'pending' ? 'text-orange-600' : 'text-red-600'}`}>
                {application.status === 'pending' 
                  ? 'A tua candidatura está a ser analisada pela nossa equipa. Receberás um email assim que fores aprovado.' 
                  : 'Infelizmente a tua candidatura não foi aceite neste momento.'}
              </p>
            </div>
          ) : (
            <form action={applyForAffiliate} className="text-left space-y-6 bg-neutral-50 p-6 rounded-2xl border border-neutral-200">
              <div>
                <label className="block text-sm font-bold text-neutral-800 mb-2">Porquê que queres ser nosso afiliado?</label>
                <textarea 
                  name="application_text" 
                  rows={4} 
                  required
                  placeholder="Conta-nos um pouco sobre a tua audiência, como planeias divulgar os produtos e quais as tuas estratégias..."
                  className="w-full border border-neutral-300 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#FF4500] outline-none transition"
                ></textarea>
              </div>
              <button type="submit" className="w-full bg-[#FF4500] hover:bg-[#e03d00] text-white font-bold py-3 px-8 rounded-xl transition">
                Enviar Candidatura
              </button>
            </form>
          )}

          <div className="mt-12 grid grid-cols-3 gap-6 text-left">
            <div>
              <div className="text-2xl mb-2">💰</div>
              <h3 className="font-bold text-neutral-900">Altas Comissões</h3>
              <p className="text-xs text-neutral-500 mt-1">Ganha até 80% do valor de cada venda gerada pelo teu link.</p>
            </div>
            <div>
              <div className="text-2xl mb-2">🔗</div>
              <h3 className="font-bold text-neutral-900">Links Únicos</h3>
              <p className="text-xs text-neutral-500 mt-1">Tracking perfeito para garantir que recebes sempre as tuas comissões.</p>
            </div>
            <div>
              <div className="text-2xl mb-2">⚡️</div>
              <h3 className="font-bold text-neutral-900">Saques Rápidos</h3>
              <p className="text-xs text-neutral-500 mt-1">Transfere as tuas comissões diretamente para a tua conta bancária.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
