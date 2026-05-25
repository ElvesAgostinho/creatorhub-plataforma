import Link from "next/link"
import { createServiceClient } from "@/lib/supabase/server"

export const dynamic = "force-dynamic"

export default async function BlogPage() {
  const svc = createServiceClient()
  
  // Fetch recent articles
  const { data: articles } = await svc
    .from("resources")
    .select("*")
    .eq("type", "article")
    .order("published_at", { ascending: false })
    .limit(4)

  // Fetch ebooks and templates
  const { data: freeResources } = await svc
    .from("resources")
    .select("*")
    .in("type", ["ebook", "template"])
    .order("published_at", { ascending: false })
    .limit(3)

  return (
    <main className="w-full bg-white text-neutral-900 font-sans mt-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative w-full bg-[#0A0A0A] overflow-hidden min-h-[500px] flex items-center">
        {/* Abstract background blobs */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[120%] bg-gradient-to-r from-[#FF4500]/20 to-transparent blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[100%] bg-gradient-to-l from-[#FF4500]/10 to-transparent blur-[100px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 py-20 flex flex-col md:flex-row items-center gap-12 relative z-10 w-full">
          <div className="w-full md:w-1/2">
            <p className="text-sm font-bold text-[#FF4500] uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="w-8 h-[2px] bg-[#FF4500]"></span> Para Criadores
            </p>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight">
              Tudo o que <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4500] to-orange-400">precisas de saber</span> para vender online!
            </h1>
            <p className="text-xl text-neutral-400 mb-8 leading-relaxed font-medium">
              A ABOVE é a plataforma líder que oferece aos criadores de conteúdo todas as ferramentas necessárias para ter sucesso na economia digital.
            </p>
            <div className="flex items-center gap-4">
              <a href="#artigos" className="bg-[#FF4500] hover:bg-[#E03E00] text-white px-8 py-4 rounded-full font-bold transition shadow-lg shadow-[#FF4500]/20">
                Ler Artigos
              </a>
              <button className="text-white hover:text-[#FF4500] px-6 py-4 font-bold transition flex items-center gap-2">
                Recursos Gratuitos
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
              </button>
            </div>
          </div>
          <div className="w-full md:w-1/2 relative">
            <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-[#FF4500]/10 border border-white/10 group">
              <img 
                src="/premium_creator_blog.png" 
                alt="Creators working" 
                className="w-full h-auto object-cover scale-100 group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
            </div>
            
            {/* Floating badge */}
            <div className="absolute -bottom-6 -left-6 bg-white/10 backdrop-blur-xl border border-white/20 p-4 rounded-2xl shadow-xl animate-bounce" style={{ animationDuration: '3s' }}>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-[#FF4500] rounded-full flex items-center justify-center text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Dicas Premium</p>
                  <p className="text-neutral-400 text-xs">+100 Artigos</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. HOW TO START - DARK SECTION */}
      <section className="bg-[#1A1A1A] text-white py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12">
            <div>
              <h2 className="text-[#FF4500] text-sm font-bold uppercase tracking-wider mb-2">How to start your online business</h2>
              <p className="text-xl">Descobre os primeiros passos para tirar esse plano do papel!</p>
            </div>
            <div className="mt-6 md:mt-0 flex text-sm">
              <button className="bg-white text-black px-4 py-2 font-semibold">Para Criadores</button>
              <button className="bg-transparent border border-neutral-600 text-white px-4 py-2 hover:bg-neutral-800">Para Afiliados</button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { num: "1", title: "Se estás a começar, o primeiro passo é escolher um nicho!", desc: "A partir daí, faz uma pesquisa de mercado para encontrar as melhores oportunidades." },
              { num: "2", title: "Conhece quem vai aprender com o teu conteúdo.", desc: "Cria uma persona que represente o cliente ideal do teu negócio." },
              { num: "3", title: "Escolhe o tipo de produto digital que queres criar.", desc: "Descobre mais sobre os tipos de produtos que podes vender online." },
              { num: "4", title: "Prospera como criador digital!", desc: "Aprende a fazer crescer a tua audiência e a transformá-la em compradores." },
            ].map((step, idx) => (
              <div key={idx} className="border border-neutral-700 p-8 hover:border-neutral-500 transition">
                <div className="text-3xl font-bold mb-4">{step.num}</div>
                <h3 className="text-lg font-bold mb-4 leading-snug">{step.title}</h3>
                <p className="text-sm text-neutral-400">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. SIGN UP FORM - DARK SECTION */}
      <section className="bg-[#222] text-white py-20 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-16">
          <div className="w-full md:w-1/2">
            <h2 className="text-4xl sm:text-5xl font-extrabold leading-tight mb-6">
              Nunca foi tão fácil transformar o que sabes num negócio digital.
            </h2>
            <p className="text-xl text-neutral-300">
              Nós vamos ajudar-te desde os primeiros passos. Regista-te gratuitamente.
            </p>
          </div>
          <div className="w-full md:w-1/2 max-w-md">
            <form className="flex flex-col gap-4">
              <input type="text" placeholder="Insere o teu nome completo" className="w-full bg-transparent border border-neutral-600 px-4 py-3 text-white placeholder-neutral-500 focus:border-white outline-none rounded-none" />
              <input type="email" placeholder="Insere o teu email" className="w-full bg-transparent border border-neutral-600 px-4 py-3 text-white placeholder-neutral-500 focus:border-white outline-none rounded-none" />
              <input type="password" placeholder="Insere a tua password" className="w-full bg-transparent border border-neutral-600 px-4 py-3 text-white placeholder-neutral-500 focus:border-white outline-none rounded-none" />
              <div className="flex items-start gap-3 mt-2 text-xs text-neutral-400">
                <input type="checkbox" className="mt-1" />
                <p>Ao clicares aqui, confirmas que leste e aceitas os Termos de Uso e Políticas da plataforma.</p>
              </div>
              <button type="button" className="bg-[#00A859] hover:bg-[#00914D] text-white font-bold text-lg py-3 mt-4 transition rounded-none">
                Criar Conta
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* 4. SPLIT SECTION - FREE RESOURCES */}
      <section className="w-full flex flex-col lg:flex-row min-h-[500px]">
        {/* Left Side (Gray) */}
        <div className="w-full lg:w-1/2 bg-[#E9ECEF] flex items-center justify-center lg:justify-end p-12 lg:pr-24">
          <div className="max-w-sm">
            <h3 className="text-[#FF4500] text-sm font-bold uppercase tracking-wide mb-4">Recursos Gratuitos</h3>
            <h2 className="text-4xl lg:text-5xl font-extrabold text-[#111] leading-tight mb-10">
              Materiais para guiar a escalabilidade do teu negócio
            </h2>
            <a href="#" className="text-[#FF4500] text-sm font-bold uppercase tracking-wide hover:underline">Ver Todos</a>
          </div>
        </div>
        
        {/* Right Side (Orange) */}
        <div className="w-full lg:w-1/2 bg-[#FF4500] flex items-center justify-center lg:justify-start p-12 lg:pl-24 text-white">
          <div className="flex flex-col gap-10 max-w-sm">
            {freeResources && freeResources.length > 0 ? (
              freeResources.map((res, i) => (
                <div key={i} className="flex gap-6 items-start">
                  <div className="w-10 h-10 border-2 border-white rounded opacity-80 flex-shrink-0 flex items-center justify-center font-serif font-bold">R</div>
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-90 block mb-1">{res.type}</span>
                    <a href={res.external_link || "#"} target="_blank" className="text-2xl font-bold leading-tight hover:underline">
                      {res.title}
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <div className="opacity-80">Nenhum recurso disponível no momento. (Adiciona no painel admin)</div>
            )}
          </div>
        </div>
      </section>

      {/* 5. LATEST ARTICLES */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-widest mb-6">Últimos Artigos em:</h3>
          <div className="flex flex-wrap justify-center gap-4">
            <button className="bg-[#FF4500] text-white px-6 py-2 rounded-full font-bold text-sm">Marketing Digital</button>
            <button className="border border-[#FF4500] text-[#FF4500] px-6 py-2 rounded-full font-bold text-sm hover:bg-[#FF4500]/10">Empreendedorismo</button>
            <button className="border border-[#FF4500] text-[#FF4500] px-6 py-2 rounded-full font-bold text-sm hover:bg-[#FF4500]/10">Afiliados</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
          {articles && articles.length > 0 ? (
            articles.map((article, i) => (
              <a key={i} href={article.external_link || "#"} target="_blank" className="group cursor-pointer block">
                <div className="w-full h-56 bg-neutral-200 mb-4 overflow-hidden">
                  {article.cover_image_url ? (
                    <img src={article.cover_image_url} alt={article.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                  ) : (
                    <div className="w-full h-full bg-neutral-200 flex items-center justify-center text-neutral-400">Sem Imagem</div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs font-bold uppercase mb-2">
                  <span className="text-neutral-500">{new Date(article.published_at || article.created_at).toLocaleDateString("pt-PT")}</span>
                  <span className="text-neutral-300">•</span>
                  <span className="text-[#FF4500]">{article.category || 'Geral'}</span>
                </div>
                <h3 className="text-2xl font-bold text-neutral-900 leading-snug group-hover:text-[#FF4500] transition">
                  {article.title}
                </h3>
              </a>
            ))
          ) : (
            <div className="col-span-full text-center text-neutral-500 py-10">
              Ainda não existem artigos publicados no blog. Vai ao Painel de Admin para adicionar o teu primeiro artigo!
            </div>
          )}
        </div>
      </section>

    </main>
  )
}
