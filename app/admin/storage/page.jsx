import { redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { joinStoragePlan, cancelStoragePlan, adminActivateStorage, adminDeactivateStorage } from "./actions"
import ClientForm from "@/components/ClientForm"
import { CheckCircle2, HardDrive, AlertTriangle, Users } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function StorageAdminPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/admin/storage`)

  const svc = createServiceClient()
  const { data: profile } = await svc.from("profiles").select("role").eq("id", user.id).single()
  const isAdmin = profile?.role === "admin"

  if (isAdmin) {
    return <AdminStorageManager svc={svc} />
  }

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

async function AdminStorageManager({ svc }) {
  // Buscar todas as subscrições e juntar com info do criador (profiles)
  const { data: billings } = await svc
    .from("creator_storage_billing")
    .select("*, profiles(full_name, email)")
    .order("created_at", { ascending: false })

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <HardDrive className="text-[#FF4500]" /> Gestão de Storage (Admin)
        </h1>
        <p className="text-neutral-500 mt-2">
          Aprova ou suspende as subscrições de armazenamento dos teus criadores.
        </p>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="bg-neutral-50 border-b border-neutral-200">
            <tr>
              <th className="px-4 py-3 font-bold text-neutral-700">Criador</th>
              <th className="px-4 py-3 font-bold text-neutral-700">Data Pedido</th>
              <th className="px-4 py-3 font-bold text-neutral-700">Status</th>
              <th className="px-4 py-3 font-bold text-neutral-700 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {!billings?.length && (
              <tr><td colSpan="4" className="p-4 text-center text-neutral-500">Nenhum pedido de storage.</td></tr>
            )}
            {billings?.map(b => (
              <tr key={b.id} className="hover:bg-neutral-50/50">
                <td className="px-4 py-3">
                  <div className="font-bold">{b.profiles?.full_name || "Desconhecido"}</div>
                  <div className="text-xs text-neutral-500">{b.profiles?.email || b.user_id}</div>
                </td>
                <td className="px-4 py-3 text-neutral-600">
                  {new Date(b.created_at).toLocaleDateString('pt-PT')}
                </td>
                <td className="px-4 py-3">
                  <span className={`font-bold uppercase text-[10px] px-2 py-1 rounded-full ${
                    b.status === 'active' ? 'bg-green-100 text-green-700' :
                    b.status === 'pending' ? 'bg-orange-100 text-orange-700' :
                    'bg-red-100 text-red-700'
                  }`}>
                    {b.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  {b.status !== 'active' ? (
                    <ClientForm action={adminActivateStorage} successMessage="Conta ativada com sucesso!">
                      <input type="hidden" name="user_id" value={b.user_id} />
                      <button className="text-xs bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1.5 rounded transition">
                        Ativar Plano
                      </button>
                    </ClientForm>
                  ) : (
                    <ClientForm action={adminDeactivateStorage} successMessage="Conta suspensa com sucesso!">
                      <input type="hidden" name="user_id" value={b.user_id} />
                      <button className="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-bold px-3 py-1.5 rounded transition">
                        Suspender
                      </button>
                    </ClientForm>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
