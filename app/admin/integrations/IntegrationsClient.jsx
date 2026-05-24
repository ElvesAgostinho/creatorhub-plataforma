"use client"

import { useState } from "react"
import { saveIntegration } from "./actions"

const AVAILABLE_INTEGRATIONS = [
  { id: "n8n", name: "n8n", desc: "Automatiza processos complexos enviando webhooks para os teus workflows do n8n.", icon: "⚙️" },
  { id: "hubspot", name: "HubSpot", desc: "Sincroniza os teus novos alunos com o teu CRM automaticamente.", icon: "🔗" },
  { id: "mailchimp", name: "Mailchimp", desc: "Adiciona compradores à tua newsletter e sequências de email.", icon: "📧" },
  { id: "zapier", name: "Zapier", desc: "Conecta a plataforma a mais de 5000 apps via Webhooks.", icon: "⚡" },
]

export default function IntegrationsClient({ existingIntegrations }) {
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [urlInput, setUrlInput] = useState("")

  const getIntegrationData = (providerId) => {
    return existingIntegrations.find(i => i.provider === providerId) || { provider: providerId, webhook_url: "", is_active: false }
  }

  const handleEdit = (providerId) => {
    const data = getIntegrationData(providerId)
    setUrlInput(data.webhook_url || "")
    setEditing(providerId)
  }

  const handleSave = async (providerId, overrideActive = null) => {
    setLoading(true)
    const current = getIntegrationData(providerId)
    const newActive = overrideActive !== null ? overrideActive : current.is_active
    const res = await saveIntegration(providerId, editing === providerId ? urlInput : current.webhook_url, newActive)
    setLoading(false)
    if (res.ok) {
      if (editing === providerId) setEditing(null)
    } else {
      alert("Erro: " + res.error)
    }
  }

  const toggleActive = (providerId) => {
    const data = getIntegrationData(providerId)
    handleSave(providerId, !data.is_active)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {AVAILABLE_INTEGRATIONS.map(int => {
        const data = getIntegrationData(int.id)
        const isConnected = data.is_active && data.webhook_url
        const isEditingThis = editing === int.id

        return (
          <div key={int.id} className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm flex flex-col">
            <div className="flex items-center gap-4 mb-4">
              <div className="text-4xl">{int.icon}</div>
              <h3 className="font-extrabold text-xl">{int.name}</h3>
            </div>
            <p className="text-sm text-neutral-600 mb-6 flex-1">{int.desc}</p>
            
            {isEditingThis ? (
              <div className="mt-auto bg-neutral-50 p-4 rounded-xl border border-neutral-200">
                <label className="block text-xs font-bold text-neutral-700 mb-2">URL do Webhook</label>
                <input 
                  type="url" 
                  value={urlInput}
                  onChange={e => setUrlInput(e.target.value)}
                  placeholder="https://..."
                  className="w-full bg-white border border-neutral-300 rounded-lg px-3 py-2 text-sm mb-3 focus:outline-none focus:border-[#FF4500]"
                />
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handleSave(int.id)}
                    disabled={loading}
                    className="bg-[#FF4500] text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-[#e03d00]"
                  >
                    Guardar
                  </button>
                  <button 
                    onClick={() => setEditing(null)}
                    disabled={loading}
                    className="bg-neutral-200 text-neutral-700 text-xs font-bold px-4 py-2 rounded-lg hover:bg-neutral-300"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-neutral-300'}`}></div>
                  <span className="text-sm font-bold text-neutral-700">
                    {isConnected ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {data.webhook_url && (
                    <button 
                      onClick={() => toggleActive(int.id)}
                      disabled={loading}
                      className="text-xs font-bold text-neutral-500 hover:text-neutral-900"
                    >
                      {data.is_active ? 'Desativar' : 'Ativar'}
                    </button>
                  )}
                  <button 
                    onClick={() => handleEdit(int.id)}
                    className="text-sm font-bold text-[#FF4500] hover:underline"
                  >
                    Configurar
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
