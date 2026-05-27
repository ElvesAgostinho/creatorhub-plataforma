import { notFound } from "next/navigation"
import { createServiceClient } from "@/lib/supabase/server"
import { Globe } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CreatorPage({ params }) {
  const svc = createServiceClient()
  
  // 1. Fetch Creator Profile
  const { data: creator } = await svc
    .from("profiles")
    .select("*")
    .eq("id", params.id)
    .maybeSingle()

  if (!creator) notFound()

  // 2. Fetch Creator's Published Products
  const { data: products } = await svc
    .from("products")
    .select("id, slug, title, image_url, price_cents, type")
    .eq("created_by", creator.id)
    .eq("published", true)

  const fmt = n => (n ?? 0).toLocaleString("pt-PT")

  return (
    <div className="bg-[#F8F7F5] min-h-screen">
      {/* Header / Banner do Criador */}
      <div className="bg-white border-b border-neutral-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden border-4 border-white shadow-xl shrink-0 bg-neutral-100 flex items-center justify-center text-5xl font-bold text-neutral-300">
              {creator.avatar_url ? (
                <img src={creator.avatar_url} alt={creator.full_name} className="w-full h-full object-cover" />
              ) : (
                creator.full_name?.charAt(0) || "U"
              )}
            </div>
            <div className="text-center md:text-left flex-1">
              <h1 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tight">{creator.full_name}</h1>
              <p className="text-xl text-neutral-500 font-medium mt-2">{creator.specialty || "Criador de Conteúdo"}</p>
              
              {/* Social Links */}
              <div className="flex items-center justify-center md:justify-start gap-4 mt-6 text-neutral-400">
                {creator.instagram && (
                  <a href={creator.instagram} target="_blank" className="hover:text-[#E1306C] transition-colors p-2 bg-neutral-50 rounded-full">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                  </a>
                )}
                {creator.youtube && (
                  <a href={creator.youtube} target="_blank" className="hover:text-[#FF0000] transition-colors p-2 bg-neutral-50 rounded-full">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"></path><polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02"></polygon></svg>
                  </a>
                )}
                {creator.website && (
                  <a href={creator.website} target="_blank" className="hover:text-blue-500 transition-colors p-2 bg-neutral-50 rounded-full">
                    <Globe size={24} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista de Produtos */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-black text-neutral-900 mb-8">Todos os cursos e produtos</h2>
        
        {products && products.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-8">
            {products.map(p => (
              <a href={`/product/${p.slug}`} key={p.id} className="group bg-white rounded-3xl overflow-hidden shadow-sm border border-neutral-200 hover:shadow-xl hover:border-[#FF4500]/30 transition-all flex flex-col">
                <div className="w-full aspect-[4/3] bg-neutral-100 relative overflow-hidden">
                  {p.image_url ? (
                    <img src={p.image_url} alt={p.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-neutral-300 font-bold">Sem Capa</div>
                  )}
                  <div className="absolute top-3 left-3">
                    <span className="bg-white/90 backdrop-blur text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full text-neutral-900 shadow-sm">
                      {p.type === 'course' ? 'Curso' : p.type === 'book' ? 'E-book' : 'Mentoria'}
                    </span>
                  </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="font-bold text-lg text-neutral-900 line-clamp-2 leading-snug group-hover:text-[#FF4500] transition-colors">{p.title}</h3>
                  <div className="mt-auto pt-4 flex items-center justify-between">
                    <span className="font-black text-xl text-[#FF4500]">{fmt(Math.round(p.price_cents / 100))} Kz</span>
                    <span className="text-sm font-bold text-neutral-400 group-hover:text-neutral-900 transition-colors">Ver detalhes →</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200">
            <p className="text-neutral-500 font-medium">Este criador ainda não tem produtos publicados.</p>
          </div>
        )}
      </div>
    </div>
  )
}
