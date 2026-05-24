import AcademyFAQ from "@/components/AcademyFAQ"
import { createServiceClient } from "@/lib/supabase/server"

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
      {/* 1. Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-20 lg:py-32 grid lg:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <p className="text-[#FF4500] font-bold tracking-wide uppercase text-sm">
            ACADEMIA ABOVE
          </p>
          <h1 className="text-5xl lg:text-6xl font-medium tracking-tight text-neutral-900 leading-[1.1]">
            O teu negócio <br/>
            <span className="text-neutral-900">num só lugar</span>
          </h1>
          <p className="text-lg text-neutral-600 max-w-lg leading-relaxed">
            Transforma a experiência dos teus clientes com conteúdo disponível em qualquer dispositivo, totalmente personalizado com a tua marca e com suporte inteligente 24/7. Tudo isto na Academia ABOVE, a tua área de membros definitiva.
          </p>
          <div className="pt-4">
            <a href="/admin/products" className="inline-block bg-[#FF4500] hover:bg-[#e03d00] text-white font-bold px-8 py-4 rounded-full text-lg transition shadow-lg shadow-[#FF4500]/20">
              Começar agora
            </a>
          </div>
        </div>
        <div className="relative flex justify-center lg:justify-end">
          {/* Hero Composition */}
          <div className="relative w-full max-w-lg aspect-square bg-neutral-100 rounded-2xl overflow-hidden shadow-2xl border border-neutral-200">
            <img src="/premium_academy_hero.png" alt="Laptop showing courses" className="w-full h-full object-cover opacity-90" />
            
            {/* Fake course cards overlay to simulate the Hotmart image */}
            <div className="absolute bottom-4 left-4 right-4 flex gap-3 overflow-hidden">
              <div className="w-1/3 aspect-[3/4] rounded-lg shadow-xl border border-neutral-700 flex flex-col justify-end p-3 bg-cover bg-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/30"></div>
                <img src="https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=300&auto=format&fit=crop" alt="Fit Kitchen" className="absolute inset-0 w-full h-full object-cover -z-10" />
                <span className="text-white font-bold text-xs relative z-10 drop-shadow-md">Fit Kitchen</span>
              </div>
              <div className="w-1/3 aspect-[3/4] rounded-lg shadow-xl border border-neutral-700 flex flex-col justify-end p-3 bg-cover bg-center relative overflow-hidden">
                <div className="absolute inset-0 bg-black/20"></div>
                <img src="https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=300&auto=format&fit=crop" alt="360 Routine" className="absolute inset-0 w-full h-full object-cover -z-10" />
                <span className="text-white font-bold text-xs relative z-10 drop-shadow-md">360 Routine</span>
              </div>
              <div className="w-1/3 aspect-[3/4] rounded-lg shadow-xl border border-blue-700 flex flex-col justify-end p-3 relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-900/40 mix-blend-multiply"></div>
                <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=300&auto=format&fit=crop" alt="Coach Fit" className="absolute inset-0 w-full h-full object-cover -z-10" />
                <div className="relative z-10">
                  <span className="text-blue-200 font-bold text-[10px] mb-1 block drop-shadow-md">AI AGENTS</span>
                  <span className="text-white font-bold text-xs leading-tight drop-shadow-md">COACH FIT</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Video Player Section */}
      <section className="bg-[#F9F9F9] py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 grid lg:grid-cols-2 gap-16 items-center">
          <div className="space-y-6 order-2 lg:order-1">
            <p className="text-[#FF4500] font-bold tracking-wide uppercase text-sm">
              PLAYER ABOVE
            </p>
            <h2 className="text-4xl lg:text-5xl font-medium tracking-tight text-neutral-900 leading-tight">
              A única área de membros com o seu próprio player de vídeo integrado
            </h2>
            <p className="text-lg text-neutral-600 max-w-lg leading-relaxed">
              O teu conteúdo em qualquer dispositivo, do telemóvel à TV, protegido 24/7. Com uma equipa totalmente dedicada à Academia, garantimos a estabilidade e segurança do teu conteúdo: sistema anti-fraude, encriptação e marca de água.
            </p>
            <div className="pt-4">
              <a href="/admin/products" className="font-bold text-lg hover:underline underline-offset-4 decoration-2" style={{ color: primaryColor }}>
                Adicionar conteúdo ao Player →
              </a>
            </div>
          </div>
          <div className="relative order-1 lg:order-2 flex justify-center lg:justify-start">
             <div className="relative w-full max-w-md">
                <div className="bg-black rounded-[2rem] p-4 shadow-2xl">
                   <div className="aspect-[9/16] bg-neutral-900 rounded-xl overflow-hidden relative">
                      <img src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600&auto=format&fit=crop" alt="Fitness video playing" className="w-full h-full object-cover opacity-80" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                      
                      {/* Fake Player UI */}
                      <div className="absolute bottom-6 left-6 right-6">
                         <h3 className="text-white font-bold text-xl mb-1">Life Fitness Method</h3>
                         <p className="text-white/70 text-sm mb-4">Treino Diário</p>
                         <div className="h-1 bg-white/30 rounded-full overflow-hidden">
                           <div className="h-full w-1/3" style={{ backgroundColor: primaryColor }}></div>
                         </div>
                         <div className="flex justify-between items-center mt-2 text-white/70 text-xs font-medium">
                           <span>00:40</span>
                           <span>12:00</span>
                         </div>
                      </div>
                   </div>
                </div>
                {/* Floating Play Button */}
                <div className="absolute top-1/2 -left-12 -translate-y-1/2 bg-white w-24 h-24 rounded-2xl shadow-xl flex items-center justify-center border border-neutral-100 hidden sm:flex">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" className="text-[#FF4500] ml-1">
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

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Testimonial 1 */}
          <div className="flex flex-col border-l border-neutral-200 pl-6 space-y-6">
            <svg className="w-8 h-8 text-[#FF4500]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="text-neutral-700 leading-relaxed text-sm flex-1">
              Existe um ditado no mercado que diz que é muito mais fácil vender a quem já é teu cliente, e a Academia é essa ferramenta porque a pessoa já está a viver a experiência de ser aluno. Não preciso de provar muito sobre o meu produto; eles estão à espera da próxima oferta. A <span className="font-bold">Academia dá-me essa facilidade e rapidez para adquirir o próximo produto num só clique.</span>
            </p>
            <div className="flex items-center gap-3 pt-4">
              <img src="https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=150&auto=format&fit=crop" alt="Tiago" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="font-bold text-neutral-900 text-sm">Tiago Ribeiro</p>
                <p className="text-neutral-500 text-xs">TR Jurídico</p>
              </div>
            </div>
          </div>

          {/* Testimonial 2 */}
          <div className="flex flex-col border-l border-neutral-200 pl-6 space-y-6">
             <svg className="w-8 h-8 text-[#FF4500]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="text-neutral-700 leading-relaxed text-sm flex-1">
              Vejo a Academia ABOVE como um grande diferencial. Primeiro, devido ao custo-benefício.<br/><br/>
              Se comparares com outras plataformas, <span className="font-bold">vais acabar com um custo muito mais elevado noutro lado.</span> Na minha opinião, o custo-benefício da ABOVE é o melhor hoje em dia.
            </p>
            <div className="flex items-center gap-3 pt-4">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=150&auto=format&fit=crop" alt="Vitor" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="font-bold text-neutral-900 text-sm">Vítor Santos</p>
                <p className="text-neutral-500 text-xs">Metaforando</p>
              </div>
            </div>
          </div>

          {/* Testimonial 3 */}
          <div className="flex flex-col border-l border-neutral-200 pl-6 space-y-6">
             <svg className="w-8 h-8 text-[#FF4500]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="text-neutral-700 leading-relaxed text-sm flex-1">
              A qualidade de entrega que a plataforma oferece é sem precedentes. <br/><br/>
              Consigo reter pelo menos <span className="font-bold">80 a 90% dos meus alunos ativos</span> através das funcionalidades de engajamento nativas.<br/><br/>
              É um nível completamente diferente.
            </p>
            <div className="flex items-center gap-3 pt-4">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop" alt="Diogo" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="font-bold text-neutral-900 text-sm">Diogo Mendes</p>
                <p className="text-neutral-500 text-xs">Docis</p>
              </div>
            </div>
          </div>

          {/* Testimonial 4 */}
          <div className="flex flex-col border-l border-neutral-200 pl-6 space-y-6">
             <svg className="w-8 h-8 text-[#FF4500]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
            </svg>
            <p className="text-neutral-700 leading-relaxed text-sm flex-1">
              A nova experiência da Academia ABOVE está praticamente ao mesmo nível que outras plataformas que cobram balúrdios por isso.<br/><br/>
              Exceto que a ABOVE apenas cobra por transação, o que sai <span className="font-bold">muito mais barato</span> do que pagar mensalidades fixas.<br/><br/>
              Se pudesse dar um conselho a quem não usa a Academia, seria para experimentar antes de qualquer outra.
            </p>
            <div className="flex items-center gap-3 pt-4">
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=150&auto=format&fit=crop" alt="Martin" className="w-10 h-10 rounded-full object-cover" />
              <div>
                <p className="font-bold text-neutral-900 text-sm">Martin Silva</p>
                <p className="text-neutral-500 text-xs">Ben Zruel</p>
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
