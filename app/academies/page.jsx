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
  try {
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
    <div className="min-h-screen bg-[#F9FAFB] text-neutral-900 font-sans selection:bg-[#FF4500] selection:text-white pb-24">
      
      {/* Hero Section Split Layout */}
      <section className="relative w-full h-auto min-h-[450px] lg:h-[550px] flex flex-col lg:flex-row bg-[#FAFAFA] border-b border-neutral-100 overflow-hidden">
        {/* Background Subtle Gradient */}
        <div className="absolute top-0 left-1/4 w-full max-w-[800px] h-[300px] bg-[#FF4500] opacity-[0.03] blur-[100px] rounded-full pointer-events-none mix-blend-multiply" />

        {/* Left Content */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-16 lg:py-0 h-full min-h-[450px] relative z-10">
          <div className="mb-6 flex items-center gap-3">
            <div className="w-10 h-10 bg-[#FFF0EB] rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-[#FF4500]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <span className="font-black text-lg tracking-widest text-neutral-900 uppercase">ABOVE Academy</span>
          </div>
          
          <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-[1.1] tracking-tight mb-6 text-neutral-900 min-h-[140px] lg:min-h-[200px]">
            <TypewriterText text="Domina a Tua Arte." speed={50} delay={300} />
          </h1>
          <p className="text-lg lg:text-xl text-neutral-500 mb-8 max-w-xl font-medium leading-relaxed">
            Do zero à mestria. O teu passe VIP para dezenas de cursos completos num único lugar, com acesso ilimitado.
          </p>
        </div>

        {/* Right Content - Carousel of Images */}
        <div className="w-full lg:w-1/2 h-[400px] lg:h-auto lg:absolute lg:right-0 lg:top-0 lg:bottom-0 relative overflow-hidden">
          {/* Subtle Overlay to blend with Light Mode */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAFAFA] via-transparent to-transparent z-10 hidden lg:block" />
          <AcademyHeroCarousel />
        </div>
      </section>

      {/* Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-24">
        <div className="mb-16 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight text-neutral-900">Descobre o teu próximo <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4500] to-[#FF8C00]">clube VIP</span></h2>
          <p className="text-neutral-500 text-lg max-w-2xl mx-auto font-medium">As melhores academias e comunidades premium criadas por especialistas.</p>
        </div>

        {(!academies || academies.length === 0) ? (
          <div className="text-center text-neutral-500 py-20 bg-white rounded-[2rem] border border-neutral-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <p className="text-xl font-bold">Nenhuma academia pública disponível no momento.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {academies.map(academy => {
              const priceVal = (academy.price_monthly_cents || 0) / 100
              const priceAOA = `Kz ${priceVal.toLocaleString('pt-PT')}`
              const creatorName = academy.creator?.full_name || "Criador"
              const creatorAvatar = academy.creator?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(creatorName)}&background=fff0eb&color=FF4500`
              const heroBg = academy.hero_image_url || "/academy_carousel_2.png"

              return (
                <Link key={academy.id} href={`/academy/${academy.id}`} className="group block bg-white border border-neutral-100 rounded-[2rem] overflow-hidden hover:border-[#FF4500]/30 transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_40px_-15px_rgba(255,69,0,0.2)] shadow-[0_8px_30px_rgb(0,0,0,0.04)] flex flex-col">
                  <div className="aspect-video relative bg-neutral-100 overflow-hidden">
                    <img src={heroBg} alt={academy.name} className="absolute inset-0 w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700 group-hover:scale-105" />
                    {academy.logo_url && (
                      <div className="absolute inset-0 flex items-center justify-center p-6 bg-gradient-to-t from-black/50 via-black/20 to-transparent">
                        <img src={academy.logo_url} alt="Logo" className="max-h-20 max-w-[80%] object-contain drop-shadow-2xl" />
                      </div>
                    )}
                  </div>
                  <div className="p-8 flex flex-col flex-1">
                    <div className="flex items-center gap-3 mb-5">
                      <img src={creatorAvatar} alt={creatorName} className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-sm" />
                      <span className="text-sm font-bold text-neutral-600">{creatorName}</span>
                    </div>
                    <h2 className="text-2xl font-black text-neutral-900 mb-3 group-hover:text-[#FF4500] transition-colors leading-tight">{academy.name}</h2>
                    <p className="text-sm text-neutral-500 line-clamp-2 mb-8 leading-relaxed font-medium">
                      {academy.description || "Uma academia exclusiva com conteúdo premium e comunidade."}
                    </p>
                    <div className="flex items-center justify-between border-t border-neutral-100 pt-5 mt-auto">
                      <span className="text-[10px] font-black text-[#FF4500] uppercase tracking-widest bg-[#FFF0EB] px-3 py-1.5 rounded-lg">Assinatura</span>
                      <span className="text-2xl font-black text-neutral-900">{priceAOA}<span className="text-xs font-bold text-neutral-400 ml-1">/mês</span></span>
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
  } catch (err) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F9FAFB] p-8 text-neutral-900">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-red-100 max-w-3xl w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Erro ao processar página</h1>
          <p className="mb-4">Ocorreu um erro no servidor ao processar as academias.</p>
          <pre className="bg-neutral-50 p-4 rounded-xl text-sm overflow-auto text-neutral-600 border border-neutral-200">
            {err.message}
            {'\n'}
            {err.stack}
          </pre>
        </div>
      </div>
    )
  }
}
