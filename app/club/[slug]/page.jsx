import { redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import Link from "next/link"
import CoverFallback from "@/components/mockups/CoverFallback"

export const dynamic = "force-dynamic"

export default async function ClubPage({ params }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect(`/login?next=/club/${params.slug}`)
  }

  const svc = createServiceClient()

  const { data: academy } = await svc
    .from("creator_academies")
    .select("*, creator:profiles(full_name, avatar_url)")
    .eq("id", params.slug)
    .maybeSingle()

  if (!academy) {
    return (
      <div className="min-h-screen bg-ink-800 flex items-center justify-center text-white">
        Academia não encontrada.
      </div>
    )
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  const isAdmin = profile?.role === "admin"
  const isCreator = academy.creator_id === user.id
  
  let hasAccess = isAdmin || isCreator
  
  if (!hasAccess) {
    const { data: membership } = await svc
      .from("academy_memberships")
      .select("status")
      .eq("user_id", user.id)
      .eq("academy_id", academy.id)
      .eq("status", "active")
      .maybeSingle()
      
    if (membership) hasAccess = true
  }

  if (!hasAccess) {
    redirect(`/academy/${academy.id}`)
  }

  // MOCK DATA PARA DEMONSTRAÇÃO (Se não houver dados reais na BD ainda)
  const { data: dbCourses } = await svc
    .from("products")
    .select("*")
    .eq("academy_id", academy.id)
    .eq("type", "course")
    .eq("published", true)

  const { data: dbPosts } = await svc
    .from("academy_posts")
    .select("*")
    .eq("academy_id", academy.id)
    .order("created_at", { ascending: false })

  const primaryColor = academy.primary_color || "#4F46E5"
  const logoUrl = academy.logo_url || ""
  
  // Sem conteúdo publicado mostramos um estado vazio honesto,
  // em vez de cursos inventados com fotografias de bancos de imagens.
  const courses = dbCourses || []
  const posts = dbPosts || []

  return (
    <div className="min-h-screen bg-ink-900 text-white font-sans overflow-x-hidden">
      
      {/* NAVBAR */}
      <nav className="fixed top-0 w-full z-50 bg-gradient-to-b from-black/80 to-transparent flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-8">
          <Link href="/library" className="flex items-center gap-3 hover:opacity-80 transition">
            {logoUrl ? (
              <img loading="lazy" decoding="async" src={logoUrl} alt={academy.name} className="h-8 object-contain" />
            ) : (
              <span className="font-extrabold text-xl tracking-tight" style={{ color: primaryColor }}>{academy.name}</span>
            )}
          </Link>
          <div className="hidden md:flex gap-6 text-sm font-semibold text-neutral-300">
            <a href="#feed" className="hover:text-white transition">Início</a>
            <a href="#courses" className="hover:text-white transition">Cursos e Séries</a>
            <a href="#" className="hover:text-white transition">Comunidade</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/library" className="text-sm font-semibold text-neutral-400 hover:text-white transition">
            Voltar à Biblioteca
          </Link>
          <div className="w-8 h-8 rounded-full border border-neutral-700 overflow-hidden">
             {/* Avatar do user, fallback */}
             <div className="w-full h-full bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-500">U</div>
          </div>
        </div>
      </nav>

      {/* HERO SECTION (Destaque Principal) */}
      <div className="relative h-[85vh] w-full bg-black">
         <div className="absolute inset-0">
           {academy.hero_image_url ? (
             <img
               src={academy.hero_image_url}
               alt=""
               className="w-full h-full object-cover opacity-60"
             />
           ) : (
             <div
               aria-hidden="true"
               className="bg-grid w-full h-full"
               style={{ backgroundColor: "#020617", backgroundImage: `radial-gradient(70% 90% at 75% 10%, ${primaryColor}55, transparent 70%), radial-gradient(50% 60% at 10% 90%, ${primaryColor}22, transparent 70%)` }}
             />
           )}
           {/* Gradiente para fundir com a página (estilo Netflix) */}
           <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent"></div>
           <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/60 to-transparent"></div>
         </div>
         
         <div className="absolute bottom-[20%] left-6 md:left-16 max-w-2xl">
           {logoUrl && <img loading="lazy" decoding="async" src={logoUrl} alt="Logo" className="max-w-[200px] mb-6 drop-shadow-2xl" />}
           {!logoUrl && <h1 className="text-5xl md:text-7xl font-extrabold mb-4 drop-shadow-2xl">{academy.name}</h1>}
           
           <p className="text-lg md:text-xl text-neutral-300 mb-8 drop-shadow-md font-medium max-w-xl line-clamp-3">
             {academy.description || "Bem-vindo ao teu clube premium. Assiste aos vídeos exclusivos, masterclasses e cursos completos para acelerar os teus resultados."}
           </p>
           
           <div className="flex gap-4">
             <button className="flex items-center gap-2 bg-white text-black hover:bg-neutral-200 px-8 py-3 rounded-md font-bold text-lg transition">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M5 3l14 9-14 9V3z"/></svg>
               Assistir Último Vídeo
             </button>
             <button className="flex items-center gap-2 bg-neutral-500/40 hover:bg-neutral-500/60 backdrop-blur-md text-white border border-white/10 px-8 py-3 rounded-md font-bold text-lg transition">
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
               Mais Informações
             </button>
           </div>
         </div>
      </div>

      {/* FEED DE VÍDEOS EXCLUSIVOS */}
      <div id="feed" className="relative z-10 -mt-16 px-6 md:px-16 pb-12">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          Atualizações Exclusivas 
          <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-neutral-800 text-neutral-400">Novidades</span>
        </h2>
        
        {posts.length === 0 && (
          <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-900/40 px-6 py-10 text-center">
            <p className="font-bold text-neutral-300">Ainda não há atualizações publicadas</p>
            <p className="mt-1 text-sm text-neutral-500">As novidades exclusivas do clube aparecem aqui assim que forem publicadas.</p>
          </div>
        )}

        <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
          {posts.map((post, idx) => (
            <div key={idx} className="shrink-0 w-[300px] md:w-[400px] snap-start group cursor-pointer">
               <div className="aspect-video relative rounded-md overflow-hidden bg-neutral-900 border border-neutral-800 mb-3">
                 {post.thumbnail_url ? (
                   <img loading="lazy" decoding="async" src={post.thumbnail_url} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-80 group-hover:opacity-100" />
                 ) : (
                   <div aria-hidden="true" className="w-full h-full" style={{ backgroundImage: `linear-gradient(135deg, ${primaryColor}40, #111)` }} />
                 )}
                 {post.is_exclusive && (
                   <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded">
                     Membro VIP
                   </div>
                 )}
                 <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-12 h-12 rounded-full border-2 border-white flex items-center justify-center bg-black/40 backdrop-blur-sm">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="ml-1 text-white"><path d="M5 3l14 9-14 9V3z"/></svg>
                    </div>
                 </div>
               </div>
               <h3 className="font-bold text-neutral-200 group-hover:text-white transition">{post.title}</h3>
               <p className="text-sm text-neutral-500 line-clamp-2 mt-1">{post.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CURSOS E SÉRIES */}
      <div id="courses" className="px-6 md:px-16 pb-24">
        <h2 className="text-xl font-bold mb-4">Cursos Incluídos na Assinatura</h2>
        
        {courses.length === 0 && (
          <div className="rounded-xl border border-dashed border-neutral-800 bg-neutral-900/40 px-6 py-10 text-center">
            <p className="font-bold text-neutral-300">Nenhum curso incluído até agora</p>
            <p className="mt-1 text-sm text-neutral-500">Os cursos adicionados a este clube ficam disponíveis aqui para todos os membros.</p>
          </div>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {courses.map((course, idx) => (
            <Link key={idx} href={`/learn/${course.slug}`} className="group cursor-pointer">
              <div className="aspect-[2/3] relative rounded-md overflow-hidden bg-neutral-900 border border-neutral-800 mb-2 shadow-lg">
                {course.image_url ? (
                  <img loading="lazy" decoding="async" src={course.image_url} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500 opacity-90 group-hover:opacity-100" />
                ) : (
                  <CoverFallback title={course.title} type="course" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition duration-300"></div>
                <div className="absolute bottom-4 left-0 w-full flex justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 translate-y-2 group-hover:translate-y-0">
                   <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-2xl">
                     <svg width="18" height="18" viewBox="0 0 24 24" fill="black" className="ml-0.5"><path d="M5 3l14 9-14 9V3z"/></svg>
                   </div>
                </div>
              </div>
              <h3 className="text-sm font-bold text-neutral-300 group-hover:text-white transition line-clamp-2">{course.title}</h3>
            </Link>
          ))}
        </div>
      </div>
      
    </div>
  )
}
