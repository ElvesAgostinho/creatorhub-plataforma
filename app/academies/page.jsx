import { createServiceClient } from "@/lib/supabase/server"
import Link from "next/link"
import AcademyHeroCarousel from "@/components/AcademyHeroCarousel"
import TypewriterText from "@/components/TypewriterText"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Explorar Academias — ABOVE",
  description: "Descobre os melhores clubes de assinatura e comunidades da plataforma ABOVE."
}

export default async function AcademiesMarketplacePage() {
  const svc = createServiceClient()

  // Fetch published academies along with creator info
  const { data: academies } = await svc
    .from("creator_academies")
    .select(`
      id, name, slug, description, price_monthly_cents, logo_url, hero_image_url,
      creator:profiles(full_name, avatar_url)
    `)
    .eq("published", true)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-[#0A0A0A] text-white font-sans selection:bg-[#FF4500] selection:text-white">
      
      {/* Hero Section Split Layout */}
      <section className="relative w-full h-auto min-h-[450px] lg:h-[550px] flex flex-col lg:flex-row bg-[#0A0A0A]">
        {/* Left Content */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-16 lg:py-0 h-full min-h-[450px] relative z-10">
          <div className="mb-6 inline-block px-4 py-1.5 self-start rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-bold uppercase tracking-widest shadow-lg">
            ACESSO EXCLUSIVO
          </div>
          
          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] tracking-tight mb-6 text-white min-h-[140px] lg:min-h-[200px]">
            <TypewriterText text="Domina a Tua Arte." speed={50} delay={300} />
          </h1>
          <p className="text-lg lg:text-xl text-neutral-400 mb-8 max-w-xl font-medium">
            Do zero à mestria. O teu passe VIP para dezenas de cursos completos num único lugar, com acesso ilimitado.
          </p>
        </div>

        {/* Right Content - Carousel of Images */}
        <div className="w-full lg:w-1/2 h-[400px] lg:h-auto lg:absolute lg:right-0 lg:top-0 lg:bottom-0 relative overflow-hidden">
          <AcademyHeroCarousel />
        </div>
      </section>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-24">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Descobre o teu próximo <span className="text-[#FF4500]">clube VIP</span></h2>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto">As melhores academias e comunidades premium criadas por especialistas.</p>
        </div>

        {(!academies || academies.length === 0) ? (
          <div className="text-center text-neutral-500 py-20 bg-[#141414] rounded-3xl border border-neutral-800">
            <p>Nenhuma academia pública disponível no momento.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {academies.map(academy => {
              const priceAOA = (academy.price_monthly_cents / 100).toLocaleString('pt-PT', { style: 'currency', currency: 'AOA' })
              const creatorName = academy.creator?.full_name || "Criador"
              const creatorAvatar = academy.creator?.avatar_url || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&h=100&fit=crop"
              const heroBg = academy.hero_image_url || "https://images.unsplash.com/photo-1557683316-973673baf926?q=80&w=800&auto=format&fit=crop"

              return (
                <Link key={academy.id} href={`/academy/${academy.id}`} className="group block bg-[#141414] border border-neutral-800 rounded-3xl overflow-hidden hover:border-[#FF4500]/50 transition-all hover:-translate-y-1 shadow-2xl">
                  <div className="aspect-video relative bg-black overflow-hidden">
                    <img src={heroBg} alt={academy.name} className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity duration-500 group-hover:scale-105" />
                    {academy.logo_url && (
                      <div className="absolute inset-0 flex items-center justify-center p-6 bg-black/30">
                        <img src={academy.logo_url} alt="Logo" className="max-h-20 max-w-[80%] object-contain drop-shadow-xl" />
                      </div>
                    )}
                  </div>
                  <div className="p-8">
                    <div className="flex items-center gap-3 mb-5">
                      <img src={creatorAvatar} alt={creatorName} className="w-10 h-10 rounded-full object-cover border-2 border-neutral-800" />
                      <span className="text-sm font-bold text-neutral-300">{creatorName}</span>
                    </div>
                    <h2 className="text-2xl font-extrabold text-white mb-3 group-hover:text-[#FF4500] transition-colors">{academy.name}</h2>
                    <p className="text-sm text-neutral-400 line-clamp-2 mb-8 leading-relaxed">
                      {academy.description || "Uma academia exclusiva com conteúdo premium e comunidade."}
                    </p>
                    <div className="flex items-center justify-between border-t border-neutral-800 pt-5 mt-auto">
                      <span className="text-xs font-bold text-[#FF4500] uppercase tracking-widest bg-[#FF4500]/10 px-3 py-1.5 rounded-full">Assinatura</span>
                      <span className="text-xl font-extrabold text-white">{priceAOA}<span className="text-xs font-semibold text-neutral-500 ml-1">/mês</span></span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
