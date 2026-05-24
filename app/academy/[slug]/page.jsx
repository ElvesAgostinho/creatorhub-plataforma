import { createServiceClient } from "@/lib/supabase/server"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function AcademySalesPage({ params }) {
  const svc = createServiceClient()

  const { data: academy } = await svc
    .from("creator_academies")
    .select("*, creator:profiles(full_name, avatar_url)")
    .eq("id", params.slug)
    .maybeSingle()

  if (!academy) {
    return (
      <div className="min-h-screen bg-[#F8F7F5] flex items-center justify-center">
        Academia não encontrada.
      </div>
    )
  }

  const { data: courses } = await svc
    .from("products")
    .select("*")
    .eq("academy_id", academy.id)
    .eq("type", "course")
    .eq("published", true)

  const primaryColor = academy.primary_color || "#FF4500"
  const themeMode = academy.theme_mode || "light"
  const layoutStyle = academy.layout_style || "classic"
  const priceAOA = (academy.price_monthly_cents / 100).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })
  const isFree = academy.price_monthly_cents === 0

  const isDark = themeMode === "dark"
  const bgClass = isDark ? "bg-[#0A0A0A] text-white" : "bg-[#F8F7F5] text-neutral-900"
  const cardClass = isDark ? "bg-[#141414] border-neutral-800" : "bg-white border-neutral-200"
  const headerClass = isDark ? "bg-[#0A0A0A] border-neutral-800 text-white" : "bg-white border-neutral-200 text-neutral-900"
  const textMutedClass = isDark ? "text-neutral-400" : "text-neutral-500"

  return (
    <div className={`min-h-screen font-sans ${bgClass}`} style={{ '--primary': primaryColor }}>
      
      {/* Header Simples */}
      <header className={`${headerClass} border-b sticky top-0 z-50`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between px-4 sm:px-6 py-4">
          <Link href="/academies" className={`flex items-center gap-2 ${textMutedClass} hover:text-[var(--primary)] font-semibold text-sm transition`}>
            ← Voltar às Academias
          </Link>
          {academy.logo_url ? (
             <img src={academy.logo_url} alt="Logo" className="h-6 object-contain" />
          ) : (
             <span className="font-extrabold text-lg" style={{ color: 'var(--primary)' }}>{academy.name}</span>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className={`border-b ${isDark ? 'border-neutral-800' : 'border-neutral-200 bg-white'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24 grid lg:grid-cols-2 gap-12 items-center">
          
          <div>
            <div className="flex items-center gap-3 mb-6">
              <img src={academy.creator?.avatar_url} alt="Creator" className="w-10 h-10 rounded-full object-cover border border-[var(--primary)]" />
              <span className={`font-bold ${textMutedClass}`}>Por {academy.creator?.full_name}</span>
            </div>
            
            <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight mb-6">
              {academy.name}
            </h1>
            
            <p className={`text-lg ${textMutedClass} mb-8 max-w-xl`}>
              {academy.description || "Ganha acesso imediato a todos os conteúdos exclusivos, cursos premium e atualizações contínuas nesta academia."}
            </p>
            
            <div className={`${cardClass} border p-6 rounded-2xl max-w-md`}>
               <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="text-sm font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--primary)' }}>Subscrição Mensal</p>
                    <div className="text-4xl font-extrabold">
                      {isFree ? "Gratuito" : priceAOA}
                    </div>
                  </div>
               </div>
               
               {/* No futuro, isto ligará ao Checkout para comprar a Academy */}
               <button 
                 style={{ backgroundColor: 'var(--primary)' }}
                 className="w-full text-white font-bold py-4 rounded-xl hover:opacity-90 transition shadow-lg flex justify-center items-center gap-2"
               >
                 Assinar Agora
               </button>
               
               <p className={`text-xs text-center ${textMutedClass} mt-4 font-medium`}>
                 Cancelas quando quiseres. Acesso imediato a todo o catálogo.
               </p>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3] lg:aspect-auto lg:h-[600px]">
             <img 
               src={academy.hero_image_url || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=1000&auto=format&fit=crop"} 
               alt={academy.name} 
               className="w-full h-full object-cover"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
             {academy.logo_url && (
               <div className="absolute inset-0 flex items-center justify-center p-12">
                 <img src={academy.logo_url} alt="Logo" className="max-w-full drop-shadow-2xl" />
               </div>
             )}
          </div>
          
        </div>
      </section>

      {/* O que está incluído */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20">
        <h2 className="text-3xl font-extrabold text-center mb-16">Tudo o que está incluído na tua subscrição</h2>
        
        <div className="grid md:grid-cols-3 gap-8">
           <div className={`${cardClass} border p-8 rounded-3xl text-center shadow-sm`}>
             <div className={`w-16 h-16 ${isDark ? 'bg-neutral-900' : 'bg-[#F8F7F5]'} rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl`}>🎥</div>
             <h3 className="text-xl font-bold mb-3">Conteúdo Exclusivo</h3>
             <p className={`text-sm ${textMutedClass}`}>Aulas e vídeos novos adicionados continuamente no feed privado da academia.</p>
           </div>
           <div className={`${cardClass} border p-8 rounded-3xl text-center shadow-sm border-b-4`} style={{ borderBottomColor: 'var(--primary)' }}>
             <div className={`w-16 h-16 ${isDark ? 'bg-neutral-900' : 'bg-[#F8F7F5]'} rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl`}>📚</div>
             <h3 className="text-xl font-bold mb-3">Cursos Completos</h3>
             <p className={`text-sm ${textMutedClass}`}>Acesso imediato a todos os cursos fechados e masterclasses do criador.</p>
           </div>
           <div className={`${cardClass} border p-8 rounded-3xl text-center shadow-sm`}>
             <div className={`w-16 h-16 ${isDark ? 'bg-neutral-900' : 'bg-[#F8F7F5]'} rounded-2xl flex items-center justify-center mx-auto mb-6 text-3xl`}>💬</div>
             <h3 className="text-xl font-bold mb-3">Comunidade Privada</h3>
             <p className={`text-sm ${textMutedClass}`}>Interage com outros alunos focados no mesmo objetivo que tu.</p>
           </div>
        </div>
        
        {courses && courses.length > 0 && (
          <div className="mt-24">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-3">
              Cursos Fechados <span className="bg-neutral-100 text-neutral-500 text-sm px-3 py-1 rounded-full font-bold">{courses.length}</span>
            </h3>
            <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-6">
               {courses.map((course, idx) => (
                 <div key={idx} className={`${cardClass} border rounded-2xl overflow-hidden group`}>
                   <div className={`aspect-[4/3] ${isDark ? 'bg-black' : 'bg-neutral-100'} overflow-hidden`}>
                     <img src={course.image_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 group-hover:opacity-100" />
                   </div>
                   <div className="p-4">
                     <h4 className="font-bold group-hover:text-[var(--primary)] transition line-clamp-2">{course.title}</h4>
                   </div>
                 </div>
               ))}
            </div>
          </div>
        )}
      </section>
      
    </div>
  )
}
