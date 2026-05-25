import AcademyFAQ from "@/components/AcademyFAQ"
import MembersHeroCarousel from "@/components/MembersHeroCarousel"
import { createServiceClient } from "@/lib/supabase/server"

import TypewriterText from "@/components/TypewriterText"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Academia ABOVE — O teu negócio num só lugar",
  description: "Transforma a experiência dos teus clientes com a melhor área de membros."
}

export default async function AcademyPage() {
  const svc = createServiceClient()
  const { data: academy } = await svc.from("creator_academies").select("*").limit(1).maybeSingle()
  const primaryColor = academy?.primary_color || "#FF4500"
  
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative w-full h-auto min-h-[450px] lg:h-[550px] flex flex-col lg:flex-row bg-[#0A0A0A]">
        
        {/* Left Content - Sleek Dark */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 lg:px-16 xl:px-24 py-16 lg:py-0 h-full min-h-[450px] relative z-10">
          <div className="mb-6 inline-block px-4 py-1.5 self-start rounded-full bg-white/5 border border-white/10 text-white/80 text-xs font-bold uppercase tracking-widest shadow-lg">
            ACESSO EXCLUSIVO
          </div>
          
          <h1 className="text-4xl lg:text-5xl xl:text-6xl font-black leading-[1.1] tracking-tight mb-6 text-white min-h-[140px] lg:min-h-[200px]">
            <TypewriterText text="Aprende a Construir, Monetizar, Gerir e Crescer o teu Negócio" speed={40} delay={300} />
          </h1>
          <p className="text-lg lg:text-xl text-neutral-400 mb-8 max-w-xl font-medium">
            Faz parte da elite do conhecimento. Acesso a masterclasses exclusivas, rede de networking premium e estratégias comprovadas.
          </p>
          <div className="pt-2">
            <a href="/admin/products" className="inline-block bg-[#FF4500] hover:bg-[#E03E00] text-white font-bold px-8 py-4 rounded-full text-lg transition-transform hover:-translate-y-1 shadow-lg shadow-[#FF4500]/20">
              Começar agora
            </a>
          </div>
        </div>

        {/* Right Content - Carousel of Images */}
        <div className="w-full lg:w-1/2 h-[400px] lg:h-auto lg:absolute lg:right-0 lg:top-0 lg:bottom-0 relative overflow-hidden">
          <MembersHeroCarousel />
        </div>
      </section>

      {/* 2. Video Player Section */}
      <section className="bg-neutral-950 py-24 border-y border-white/5 relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl h-[500px] bg-[#FF4500]/5 blur-[120px] rounded-full pointer-events-none"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-6 order-2 lg:order-1">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#FF4500] animate-pulse"></span>
              <p className="text-white/80 font-bold tracking-wide uppercase text-xs">
                PLAYER EXCLUSIVO
              </p>
            </div>
            <h2 className="text-4xl lg:text-5xl font-medium tracking-tight text-white leading-tight">
              A única área de membros com o seu próprio player de vídeo integrado
            </h2>
            <p className="text-lg text-neutral-400 max-w-lg leading-relaxed">
              O teu conteúdo em qualquer dispositivo, do telemóvel à TV, protegido 24/7. Com uma equipa totalmente dedicada à Academia, garantimos a estabilidade e segurança do teu conteúdo: sistema anti-fraude, encriptação e marca de água.
            </p>
            <div className="pt-6">
              <a href="/admin/products" className="inline-flex items-center gap-2 font-bold text-lg hover:gap-4 transition-all" style={{ color: primaryColor }}>
                Adicionar conteúdo ao Player 
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </a>
            </div>
          </div>
          <div className="relative order-1 lg:order-2 flex justify-center lg:justify-start">
             <div className="relative w-full max-w-md">
                <div className="bg-neutral-900 rounded-[2rem] p-4 shadow-2xl border border-white/10 relative z-10 transform hover:scale-[1.02] transition-transform duration-500">
                   <div className="aspect-[9/16] bg-black rounded-xl overflow-hidden relative border border-white/5">
                      <img src="/academy_carousel_2.png" alt="Video playing" className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent"></div>
                      
                      {/* Fake Player UI */}
                      <div className="absolute bottom-6 left-6 right-6">
                         <h3 className="text-white font-bold text-xl mb-1">Aulas de Elite</h3>
                         <p className="text-white/70 text-sm mb-4">Masterclass Exclusiva</p>
                         <div className="h-1.5 bg-white/20 rounded-full overflow-hidden backdrop-blur-sm">
                           <div className="h-full w-2/3" style={{ backgroundColor: primaryColor }}></div>
                         </div>
                         <div className="flex justify-between items-center mt-3 text-white/70 text-xs font-medium">
                           <span>08:40</span>
                           <span>12:00</span>
                         </div>
                      </div>
                   </div>
                </div>
                {/* Floating Play Button */}
                <div className="absolute top-1/2 -left-12 -translate-y-1/2 bg-white/10 backdrop-blur-xl w-24 h-24 rounded-2xl shadow-[0_0_40px_rgba(255,69,0,0.2)] flex items-center justify-center border border-white/20 hidden sm:flex z-20 hover:scale-110 transition-transform cursor-pointer">
                  <svg width="36" height="36" viewBox="0 0 24 24" fill="currentColor" className="text-[#FF4500] ml-1">
                    <path d="M5 3l14 9-14 9V3z" />
                  </svg>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 3. Testimonials Section */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-16 space-y-4">
          <p className="text-[#FF4500] font-bold tracking-wide uppercase text-sm">
            SEGUE OS LÍDERES DO MERCADO
          </p>
          <h2 className="text-4xl lg:text-5xl font-medium tracking-tight text-neutral-900">
            A área de membros <span className="text-[#FF4500]">dos Top Sellers</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Top Seller 1 */}
          <div className="flex flex-col border-l border-neutral-200 pl-6 space-y-6">
            <svg className="w-8 h-8 text-[#FF4500]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="text-neutral-700 leading-relaxed text-sm flex-1">
              Existe um ditado no mercado que diz que é muito mais fácil vender a quem já é teu cliente, e a Academia é essa ferramenta porque a pessoa já está a viver a experiência de ser aluno. Não preciso de provar muito sobre o meu produto; eles estão à espera da próxima oferta. A <span className="font-bold">Academia dá-me essa facilidade e rapidez para adquirir o próximo produto num só clique.</span>
            </p>
            <div className="flex items-center gap-4 mt-auto pt-4">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=300&auto=format&fit=crop" alt="Amílcar Diogo" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
              <div>
                <p className="font-bold text-neutral-900 text-sm">Amílcar Diogo</p>
                <p className="text-neutral-500 text-xs">CEO da Top Consultores</p>
              </div>
            </div>
          </div>

          {/* Top Seller 2 */}
          <div className="flex flex-col border-l border-neutral-200 pl-6 space-y-6">
             <svg className="w-8 h-8 text-[#FF4500]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="text-neutral-700 leading-relaxed text-sm flex-1">
              Vejo a Academia ABOVE como um grande diferencial. Primeiro, devido ao custo-benefício.<br/><br/>
              Se comparares com outras plataformas, <span className="font-bold">vais acabar com um custo muito mais elevado noutro lado.</span> Na minha opinião, o custo-benefício da ABOVE é o melhor hoje em dia.
            </p>
            <div className="flex items-center gap-4 mt-auto pt-4">
              <img src="https://images.unsplash.com/photo-1573164574572-cb89e39749b4?q=80&w=300&auto=format&fit=crop" alt="Nádia Kassange" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
              <div>
                <h4 className="font-bold text-[#111111]">Nádia Kassange</h4>
                <p className="text-sm text-neutral-500">Especialista em Marketing Digital</p>
              </div>
            </div>
          </div>

          {/* Top Seller 3 */}
          <div className="flex flex-col border-l border-neutral-200 pl-6 space-y-6">
             <svg className="w-8 h-8 text-[#FF4500]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="text-neutral-700 leading-relaxed text-sm flex-1">
              A nova experiência da Academia ABOVE está praticamente ao mesmo nível que outras plataformas que cobram balúrdios por isso.<br/><br/>
              Exceto que a ABOVE apenas cobra por transação, o que sai <span className="font-bold">muito mais barato</span> do que pagar mensalidades fixas.<br/><br/>
              Se pudesse dar um conselho a quem não usa a Academia, seria para experimentar antes de qualquer outra.
            </p>
            <div className="flex items-center gap-4 mt-auto pt-4">
              <img src="https://images.unsplash.com/photo-1531384441138-2736e62e0919?q=80&w=300&auto=format&fit=crop" alt="Nelson Tati" className="w-12 h-12 rounded-full object-cover flex-shrink-0" />
              <div>
                <p className="font-bold text-neutral-900 text-sm">Nelson Tati</p>
                <p className="text-neutral-500 text-xs">Especialista em IA</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. FAQ Section */}
      <section className="bg-[#F9F9F9] py-24 border-t border-neutral-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 space-y-4">
            <p className="text-[#FF4500] font-bold tracking-wide uppercase text-sm">
              PERGUNTAS FREQUENTES
            </p>
            <h2 className="text-4xl lg:text-5xl font-medium tracking-tight text-neutral-900">
              Tens dúvidas? Nós temos as respostas!
            </h2>
          </div>
          
          <AcademyFAQ />

          <div className="flex justify-center mt-16 pb-10">
            <a href="/admin/products" className="bg-[#FF4500] hover:bg-[#e03d00] text-white font-bold px-10 py-4 rounded-full text-lg transition shadow-lg shadow-[#FF4500]/20">
              Criar a minha Academia
            </a>
          </div>
        </div>
      </section>
      
    </div>
  )
}
