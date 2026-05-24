import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function CommunityPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/community")

  const posts = [
    { id: 1, author: "João Silva", role: "Especialista em Vendas", time: "Há 2 horas", content: "Qual foi a vossa maior dificuldade a criar o primeiro curso online? Partilhem as vossas estratégias!", likes: 12, replies: 5 },
    { id: 2, author: "Maria Costa", role: "Aluna MVP", time: "Há 5 horas", content: "Acabei de fechar a minha primeira venda através das recomendações automáticas do novo checkout! Estou muito contente.", likes: 34, replies: 8 },
    { id: 3, author: "Admin ABOVE", role: "Plataforma", time: "Ontem", content: "Bem-vindos à nova secção de Comunidade da ABOVE! Este espaço serve para partilharmos resultados, pedirmos ajuda e conectarmos os melhores criadores de Angola e do Mundo.", likes: 89, replies: 12 },
  ]

  return (
    <div className="min-h-screen bg-neutral-900 text-white font-sans selection:bg-[#FF4500] selection:text-white">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-extrabold text-white">Comunidade</h1>
            <p className="text-neutral-400 mt-1">Conecta-te com especialistas e outros criadores de sucesso.</p>
          </div>
          <button className="bg-[#FF4500] hover:bg-[#E03E00] text-white font-bold px-6 py-2.5 rounded-xl transition">
            Nova Publicação
          </button>
        </div>

        <div className="space-y-6">
          {posts.map(post => (
            <div key={post.id} className="bg-white rounded-3xl p-6 border border-neutral-200 shadow-sm">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center font-bold text-[#FF4500]">
                  {post.author.slice(0, 1)}
                </div>
                <div>
                  <div className="font-bold text-[#111]">{post.author}</div>
                  <div className="text-xs text-neutral-500 flex items-center gap-2">
                    <span className="bg-neutral-100 px-2 py-0.5 rounded text-neutral-600 font-semibold">{post.role}</span>
                    • {post.time}
                  </div>
                </div>
              </div>
              
              <p className="text-neutral-700 leading-relaxed mb-6">
                {post.content}
              </p>
              
              <div className="flex items-center gap-6 border-t border-neutral-100 pt-4">
                <button className="flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-[#FF4500] transition">
                  <span className="text-lg">👍</span> {post.likes} Gostos
                </button>
                <button className="flex items-center gap-2 text-sm font-semibold text-neutral-500 hover:text-[#FF4500] transition">
                  <span className="text-lg">💬</span> {post.replies} Respostas
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
