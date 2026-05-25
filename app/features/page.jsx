import { GraduationCap, ShieldCheck, CreditCard, Rocket, Users, Diamond, Target, Zap, BarChart } from "lucide-react"

export const metadata = {
  title: "O que inclui? — ABOVE Platform",
  description: "Descobre as vantagens exclusivas para Criadores de Conteúdo e Afiliados.",
}

export default function FeaturesPage() {
  return (
    <div className="bg-[#0A0A0A] min-h-screen text-white font-sans selection:bg-[#FF4500] selection:text-white pb-32">
      
      {/* HERO SECTION - TEXT LEFT, IMAGE RIGHT */}
      <section className="relative pt-32 pb-24 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-20">
          
          <div className="w-full lg:w-1/2 z-10 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm font-medium text-neutral-300 mb-8 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#FF4500] animate-pulse"></span>
              A plataforma definitiva
            </div>
            
            <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8">
              Tudo o que precisas para <span className="text-[#FF4500]">escalar</span> o teu negócio.
            </h1>
            
            <p className="text-xl text-neutral-400 mb-10 max-w-2xl leading-relaxed">
              Não precisas de pagar dezenas de ferramentas separadas. A ABOVE unifica alojamento, pagamentos, proteção e comunidade num único ecossistema desenhado para maximizar o teu lucro.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <a href="/signup" className="bg-[#FF4500] hover:bg-[#E03E00] text-white font-bold px-8 py-4 rounded-xl text-lg transition text-center shadow-lg shadow-[#FF4500]/20">
                Sou Criador
              </a>
              <a href="#affiliates" className="bg-white/10 hover:bg-white/15 text-white font-bold px-8 py-4 rounded-xl text-lg transition border border-white/10 backdrop-blur-md text-center">
                Sou Afiliado
              </a>
            </div>
          </div>

          <div className="w-full lg:w-1/2 lg:absolute lg:top-0 lg:right-0 lg:h-full lg:w-[45vw] mt-8 lg:mt-0 z-0">
            {/* Glow effect */}
            <div className="absolute inset-0 bg-[#FF4500]/20 blur-[100px] rounded-full -z-10 hidden lg:block"></div>
            <img 
              src="/features_hero_black.png" 
              alt="Profissional ABOVE" 
              className="w-full h-full object-cover lg:rounded-none lg:rounded-bl-[4rem] rounded-3xl border-l-2 border-b-2 border-white/10 shadow-2xl shadow-[#FF4500]/10"
            />
          </div>

        </div>
      </section>

      {/* CREATORS SECTION - DYNAMIC CAROUSEL FOR SMALL SQUARES */}
      <section id="creators" className="py-24 px-6 max-w-7xl mx-auto overflow-hidden">
        <div className="mb-16">
          <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Para Criadores de Conteúdo</h2>
          <p className="text-neutral-400 text-lg max-w-3xl">Seja um curso, uma mentoria ou um e-book, tens a liberdade total para vender como quiseres, protegido pela melhor tecnologia.</p>
        </div>

        {/* CSS-only Infinite Scroll Carousel */}
        <div className="relative w-full flex overflow-x-hidden group">
          <div className="animate-marquee flex gap-6 whitespace-nowrap py-4">
            <FeatureCard icon={<GraduationCap className="w-6 h-6"/>} title="Academia Premium" description="Membros Netflix-style." />
            <FeatureCard icon={<ShieldCheck className="w-6 h-6"/>} title="Player Blindado" description="Sistema anti-fraude próprio." />
            <FeatureCard icon={<CreditCard className="w-6 h-6"/>} title="Pagamentos" description="Multibanco, MBWay, Cartão." />
            <FeatureCard icon={<Rocket className="w-6 h-6"/>} title="Funil 1 Clique" description="Upsells, Order Bumps." />
            <FeatureCard icon={<Users className="w-6 h-6"/>} title="Comunidade" description="Discord e WhatsApp." />
            <FeatureCard icon={<Diamond className="w-6 h-6"/>} title="Acesso Vitalício" description="Ferramentas completas." />
            {/* Duplicate for infinite loop */}
            <FeatureCard icon={<GraduationCap className="w-6 h-6"/>} title="Academia Premium" description="Membros Netflix-style." />
            <FeatureCard icon={<ShieldCheck className="w-6 h-6"/>} title="Player Blindado" description="Sistema anti-fraude próprio." />
            <FeatureCard icon={<CreditCard className="w-6 h-6"/>} title="Pagamentos" description="Multibanco, MBWay, Cartão." />
            <FeatureCard icon={<Rocket className="w-6 h-6"/>} title="Funil 1 Clique" description="Upsells, Order Bumps." />
            <FeatureCard icon={<Users className="w-6 h-6"/>} title="Comunidade" description="Discord e WhatsApp." />
            <FeatureCard icon={<Diamond className="w-6 h-6"/>} title="Acesso Vitalício" description="Ferramentas completas." />
          </div>
        </div>
      </section>

      {/* AFFILIATES SECTION */}
      <section id="affiliates" className="py-24 px-6 max-w-7xl mx-auto mt-12 border-t border-neutral-800">
        <div className="flex flex-col md:flex-row gap-16 items-center">
          <div className="w-full md:w-1/2">
            <h2 className="text-3xl md:text-5xl font-extrabold mb-6">Para Afiliados</h2>
            <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
              Queres faturar sem teres de gravar um único vídeo? A ABOVE tem os melhores produtos do mercado à tua espera. Pega no teu link, divulga e recebe a comissão automaticamente. Nós tratamos do resto.
            </p>
            
            <ul className="space-y-6">
              <li className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FF4500]/10 flex items-center justify-center shrink-0">
                  <Target className="text-[#FF4500] w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Rastreamento Impecável</h3>
                  <p className="text-neutral-500 text-sm">O nosso sistema garante que a comissão vai sempre para o afiliado certo.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FF4500]/10 flex items-center justify-center shrink-0">
                  <Zap className="text-[#FF4500] w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Pagamentos Automáticos</h3>
                  <p className="text-neutral-500 text-sm">O split de pagamento é automático no momento da venda.</p>
                </div>
              </li>
              <li className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-[#FF4500]/10 flex items-center justify-center shrink-0">
                  <BarChart className="text-[#FF4500] w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-1">Dashboard em Tempo Real</h3>
                  <p className="text-neutral-500 text-sm">Acompanha cliques, leads e comissões no teu painel.</p>
                </div>
              </li>
            </ul>

            <div className="mt-10">
              <a href="/marketplace" className="inline-flex items-center gap-2 text-[#FF4500] font-bold text-lg hover:underline underline-offset-8">
                Explorar o Marketplace 
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </a>
            </div>
          </div>
          <div className="w-full md:w-1/2">
             <div className="aspect-[4/5] bg-gradient-to-tr from-neutral-900 to-neutral-800 rounded-3xl border border-neutral-700 shadow-2xl relative overflow-hidden flex items-center justify-center p-8">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#FF4500] via-transparent to-transparent blur-2xl"></div>
                
                <div className="relative z-10 w-full space-y-4">
                   <div className="bg-black/50 backdrop-blur-xl border border-neutral-700/50 rounded-2xl p-6 shadow-xl">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-neutral-400 text-sm font-medium">Venda Concluída</span>
                        <span className="text-[#00A859] text-xs font-bold bg-[#00A859]/10 px-2 py-1 rounded">Aprovada</span>
                      </div>
                      <div className="text-3xl font-extrabold text-white mb-1">47.500 Kz</div>
                      <div className="text-xs text-neutral-500">Comissão de Afiliado (50%)</div>
                   </div>
                   
                   <div className="bg-black/50 backdrop-blur-xl border border-neutral-700/50 rounded-2xl p-6 shadow-xl opacity-70 scale-95 translate-x-4">
                      <div className="flex justify-between items-end mb-2">
                        <span className="text-neutral-400 text-sm font-medium">Venda Concluída</span>
                        <span className="text-[#00A859] text-xs font-bold bg-[#00A859]/10 px-2 py-1 rounded">Aprovada</span>
                      </div>
                      <div className="text-3xl font-extrabold text-white mb-1">149.000 Kz</div>
                      <div className="text-xs text-neutral-500">Comissão de Afiliado (40%)</div>
                   </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="py-24 px-6 max-w-4xl mx-auto text-center mt-12">
         <h2 className="text-4xl font-extrabold mb-6">Pronto para dominar o mercado?</h2>
         <p className="text-xl text-neutral-400 mb-10">Junta-te a milhares de infoprodutores e afiliados que já confiam na ABOVE.</p>
         <a href="/signup" className="inline-block bg-white text-black hover:bg-neutral-200 font-bold px-10 py-5 rounded-full text-xl transition shadow-xl">
            Criar a minha conta grátis
         </a>
      </section>

      {/* Add CSS for Marquee */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 20s linear infinite;
        }
        .group:hover .animate-marquee {
          animation-play-state: paused;
        }
      `}} />
    </div>
  )
}

function FeatureCard({ icon, title, description }) {
  return (
    <div className="bg-[#141414] border border-neutral-800 rounded-2xl p-6 hover:border-[#FF4500]/50 transition-colors w-64 min-w-[256px] flex-shrink-0 inline-flex flex-col whitespace-normal">
      <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-xl mb-4 text-[#FF4500]">
        {icon}
      </div>
      <h3 className="text-lg font-bold mb-2 text-white">{title}</h3>
      <p className="text-neutral-400 text-xs leading-relaxed">{description}</p>
    </div>
  )
}
