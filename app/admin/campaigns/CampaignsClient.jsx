"use client"

import { useState } from "react"
import { addHeroHighlight, toggleHeroHighlight, removeHeroHighlight, sendEmailCampaign } from "./actions"
import { Megaphone, Star, Loader2, Plus, Trash2, Send } from "lucide-react"

export default function CampaignsClient({ highlights, campaigns, products }) {
  const [activeTab, setActiveTab] = useState("hero")
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState("")

  async function handleAddHighlight(e) {
    e.preventDefault()
    setLoading(true)
    setMsg("")
    const formData = new FormData(e.target)
    const res = await addHeroHighlight(formData)
    if (res.error) setMsg("Erro: " + res.error)
    else {
      setMsg("Destaque adicionado com sucesso!")
      e.target.reset()
    }
    setLoading(false)
  }

  async function handleSendEmail(e) {
    e.preventDefault()
    if (!confirm("Tens a certeza que queres enviar este e-mail para todos os alunos?")) return

    setLoading(true)
    setMsg("A enviar e-mails em massa... Por favor, não feches a página.")
    const formData = new FormData(e.target)
    const res = await sendEmailCampaign(formData)
    
    if (res.error) {
      setMsg("Erro no envio: " + res.error)
    } else {
      setMsg(`Sucesso! E-mail enviado para ${res.count} alunos.`)
      e.target.reset()
    }
    setLoading(false)
  }

  return (
    <div>
      {/* TABS */}
      <div className="flex items-center gap-4 border-b border-neutral-200 mb-8">
        <button 
          onClick={() => setActiveTab("hero")}
          className={`pb-4 px-2 font-bold text-lg border-b-2 transition-colors ${activeTab === "hero" ? "border-[#FF4500] text-[#FF4500]" : "border-transparent text-neutral-400 hover:text-neutral-700"}`}
        >
          <div className="flex items-center gap-2"><Star size={20} /> Destaques no Hero</div>
        </button>
        <button 
          onClick={() => setActiveTab("email")}
          className={`pb-4 px-2 font-bold text-lg border-b-2 transition-colors ${activeTab === "email" ? "border-[#FF4500] text-[#FF4500]" : "border-transparent text-neutral-400 hover:text-neutral-700"}`}
        >
          <div className="flex items-center gap-2"><Megaphone size={20} /> Disparos de E-mail</div>
        </button>
      </div>

      {msg && (
        <div className="mb-8 p-4 rounded-xl bg-[#FFF0EB] text-[#FF4500] font-bold text-center border border-[#FF4500]/20">
          {msg}
        </div>
      )}

      {/* TAB: HERO */}
      {activeTab === "hero" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Formulário */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
              <h3 className="font-bold text-xl mb-6 flex items-center gap-2">Adicionar Destaque</h3>
              <form onSubmit={handleAddHighlight} className="space-y-4">
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">Produto</label>
                  <select name="product_id" required className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 font-medium outline-none focus:border-[#FF4500] transition">
                    <option value="">Selecione um produto...</option>
                    {products.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">Peso de Prioridade (1 a 10)</label>
                  <input type="number" name="weight" min="1" max="10" defaultValue="1" required className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 font-medium outline-none focus:border-[#FF4500] transition" />
                  <p className="text-xs text-neutral-500 mt-2">Maior peso aparece primeiro no carrosel.</p>
                </div>
                <div>
                  <label className="block text-sm font-bold text-neutral-700 mb-2">Limite de Visualizações (Opcional)</label>
                  <input type="number" name="limit" min="1" placeholder="Ex: 5000" className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 font-medium outline-none focus:border-[#FF4500] transition" />
                  <p className="text-xs text-neutral-500 mt-2">Deixa em branco para mostrar sempre.</p>
                </div>
                <button disabled={loading} className="w-full bg-[#FF4500] hover:bg-[#E03E00] text-white font-bold py-3.5 rounded-xl transition flex justify-center items-center gap-2">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : <><Plus size={20} /> Adicionar ao Hero</>}
                </button>
              </form>
            </div>
          </div>

          {/* Lista de Destaques */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
                <h3 className="font-bold text-xl">Destaques Ativos</h3>
              </div>
              
              {highlights.length === 0 ? (
                <div className="p-12 text-center text-neutral-400 font-medium">Nenhum produto destacado.</div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {highlights.map(h => (
                    <div key={h.id} className="p-4 sm:p-6 flex items-center justify-between hover:bg-neutral-50 transition">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-12 bg-neutral-200 rounded-lg overflow-hidden relative shrink-0">
                          {h.products?.image_url && <img src={h.products.image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />}
                        </div>
                        <div>
                          <h4 className="font-bold text-neutral-900">{h.products?.title}</h4>
                          <div className="text-xs font-bold text-neutral-500 mt-1 flex gap-3">
                            <span>Peso: <span className="text-[#FF4500]">{h.priority_weight}</span></span>
                            {h.impressions_limit && <span>Vistas: {h.impressions_count} / {h.impressions_limit}</span>}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleHeroHighlight(h.id, !h.is_active)}
                          className={`px-4 py-2 rounded-lg font-bold text-sm transition ${h.is_active ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'}`}
                        >
                          {h.is_active ? 'ON' : 'OFF'}
                        </button>
                        <button 
                          onClick={() => { if(confirm("Remover destaque?")) removeHeroHighlight(h.id) }}
                          className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB: E-MAILS */}
      {activeTab === "email" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-3xl border border-neutral-100 shadow-sm">
            <h3 className="font-bold text-xl mb-2 flex items-center gap-2">Novo Disparo (Broadcast)</h3>
            <p className="text-neutral-500 text-sm mb-6">Envia um e-mail para todos os alunos da plataforma.</p>
            
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Público-Alvo</label>
                <select name="audience" required className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 font-medium outline-none focus:border-[#FF4500] transition">
                  <option value="todos">Todos os utilizadores (Inscritos)</option>
                  <option value="compradores">Apenas alunos (Já compraram algo)</option>
                  <option value="sem_compras">Apenas contas (Ainda não compraram)</option>
                  <option value="criadores">Apenas Criadores (Afiliados/Autores)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Título Interno (apenas para ti)</label>
                <input type="text" name="title" required placeholder="Ex: Lançamento Curso Python" className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 font-medium outline-none focus:border-[#FF4500] transition" />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Assunto do E-mail</label>
                <input type="text" name="subject" required placeholder="Ex: 🎉 O nosso novo curso já está disponível!" className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 font-medium outline-none focus:border-[#FF4500] transition" />
              </div>
              <div>
                <label className="block text-sm font-bold text-neutral-700 mb-2">Corpo do E-mail (suporta HTML)</label>
                <textarea name="html_body" required rows="8" placeholder="Escreve a tua mensagem aqui. Podes usar <b>negrito</b> ou <a href='...'>links</a>." className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 font-medium outline-none focus:border-[#FF4500] transition font-mono text-sm"></textarea>
              </div>
              <button disabled={loading} className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-4 rounded-xl transition flex justify-center items-center gap-2 shadow-lg">
                {loading ? <Loader2 className="animate-spin" size={20} /> : <><Send size={20} /> Disparar para Todos</>}
              </button>
            </form>
          </div>

          <div className="bg-white rounded-3xl border border-neutral-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-neutral-100">
              <h3 className="font-bold text-xl">Últimos Disparos</h3>
            </div>
            {campaigns.length === 0 ? (
              <div className="p-12 text-center text-neutral-400 font-medium">Nenhum e-mail enviado ainda.</div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {campaigns.map(c => (
                  <div key={c.id} className="p-6">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-bold text-neutral-900">{c.title}</h4>
                      <span className={`text-xs font-bold px-3 py-1 rounded-full ${c.status === 'sent' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                        {c.status === 'sent' ? 'ENVIADO' : 'ERRO'}
                      </span>
                    </div>
                    <p className="text-sm text-neutral-500 mb-2 line-clamp-1">{c.subject}</p>
                    <p className="text-xs font-bold text-[#FF4500]">Enviado para {c.sent_count} pessoa(s) em {new Date(c.created_at).toLocaleString('pt-PT')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  )
}
