"use client"
import TypewriterText from "@/components/TypewriterText"
import Image from "next/image"

export default function LandingPage({ user }) {
  return (
    <div className="bg-[#111111] text-white min-h-screen font-sans">
      
      {/* 1. HERO SECTION (LIGHT - HOTMART STYLE) */}
      <section className="bg-white border-b border-neutral-200 overflow-hidden relative">
        <div className="max-w-7xl mx-auto px-6 pt-32 lg:pt-40 pb-16 lg:pb-24 flex flex-col lg:flex-row items-center justify-between min-h-[450px] lg:min-h-[550px]">
          
          {/* TEXT (LEFT) */}
          <div className="w-full lg:w-1/2 z-10 lg:pr-12 text-center lg:text-left pb-8 lg:pb-0">
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight text-[#111] min-h-[110px] sm:min-h-[150px]">
              <TypewriterText text="O teu conhecimento," speed={40} delay={100} hideCursorOnFinish={true} /><br className="hidden sm:block"/>
              <span className="text-[#FF4500]">
                <TypewriterText text="transformado num negócio." speed={50} delay={1100} hideCursorOnFinish={true} />
              </span>
            </h1>
            
            <p className="mt-6 text-lg text-neutral-600 max-w-xl mx-auto lg:mx-0 font-medium min-h-[80px]">
              <TypewriterText text="Cria, vende e entrega cursos online, livros digitais e mentorias. A plataforma mais completa de Angola para criadores de conteúdo que querem escalar os seus resultados." speed={20} delay={2200} />
            </p>
            
            <div className="mt-10 flex flex-col items-center lg:items-start gap-6">
              <div className="flex gap-4">
                {user ? (
                  <a href="/dashboard" className="bg-[#FF4500] hover:bg-[#E03E00] text-white text-lg font-bold px-10 py-4 rounded-xl transition shadow-lg shadow-[#FF4500]/20">
                    Aceder ao Painel
                  </a>
                ) : (
                  <a href="/signup" className="bg-[#FF4500] hover:bg-[#E03E00] text-white text-lg font-bold px-10 py-4 rounded-xl transition shadow-lg shadow-[#FF4500]/20">
                    Começar a Vender Agora
                  </a>
                )}
              </div>
              
              {/* Trust Badges */}
              <div className="flex items-center justify-center lg:justify-start gap-4 text-[11px] sm:text-xs font-bold text-neutral-500">
                <span className="flex items-center gap-1.5"><span className="w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center">✓</span> Sem taxas ocultas</span>
                <span className="flex items-center gap-1.5"><span className="w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center">✓</span> Suporte 24/7</span>
                <span className="flex items-center gap-1.5"><span className="w-4 h-4 bg-green-100 text-green-600 rounded-full flex items-center justify-center">✓</span> Setup em 5 min</span>
              </div>
            </div>
          </div>
          
          {/* CINEMATIC ANIMATED HERO (RIGHT - STUCK TO TOP) */}
          <div className="w-full lg:w-1/2 lg:absolute lg:top-0 lg:right-0 lg:h-full flex items-start justify-end mt-8 lg:mt-0 overflow-hidden">
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes cinematic-pan {
                0% { transform: scale(1.05) translate(0, 0); }
                50% { transform: scale(1.1) translate(-2%, 2%); }
                100% { transform: scale(1.05) translate(0, 0); }
              }
              .animate-cinematic {
                animation: cinematic-pan 20s ease-in-out infinite;
              }
            `}} />
            <div className="relative w-full max-w-[600px] lg:max-w-none lg:w-[110%] h-[350px] lg:h-[110%] lg:translate-x-12 rounded-l-3xl lg:rounded-none shadow-2xl lg:shadow-none overflow-hidden">
              <Image 
                src="/hero_sales_mobile.png" 
                alt="Plataforma Integrada" 
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center animate-cinematic"
              />
            </div>
          </div>

        </div>
      </section>

      {/* 1.5 COMO FUNCIONA */}
      <section className="bg-[#FAFAFA] border-b border-neutral-200 py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111] mb-4">Como funciona a ABOVE?</h2>
            <p className="text-neutral-500 text-lg max-w-2xl mx-auto">Tudo o que precisas para transformar o teu conhecimento num negócio altamente rentável em apenas 3 passos.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-10">
            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm text-center relative hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-[#FF4500]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-black text-[#FF4500]">1</span>
              </div>
              <h3 className="text-xl font-bold text-[#111] mb-3">Cria o teu produto</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">Faz o upload das tuas aulas em vídeo, e-book em PDF ou define a tua mentoria em poucos minutos.</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm text-center relative hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-[#FF4500]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-black text-[#FF4500]">2</span>
              </div>
              <h3 className="text-xl font-bold text-[#111] mb-3">Vende com facilidade</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">Usa o nosso checkout de alta conversão. Aceitamos pagamentos locais e internacionais automaticamente.</p>
            </div>
            
            <div className="bg-white p-8 rounded-3xl border border-neutral-200 shadow-sm text-center relative hover:-translate-y-2 transition-transform duration-300">
              <div className="w-16 h-16 bg-[#FF4500]/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <span className="text-2xl font-black text-[#FF4500]">3</span>
              </div>
              <h3 className="text-xl font-bold text-[#111] mb-3">Entrega premium</h3>
              <p className="text-neutral-500 text-sm leading-relaxed">Os teus alunos acedem a uma área de membros de classe mundial com gamificação e certificados profissionais.</p>
            </div>
          </div>
        </div>
      </section>

      {/* 2. FEATURES GRID (DARK) */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <div className="grid md:grid-cols-2 gap-6">
          
          {/* Foca-te no conteúdo */}
          <div className="bg-[#1A1A1A] border border-neutral-800 rounded-3xl p-10 flex flex-col justify-end min-h-[400px]">
            <h2 className="text-4xl font-extrabold mb-4">
              Tu focas-te no conteúdo.<br/>Nós aumentamos as tuas conversões.
            </h2>
            <div className="mt-6">
              {user ? (
                <a href="/become-creator" className="bg-[#FF4500] hover:bg-[#E03E00] text-white font-bold px-6 py-3 rounded-xl inline-block transition">Tornar-se Criador</a>
              ) : (
                <a href="/signup" className="bg-[#FF4500] hover:bg-[#E03E00] text-white font-bold px-6 py-3 rounded-xl inline-block transition">Começar a vender mais</a>
              )}
            </div>
          </div>

          {/* Checkout */}
          <div className="bg-[#1A1A1A] border border-neutral-800 rounded-3xl p-10 flex flex-col overflow-hidden relative">
            <h3 className="text-3xl font-extrabold mb-4 relative z-10">
              Aumenta vendas em 7% com<br/>preenchimento inteligente
            </h3>
            <p className="text-neutral-400 relative z-10 max-w-sm">
              Permite aos teus clientes comprar em segundos com o nosso checkout otimizado. Vendes mais sem esforço extra. Fácil para eles, rentável para ti.
            </p>
             {/* Floating mockups */}
             <div className="absolute -bottom-10 -right-20 lg:-right-10 flex gap-4 pointer-events-none">
               <Image src="/modern_checkout.png" alt="Checkout otimizado" width={300} height={400} className="w-[300px] h-auto object-cover rounded-tl-3xl shadow-2xl rotate-3 translate-x-4 border border-neutral-800" />
             </div>
          </div>

        </div>

        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Recomendamos */}
          <div className="bg-[#1A1A1A] border border-neutral-800 rounded-3xl p-8 flex flex-col">
            <h3 className="text-2xl font-extrabold mb-4">Nós recomendamos.<br/>Tu vendes mais.</h3>
            <p className="text-neutral-400 text-sm">
              Recomendações automáticas: quando um cliente compra, sugerimos logo o próximo produto. Aumenta o valor médio de encomenda em até 48%, em piloto automático.
            </p>
          </div>

          {/* Checkout que retém */}
          <div className="bg-[#1A1A1A] border border-neutral-800 rounded-3xl p-8 flex flex-col">
            <h3 className="text-2xl font-extrabold mb-4">Checkout que<br/>retém clientes.</h3>
            <p className="text-neutral-400 text-sm">
              Tu vendes mais, sem parar. O nosso checkout gere milhões de transações simultâneas e carrega num segundo, evitando que os clientes desistam.
            </p>
          </div>
        </div>
      </section>



      {/* 4. MEMBERS AREA (LIGHT) */}
      <section className="bg-[#F8F7F5] text-[#111111] py-24 px-6 rounded-t-[3rem]">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          
          <div>
            <div className="inline-block border border-neutral-300 rounded-full px-4 py-2 text-sm font-bold mb-6">
              Clientes felizes voltam sempre
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-8">
              Encanta os teus clientes com a nossa área de membros e aumenta as compras repetidas em até 14%.
            </h2>
            
            <div className="space-y-6">
              <div>
                <h4 className="text-xl font-bold text-[#FF4500] border-t-2 border-[#FF4500] pt-4 mb-2">Gamificação e personalização: torna o conteúdo irresistível.</h4>
                <p className="text-neutral-600">Escolhe entre mais de 20 estilos visuais e utiliza gamificação e tracking de progresso integrados para manteres os teus clientes motivados.</p>
              </div>
              <div>
                <h4 className="text-xl font-bold text-neutral-300 border-t-2 border-neutral-200 pt-4 mb-2">Suporte por IA que aprende contigo e nunca dorme.</h4>
              </div>
            </div>
          </div>

          <div className="relative">
             <div className="absolute -left-10 top-10 bg-white p-4 rounded-xl shadow-xl z-20 flex items-center gap-4">
                <div className="bg-[#FF4500] text-white p-2 rounded-lg">💬</div>
                <div>
                  <div className="text-xs text-neutral-500 font-bold">Taxa de Reembolso</div>
                  <div className="font-extrabold text-lg">-40% Pedidos</div>
                </div>
             </div>
             
             <div className="mt-8 rounded-2xl border border-neutral-200 overflow-hidden shadow-sm relative h-[300px] sm:h-[400px]">
               <Image src="/modern_members_area.png" alt="Área de Membros Premium" fill className="object-cover object-left-top" />
             </div>
          </div>
        </div>

        {/* 4. INTEGRATIONS & ANALYTICS */}
        <div className="max-w-7xl mx-auto grid md:grid-cols-3 gap-6 mt-32">
          
          <div className="bg-white rounded-3xl p-10 flex flex-col shadow-sm border border-neutral-200">
            <h3 className="text-3xl font-extrabold mb-4">Apoio especializado, exatamente quando precisas..</h3>
            <p className="text-neutral-600 mb-8">
              Os nossos especialistas conhecem o teu negócio e sabem como impulsioná-lo. Com o parceiro certo, vais mais longe.
            </p>
            <a href="/signup" className="text-[#FF4500] font-bold mt-auto inline-flex items-center gap-2 hover:underline">
              Regista-te agora →
            </a>
          </div>

          <div className="bg-white rounded-3xl p-8 flex flex-col shadow-sm border border-neutral-200">
            <div className="mb-6 rounded-2xl border border-neutral-200 relative overflow-hidden h-40 flex flex-col justify-center">
               <Image src="/modern_dashboard.png" alt="Analytics Dashboard" fill className="object-cover object-left-top" />
            </div>
            <h3 className="text-xl font-bold mb-2">Análises detalhadas</h3>
            <p className="text-neutral-600 text-sm">
              Relatórios personalizados para o teu negócio, sempre disponíveis para te focares no que importa.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 flex flex-col shadow-sm border border-neutral-200 justify-center gap-4">
             <div className="bg-neutral-50 border border-neutral-100 p-4 rounded-xl flex items-center gap-4 font-bold text-sm">
               <span className="text-[#FF4500] text-xl">✦</span> + Integra com Hubspot
             </div>
             <div className="bg-neutral-50 border border-neutral-100 p-4 rounded-xl flex items-center gap-4 font-bold text-sm">
               <span className="text-[#FF4500] text-xl">✦</span> + Integra com Mailchimp
             </div>
             <div className="bg-neutral-50 border border-neutral-100 p-4 rounded-xl flex items-center gap-4 font-bold text-sm">
               <span className="text-[#FF4500] text-xl">✦</span> + Integra com Zapier
             </div>
             <div className="bg-neutral-50 border border-neutral-100 p-4 rounded-xl flex items-center gap-4 font-bold text-sm">
               <span className="text-[#FF4500] text-xl">✦</span> + Integra com n8n
             </div>
          </div>

        </div>

        {/* SECÇÃO CERTIFICADO */}
        <div className="max-w-7xl mx-auto mt-32 bg-[#050505] rounded-[3rem] p-8 sm:p-16 flex flex-col lg:flex-row items-center gap-12 lg:gap-20 border border-neutral-800 shadow-2xl relative overflow-hidden">
          {/* Background Glow */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF4500]/20 blur-[120px] rounded-full pointer-events-none"></div>
          
          <div className="w-full lg:w-1/2 relative z-10">
            <div className="inline-block border border-[#FF4500]/30 bg-[#FF4500]/10 rounded-full px-4 py-2 text-sm font-bold mb-6 text-[#FF4500]">
              VALOR NO MERCADO
            </div>
            <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6 text-white">
              Certificação Profissional.<br/>
              <span className="text-neutral-400">Reconhecimento instantâneo.</span>
            </h2>
            <p className="text-neutral-400 text-lg mb-8 leading-relaxed">
              Todos os cursos concluídos geram automaticamente um certificado de altíssimo padrão, com estilo manual de assinatura. Os teus alunos poderão partilhá-lo no LinkedIn e validar o seu conhecimento perante o mercado com uma página de autenticação exclusiva da ABOVE.
            </p>
            <ul className="space-y-4 mb-10">
              <li className="flex items-center gap-3 font-medium text-neutral-300">
                <span className="text-[#FF4500]">✓</span> Gerado em PDF automaticamente no fim do curso
              </li>
              <li className="flex items-center gap-3 font-medium text-neutral-300">
                <span className="text-[#FF4500]">✓</span> Código QR de verificação de autenticidade
              </li>
              <li className="flex items-center gap-3 font-medium text-neutral-300">
                <span className="text-[#FF4500]">✓</span> Identidade Premium com estilo de assinatura à mão
              </li>
            </ul>
          </div>

          <div className="w-full lg:w-1/2 relative z-10 h-[300px] sm:h-[450px]">
            <Image 
              src="/certificate_filled_example.png" 
              alt="Certificado ABOVE Preenchido" 
              fill
              className="object-contain rounded-xl shadow-[0_0_50px_rgba(255,69,0,0.15)] border border-neutral-800 transition-transform duration-700 hover:scale-105" 
            />
          </div>
        </div>

      </section>

      {/* 5. TESTIMONAIS */}
      <section className="bg-white py-24 px-6 rounded-b-[3rem]">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#111] mb-4">O que dizem os nossos criadores</h2>
            <p className="text-neutral-500 text-lg max-w-2xl mx-auto">Junta-te a centenas de criadores que já transformaram o seu conhecimento em lucro com a ABOVE.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#FAFAFA] border border-neutral-200 p-8 rounded-3xl">
              <div className="flex text-yellow-400 mb-4 text-sm tracking-widest">★★★★★</div>
              <p className="text-neutral-700 italic mb-8 font-medium">"A facilidade de uso é incrível. Em 10 minutos tinha o meu e-book à venda. O checkout converte muito melhor do que a plataforma que usava antes e não tenho dores de cabeça."</p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center font-bold text-neutral-400">J</div>
                <div>
                  <div className="font-bold text-[#111] text-sm">João M.</div>
                  <div className="text-neutral-500 text-xs">Criador de Conteúdo</div>
                </div>
              </div>
            </div>
            
            <div className="bg-[#FAFAFA] border border-neutral-200 p-8 rounded-3xl">
              <div className="flex text-yellow-400 mb-4 text-sm tracking-widest">★★★★★</div>
              <p className="text-neutral-700 italic mb-8 font-medium">"O facto de ter pagamentos via multicaixa express e Unitel Money mudou o jogo para mim em Angola. As minhas vendas simplesmente duplicaram no primeiro mês de uso da plataforma."</p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center font-bold text-neutral-400">A</div>
                <div>
                  <div className="font-bold text-[#111] text-sm">Ana C.</div>
                  <div className="text-neutral-500 text-xs">Mentora de Finanças</div>
                </div>
              </div>
            </div>
            
            <div className="bg-[#FAFAFA] border border-neutral-200 p-8 rounded-3xl">
              <div className="flex text-yellow-400 mb-4 text-sm tracking-widest">★★★★★</div>
              <p className="text-neutral-700 italic mb-8 font-medium">"A área de membros é visualmente linda e os meus alunos adoram o sistema de XP e os certificados automáticos gerados. Poupou-me imenso trabalho manual de suporte."</p>
              <div className="flex items-center gap-4 mt-auto">
                <div className="w-12 h-12 bg-neutral-200 rounded-full flex items-center justify-center font-bold text-neutral-400">P</div>
                <div>
                  <div className="font-bold text-[#111] text-sm">Paulo S.</div>
                  <div className="text-neutral-500 text-xs">Especialista em Marketing</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto py-12 px-6 flex flex-col items-center border-t border-neutral-900 mt-20">
        <div className="flex items-center gap-2 text-neutral-500 font-medium text-sm hover:text-neutral-300 transition-colors cursor-default">
          <span>Protected by</span>
          <img 
            src="https://upload.wikimedia.org/wikipedia/commons/4/4b/Cloudflare_Logo.svg" 
            alt="Cloudflare" 
            className="h-5 opacity-100" 
          />
        </div>
      </footer>

    </div>
  )
}
