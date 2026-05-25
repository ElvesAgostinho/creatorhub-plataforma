"use client"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { ShieldCheck, CheckCircle2, XCircle, Clock, Search } from "lucide-react"
import { toast } from "react-hot-toast"

export default function AdminRequestsPage() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    fetchPendingUsers()
  }, [])

  const fetchPendingUsers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      
    if (!error && data) {
      setUsers(data)
    }
    setLoading(false)
  }

  const handleApprove = async (id, name) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'active' })
      .eq('id', id)
      
    if (!error) {
      toast.success(`${name || 'Utilizador'} aprovado com sucesso!`)
      setUsers(users.filter(u => u.id !== id))
    } else {
      toast.error('Erro ao aprovar utilizador.')
    }
  }

  const handleReject = async (id, name) => {
    if(!confirm(`Tens a certeza que queres rejeitar ${name || 'este utilizador'}?`)) return
    
    const { error } = await supabase
      .from('profiles')
      .update({ status: 'rejected' })
      .eq('id', id)
      
    if (!error) {
      toast.success(`${name || 'Utilizador'} rejeitado.`)
      setUsers(users.filter(u => u.id !== id))
    } else {
      toast.error('Erro ao rejeitar utilizador.')
    }
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight flex items-center gap-3">
            <ShieldCheck className="w-8 h-8 text-[#FF4500]" />
            Aprovações Pendentes
          </h1>
          <p className="text-neutral-500 mt-1 font-medium">Analise os novos registos e autorize o acesso à plataforma.</p>
        </div>
        
        <div className="flex bg-white border border-neutral-200 rounded-xl px-4 py-2 w-full md:w-80 items-center gap-2">
          <Search className="w-5 h-5 text-neutral-400" />
          <input 
            type="text" 
            placeholder="Procurar nome..." 
            className="w-full bg-transparent border-none outline-none text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-neutral-200 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-neutral-400 flex flex-col items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF4500] mb-4"></div>
            A carregar pedidos...
          </div>
        ) : users.length === 0 ? (
          <div className="p-16 text-center text-neutral-400 flex flex-col items-center justify-center">
            <ShieldCheck className="w-16 h-16 text-neutral-200 mb-4" />
            <p className="text-xl font-bold text-neutral-700">Tudo em dia!</p>
            <p className="mt-2">Não existem contas pendentes a aguardar aprovação.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-neutral-500 text-sm border-b border-neutral-200">
                  <th className="p-4 font-semibold">Utilizador</th>
                  <th className="p-4 font-semibold">Data de Registo</th>
                  <th className="p-4 font-semibold">Estado</th>
                  <th className="p-4 font-semibold text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-neutral-50 transition">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-neutral-200 overflow-hidden shrink-0 border border-neutral-300">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt={user.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-[#FF4500]/10 text-[#FF4500] flex items-center justify-center font-bold">
                              {user.full_name?.charAt(0) || 'U'}
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-neutral-900">{user.full_name || 'Sem nome'}</div>
                          <div className="text-xs text-neutral-500 font-mono">{user.id.substring(0,8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 text-neutral-600 text-sm">
                      {new Date(user.created_at).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-bold">
                        <Clock className="w-3 h-3" />
                        Pendente
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button 
                          onClick={() => handleReject(user.id, user.full_name)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold text-neutral-500 hover:text-red-600 hover:bg-red-50 transition"
                        >
                          <XCircle className="w-4 h-4" />
                          Rejeitar
                        </button>
                        <button 
                          onClick={() => handleApprove(user.id, user.full_name)}
                          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-bold text-white bg-[#FF4500] hover:bg-[#E03E00] shadow hover:shadow-lg transition"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          Aprovar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
