import { redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { joinStoragePlan, cancelStoragePlan } from "./actions"
import ClientForm from "@/components/ClientForm"
import { CheckCircle2, HardDrive, AlertTriangle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function StorageAdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/admin/storage`)

  const svc = createServiceClient()
  
  // Get storage billing status
  const { data: billing } = await svc
    .from("creator_storage_billing")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  const isSubscribed = billing && (billing.status === 'active' || billing.status === 'pending')

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <HardDrive className="text-[#FF4500]" /> Alojamento de Vídeos
        </h1>
        <p className="text-neutral-500 mt-2">
          Gere a subscrição de alojamento interno para hospedares vídeos das aulas de forma segura e sem anúncios.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        
        {/* Plan Info */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-2">Plano Pro Storage</h2>
          <div className="text-4xl font-black text-[#111] mb-6">20.000 Kz<span className="text-sm font-medium text-neutral-500"> /mês</span></div>
          
          <ul className="space-y-4 mb-8">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-500 shrink-0" size={20} />
              <span className="text-neutral-700">Alojamento de vídeos sem limites de banda</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-500 shrink-0" size={20} />
              <span className="text-neutral-700">Player protegido contra downloads (HLS)</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-500 shrink-0" size={20} />
              <span className="text-neutral-700">Sem anúncios nem recomendações externas</span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="text-green-500 shrink-0" size={20} />
              <span className="text-neutral-700">Integração perfeita com a página de Checkout</span>
            </li>
          </ul>

          {!isSubscribed ? (
            <ClientForm action={joinStoragePlan} successMessage="Pedido de subscrição enviado!">
              <button type="submit" className="w-full bg-[#FF4500] hover:bg-[#E03E00] text-white font-bold py-3 rounded-xl transition">
                Aderir ao Plano
              </button>
            </ClientForm>
          ) : (
            <div className="p-4 bg-green-50 border border-green-200 rounded-xl text-green-800 font-medium flex items-center gap-2">
              <CheckCircle2 size={20} /> Plano {billing.status === 'pending' ? 'Pendente de Ativação' : 'Ativo'}
            </div>
          )}
        </div>

        {/* Current Status */}
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Estado da Conta</h3>
            
            {!billing ? (
              <div className="text-sm text-neutral-600">
                Ainda não subscreveste o serviço de alojamento pago. Os teus cursos devem utilizar fontes externas gratuitas como YouTube, Vimeo ou Google Drive.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Status</span>
                  <span className={`font-bold uppercase text-xs px-2 py-1 rounded ${
                    billing.status === 'active' ? 'bg-green-100 text-green-700' :
                    billing.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {billing.status}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Próximo Pagamento</span>
                  <span className="font-medium text-neutral-800">
                    {billing.next_billing_date ? new Date(billing.next_billing_date).toLocaleDateString('pt-PT') : '—'}
                  </span>
                </div>

                {billing.status === 'pending' && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800 flex gap-2">
                    <AlertTriangle className="shrink-0" size={18} />
                    A tua subscrição está pendente. Por favor, contacta o suporte para finalizar o pagamento.
                  </div>
                )}

                {isSubscribed && (
                  <ClientForm action={cancelStoragePlan} successMessage="Subscrição cancelada.">
                    <button type="submit" className="text-sm text-red-600 hover:underline mt-4">
                      Cancelar Subscrição
                    </button>
                  </ClientForm>
                )}
              </div>
            )}
          </div>

          <div className="bg-neutral-50 border border-neutral-200 rounded-2xl p-6">
            <h3 className="font-bold mb-2">Como funciona as opções Gratuitas?</h3>
            <p className="text-sm text-neutral-600 mb-2">
              Se não quiseres pagar a mensalidade, podes continuar a usar a plataforma de forma 100% gratuita!
            </p>
            <p className="text-sm text-neutral-600">
              Basta alojares os teus vídeos no <strong>Google Drive</strong> (não listado), <strong>YouTube</strong> (não listado) ou <strong>Vimeo</strong> e colar o link diretamente nas aulas ou vídeo promocional. O nosso sistema irá incorporar (embed) o vídeo automaticamente para os teus alunos!
            </p>
          </div>
        </div>

      </div>
    </div>
  )
}
