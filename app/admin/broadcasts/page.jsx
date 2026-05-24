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
        <h1 className="text-3xl font-extrabold">Admin — Avisos Globais</h1>
        <nav className="flex gap-2 text-sm">
          <a href="/admin" className="px-3 py-1.5 rounded-md border bg-white border-neutral-300 hover:bg-neutral-50">← Compras</a>
        </nav>
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
            <p className="text-xs text-neutral-500 mb-4">Esta mensagem vai aparecer na Caixa de Entrada (Inbox) de todos os utilizadores da plataforma (alunos e criadores). Usa para anunciar novos cursos, ofertas, eventos grátis, etc.</p>
          </div>

          <div>
            <label className="text-sm font-medium">Assunto</label>
            <input 
              type="text" 
              name="subject" 
              required
              placeholder="Ex: Novo Curso Grátis Disponível!" 
              className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E7C86]" 
            />
          </div>

          <div>
            <label className="text-sm font-medium">Mensagem Completa</label>
            <textarea 
              name="content" 
              required
              rows={5} 
              className="mt-1 w-full border border-neutral-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0E7C86]" 
              placeholder="Olá! Temos o prazer de anunciar..."
            />
          </div>

          <button type="submit" className="w-full bg-black hover:bg-neutral-800 text-white font-bold py-3 rounded-md text-sm uppercase tracking-wider">
            📢 Enviar para todos
          </button>
        </form>
      </div>
    </div>
  )
}
