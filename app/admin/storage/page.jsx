import { redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import {
  joinStoragePlan, cancelStoragePlan,
  adminActivateStorage, adminDeactivateStorage,
  adminBlockUserStorage, adminUnblockUserStorage,
  adminToggleVideoUpload, adminTogglePhotoUpload
} from "./actions"
import ClientForm from "@/components/ClientForm"
import { CheckCircle2, HardDrive, AlertTriangle, Video, Image, ToggleLeft, ToggleRight, ShieldOff, ShieldCheck, Ban } from "lucide-react"

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

  // Creator view — check billing status
  const { data: billing } = await svc
    .from("creator_storage_billing")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  const isSubscribed = billing && (billing.status === "active" || billing.status === "pending")
  const isBlocked = billing?.storage_blocked === true

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <HardDrive className="text-[#FF4500]" /> Alojamento de Vídeos e Imagens
        </h1>
        <p className="text-neutral-500 mt-2">
          Gere a subscrição de armazenamento interno para hospedares vídeos e imagens das aulas de forma segura e sem anúncios.
        </p>
      </div>

      {isBlocked && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-5 text-red-800">
          <Ban size={22} className="shrink-0" />
          <div>
            <div className="font-bold">Conta de Storage Bloqueada</div>
            <div className="text-sm mt-1">O acesso ao armazenamento foi suspenso pelo administrador. Contacta o suporte para mais informações.</div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-2 gap-8">
        {/* Plan Info */}
        <div className="bg-white border border-neutral-200 rounded-2xl p-8 shadow-sm">
          <h2 className="text-xl font-bold mb-2">Plano Pro Storage</h2>
          <div className="text-4xl font-black text-[#111] mb-6">20.000 Kz<span className="text-sm font-medium text-neutral-500"> /mês</span></div>

          <ul className="space-y-4 mb-8">
            {[
              { icon: "🎬", text: "Upload de vídeos das aulas (sem limites de banda)" },
              { icon: "🖼", text: "Upload de imagens e capas dos produtos" },
              { icon: "🔒", text: "Player protegido contra downloads (HLS)" },
              { icon: "✨", text: "Sem anúncios nem recomendações externas" },
              { icon: "🔗", text: "Integração perfeita com Checkout e Player" },
            ].map(({ icon, text }) => (
              <li key={text} className="flex items-start gap-3">
                <span className="text-lg">{icon}</span>
                <span className="text-neutral-700 text-sm">{text}</span>
              </li>
            ))}
          </ul>

          {!isSubscribed ? (
            <ClientForm action={joinStoragePlan} successMessage="Pedido de subscrição enviado! Aguarda a ativação pelo admin.">
              <button type="submit" className="w-full bg-[#FF4500] hover:bg-[#E03E00] text-white font-bold py-3 rounded-xl transition">
                Aderir ao Plano Pro Storage
              </button>
            </ClientForm>
          ) : (
            <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-2 ${isBlocked ? "bg-red-50 border border-red-200 text-red-800" : "bg-green-50 border border-green-200 text-green-800"}`}>
              {isBlocked ? <Ban size={18} /> : <CheckCircle2 size={18} />}
              {isBlocked ? "Conta Bloqueada pelo Admin" : billing.status === "pending" ? "Pendente de Ativação" : "Plano Ativo"}
            </div>
          )}
        </div>

        {/* Current Status */}
        <div className="space-y-6">
          <div className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
            <h3 className="font-bold text-lg mb-4">Estado da Conta</h3>
            {!billing ? (
              <div className="text-sm text-neutral-600">
                Ainda não subscreveste o serviço de alojamento pago. Os teus cursos devem utilizar fontes externas gratuitas.
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Status</span>
                  <span className={`font-bold uppercase text-xs px-2 py-1 rounded ${
                    isBlocked ? "bg-red-100 text-red-700" :
                    billing.status === "active" ? "bg-green-100 text-green-700" :
                    billing.status === "pending" ? "bg-orange-100 text-orange-700" :
                    "bg-red-100 text-red-700"
                  }`}>
                    {isBlocked ? "Bloqueado" : billing.status}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-neutral-100">
                  <span className="text-neutral-500">Próximo Pagamento</span>
                  <span className="font-medium text-neutral-800">
                    {billing.next_billing_date ? new Date(billing.next_billing_date).toLocaleDateString("pt-PT") : "—"}
                  </span>
                </div>

                {billing.status === "pending" && (
                  <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg text-sm text-orange-800 flex gap-2">
                    <AlertTriangle className="shrink-0" size={18} />
                    A tua subscrição está pendente. Por favor, contacta o suporte para finalizar o pagamento.
                  </div>
                )}

                {isSubscribed && !isBlocked && (
                  <ClientForm action={cancelStoragePlan} successMessage="Subscrição cancelada.">
                    <button type="submit" className="text-sm text-red-600 hover:underline mt-4">
                      Cancelar Subscrição
                    </button>
                  </ClientForm>
                )}
              </div>
            )}
          </div>

          {/* Free alternatives info */}
          <div className="bg-gradient-to-br from-[#0E7C86]/5 to-[#0E7C86]/10 border border-[#0E7C86]/20 rounded-2xl p-6">
            <h3 className="font-bold mb-3 flex items-center gap-2">
              🆓 Opções Gratuitas (Sem Custo)
            </h3>
            <p className="text-sm text-neutral-600 mb-3">
              Sem subscrição, podes usar links externos gratuitamente — o sistema incorpora automaticamente:
            </p>
            <div className="space-y-2">
              {[
                { src: "▶", label: "YouTube", desc: "Vídeos públicos ou não listados" },
                { src: "▶", label: "Vimeo", desc: "Vídeos com privacidade controlada" },
                { src: "📁", label: "Google Drive", desc: "Vídeos e imagens partilhadas" },
                { src: "🔗", label: "Link Direto (MP4)", desc: "Qualquer URL de vídeo/imagem público" },
              ].map(({ src, label, desc }) => (
                <div key={label} className="flex items-center gap-3 text-sm">
                  <span className="text-base w-5">{src}</span>
                  <span className="font-semibold text-neutral-800 w-28">{label}</span>
                  <span className="text-neutral-500">{desc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Admin View ───────────────────────────────────────────────────────────────

async function AdminStorageManager({ svc }) {
  const { data: users } = await svc
    .from("profiles")
    .select(`
      id,
      full_name,
      email,
      creator_storage_billing (
        status,
        storage_blocked,
        created_at
      )
    `)
    .in("role", ["creator", "admin"])
    .order("created_at", { ascending: false })

  // Load platform settings
  const { data: settingsRows } = await svc
    .from("platform_settings")
    .select("key, value")

  const settings = {}
  for (const row of settingsRows || []) {
    settings[row.key] = row.value === "true"
  }
  const videoEnabled = settings.upload_video_enabled !== false
  const photoEnabled = settings.upload_photo_enabled !== false

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 space-y-10">
      <div>
        <h1 className="text-2xl font-extrabold flex items-center gap-2">
          <HardDrive className="text-[#FF4500]" /> Gestão de Storage (Superadmin)
        </h1>
        <p className="text-neutral-500 mt-2">
          Controla o acesso ao armazenamento interno e gere as subscrições dos criadores individualmente.
        </p>
      </div>

      {/* ── Global Upload Toggles ── */}
      <section className="bg-white border border-neutral-200 rounded-2xl p-6 shadow-sm">
        <h2 className="font-bold text-lg mb-1 flex items-center gap-2">
          🛠 Controlos Globais de Upload
        </h2>
        <p className="text-sm text-neutral-500 mb-6">
          Ativa ou desativa o upload para <strong>todos os criadores pagos</strong> da plataforma.
        </p>

        <div className="grid sm:grid-cols-2 gap-4">
          {/* Video Toggle */}
          <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${videoEnabled ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${videoEnabled ? "bg-green-100" : "bg-red-100"}`}>
                <Video className={videoEnabled ? "text-green-600" : "text-red-500"} size={20} />
              </div>
              <div>
                <div className="font-bold text-sm text-neutral-800">Upload de Vídeos</div>
                <div className={`text-xs font-medium ${videoEnabled ? "text-green-600" : "text-red-500"}`}>
                  {videoEnabled ? "✓ Ativo para criadores pagos" : "✗ Desativado globalmente"}
                </div>
              </div>
            </div>
            <ClientForm
              action={adminToggleVideoUpload}
              successMessage={videoEnabled ? "Upload de vídeos desativado!" : "Upload de vídeos ativado!"}
            >
              <input type="hidden" name="enabled" value={String(!videoEnabled)} />
              <button
                type="submit"
                className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition ${
                  videoEnabled
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                {videoEnabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                {videoEnabled ? "Desativar" : "Ativar"}
              </button>
            </ClientForm>
          </div>

          {/* Photo Toggle */}
          <div className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all ${photoEnabled ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${photoEnabled ? "bg-green-100" : "bg-red-100"}`}>
                <Image className={photoEnabled ? "text-green-600" : "text-red-500"} size={20} />
              </div>
              <div>
                <div className="font-bold text-sm text-neutral-800">Upload de Fotografias</div>
                <div className={`text-xs font-medium ${photoEnabled ? "text-green-600" : "text-red-500"}`}>
                  {photoEnabled ? "✓ Ativo para criadores pagos" : "✗ Desativado globalmente"}
                </div>
              </div>
            </div>
            <ClientForm
              action={adminTogglePhotoUpload}
              successMessage={photoEnabled ? "Upload de fotos desativado!" : "Upload de fotos ativado!"}
            >
              <input type="hidden" name="enabled" value={String(!photoEnabled)} />
              <button
                type="submit"
                className={`flex items-center gap-2 text-sm font-bold px-4 py-2 rounded-xl transition ${
                  photoEnabled
                    ? "bg-red-100 text-red-700 hover:bg-red-200"
                    : "bg-green-100 text-green-700 hover:bg-green-200"
                }`}
              >
                {photoEnabled ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                {photoEnabled ? "Desativar" : "Ativar"}
              </button>
            </ClientForm>
          </div>
        </div>
      </section>

      {/* ── Subscriptions Table ── */}
      <section>
        <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
          <CheckCircle2 size={20} className="text-[#0E7C86]" /> Subscrições dos Criadores
        </h2>
        <div className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 border-b border-neutral-200">
              <tr>
                <th className="px-4 py-3 font-bold text-neutral-700">Criador</th>
                <th className="px-4 py-3 font-bold text-neutral-700">Data Pedido</th>
                <th className="px-4 py-3 font-bold text-neutral-700">Status</th>
                <th className="px-4 py-3 font-bold text-neutral-700">Bloqueado</th>
                <th className="px-4 py-3 font-bold text-neutral-700 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {!users?.length && (
                <tr><td colSpan="5" className="p-4 text-center text-neutral-500">Nenhum criador encontrado.</td></tr>
              )}
              {users?.map(u => {
                const billing = Array.isArray(u.creator_storage_billing) ? u.creator_storage_billing[0] : u.creator_storage_billing;
                const status = billing?.status || "Inativo";
                const isBlocked = billing?.storage_blocked || false;
                
                return (
                <tr key={u.id} className="hover:bg-neutral-50/50">
                  <td className="px-4 py-3">
                    <div className="font-bold">{u.full_name || "Desconhecido"}</div>
                    <div className="text-xs text-neutral-500">{u.email || u.id}</div>
                  </td>
                  <td className="px-4 py-3 text-neutral-600">
                    {billing?.created_at ? new Date(billing.created_at).toLocaleDateString("pt-PT") : "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-bold uppercase text-[10px] px-2 py-1 rounded-full ${
                      status === "active" ? "bg-green-100 text-green-700" :
                      status === "pending" ? "bg-orange-100 text-orange-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {isBlocked ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-red-100 text-red-700">
                        <Ban size={10} /> Bloqueado
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded-full bg-neutral-100 text-neutral-500">
                        Livre
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2 flex-wrap">
                      {/* Activate / Deactivate */}
                      {status !== "active" ? (
                        <ClientForm action={adminActivateStorage} successMessage="Conta ativada!">
                          <input type="hidden" name="user_id" value={u.id} />
                          <button className="text-xs bg-green-600 hover:bg-green-700 text-white font-bold px-3 py-1.5 rounded transition flex items-center gap-1">
                            <ShieldCheck size={12} /> Ativar
                          </button>
                        </ClientForm>
                      ) : (
                        <ClientForm action={adminDeactivateStorage} successMessage="Conta suspensa!">
                          <input type="hidden" name="user_id" value={u.id} />
                          <button className="text-xs bg-orange-100 hover:bg-orange-200 text-orange-700 font-bold px-3 py-1.5 rounded transition">
                            Suspender
                          </button>
                        </ClientForm>
                      )}

                      {/* Block / Unblock */}
                      {isBlocked ? (
                        <ClientForm action={adminUnblockUserStorage} successMessage="Upload desbloqueado!">
                          <input type="hidden" name="user_id" value={u.id} />
                          <button className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-700 font-bold px-3 py-1.5 rounded transition flex items-center gap-1">
                            <ShieldCheck size={12} /> Desbloquear
                          </button>
                        </ClientForm>
                      ) : (
                        <ClientForm action={adminBlockUserStorage} successMessage="Upload bloqueado individualmente!">
                          <input type="hidden" name="user_id" value={u.id} />
                          <button className="text-xs bg-red-100 hover:bg-red-200 text-red-700 font-bold px-3 py-1.5 rounded transition flex items-center gap-1">
                            <ShieldOff size={12} /> Bloquear
                          </button>
                        </ClientForm>
                      )}
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}
