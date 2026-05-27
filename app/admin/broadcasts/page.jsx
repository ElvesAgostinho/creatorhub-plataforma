import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { sendMessage } from "@/app/inbox/actions"

export const dynamic = "force-dynamic"

export default async function AdminBroadcasts() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/admin/broadcasts")

  const { data: profile } = await supabase
    .from("profiles").select("role").eq("id", user.id).maybeSingle()
  if (!profile || profile.role !== "admin") redirect("/admin")

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-3xl font-extrabold text-[#111]">Admin — Avisos Globais</h1>
      </div>

      <div className="mt-8 max-w-2xl border border-neutral-200 rounded-2xl p-6 bg-white shadow-sm">
        <form 
          action={async (formData) => {
            "use server"
            // To make it a broadcast, we don't pass recipient_id. But wait, `sendMessage` action requires `recipient_id`.
            // Let's modify `sendMessage` to allow null recipient if user is admin. Or just do it directly here.
            const subject = formData.get("subject")
            const content = formData.get("content")
            
            const client = createClient()
            await client.from("messages").insert({
              sender_id: user.id,
              recipient_id: null,
              subject,
              content
            })
            redirect("/admin/broadcasts?success=1")
          }} 
          className="space-y-5"
        >
          <div>
            <h2 className="font-bold text-lg mb-2">Enviar Aviso Geral</h2>
            <p className="text-xs text-neutral-500 mb-4">Esta mensagem vai aparecer na Caixa de Entrada (Inbox) de todos os utilizadores da plataforma (alunos e criadores). Usa para anunciar novos cursos, ofertas, e-books grátis, etc.</p>
          </div>

          <div>
            <label className="text-sm font-bold text-neutral-800">Assunto</label>
            <input 
              type="text" 
              name="subject" 
              required
              placeholder="Ex: Novo Curso Grátis Disponível!" 
              className="mt-2 w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF4500]/10 focus:border-[#FF4500] transition-all shadow-sm" 
            />
          </div>

          <div>
            <label className="text-sm font-bold text-neutral-800">Mensagem Completa</label>
            <textarea 
              name="content" 
              required
              rows={5} 
              className="mt-2 w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF4500]/10 focus:border-[#FF4500] transition-all shadow-sm" 
              placeholder="Olá! Temos o prazer de anunciar..."
            />
          </div>

          <button type="submit" className="w-full bg-[#FF4500] hover:bg-[#E03E00] text-white font-bold py-3.5 rounded-xl text-sm uppercase tracking-wider transition-colors shadow-sm shadow-[#FF4500]/20 mt-4">
            📢 Enviar para todos
          </button>
        </form>
      </div>
    </div>
  )
}
