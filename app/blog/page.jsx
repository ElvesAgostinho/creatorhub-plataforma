import Link from "next/link"
import Image from "next/image"
import { createServiceClient } from "@/lib/supabase/server"

// Cache dinâmico para garantir alta performance no Cloudflare (revalida a cada minuto)
export const revalidate = 60

export default async function BlogPage() {
  const svc = createServiceClient()
  
  // Fetch recent articles
  const { data: articles } = await svc
    .from("resources")
    .select("*")
    .eq("type", "article")
    .order("published_at", { ascending: false })
    .limit(6)

  // Fetch ebooks and templates
  const { data: freeResources } = await svc
    .from("resources")
    .select("*")
    .in("type", ["ebook", "template"])
    .order("published_at", { ascending: false })
    .limit(4)

  return (
    <main className="w-full bg-[#050505] text-neutral-100 font-sans min-h-screen">
      
      {/* 1. HERO SECTION (ULTRA PREMIUM) */}
      <section className="relative w-full overflow-hidden min-h-[600px] flex items-center pt-24 pb-20 border-b border-neutral-900">
        {/* Subtle glowing orbs */}
        <div className="absolute top-0 left-1/4 w-[40%] h-[40%] bg-[#FF4500]/10 blur-[150px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-1/4 w-[30%] h-[50%] bg-[#FF4500]/5 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16 relative z-10 w-full">
          <div className="w-full lg:w-1/2">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 mb-6 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-[#FF4500] animate-pulse"></span>
              <span className="text-xs font-bold text-neutral-300 uppercase tracking-widest">Inovação e Estratégia</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-white leading-[1.1] mb-6 tracking-tight">
              O Diário do <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4500] to-orange-300">Criador de Elite</span>
            </h1>
            
            <p className="text-lg md:text-xl text-neutral-400 mb-10 leading-relaxed font-light max-w-lg">
              Estratégias de monetização, guias de conversão e insights de mercado para quem trata a criação de conteúdo como um negócio sério.
            </p>
            
            <div className="flex flex-wrap items-center gap-4">
              <a href="#artigos" className="bg-white hover:bg-neutral-200 text-black px-8 py-4 rounded-xl font-bold transition shadow-[0_0_20px_rgba(255,255,255,0.1)]">
                Explorar Artigos
              </a>
              <a href="#recursos" className="bg-[#FF4500]/10 border border-[#FF4500]/30 hover:bg-[#FF4500]/20 text-[#FF4500] px-8 py-4 rounded-xl font-bold transition backdrop-blur-md">
                Recursos Premium
              </a>
            </div>
          </div>
          
          <div className="w-full lg:w-1/2 relative hidden md:block">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-black/50 border border-white/10 aspect-[4/3] group">
              <Image 
                src="https://images.unsplash.com/photo-1542744173-8e7e53415bb0?q=80&w=1200&auto=format&fit=crop" 
                alt="Business strategy" 
                fill
                priority
                className="object-cover scale-100 group-hover:scale-105 transition-transform duration-1000"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/20 to-transparent"></div>
            </div>
            
            {/* Floating glass badge */}
            <div className="absolute -bottom-8 -left-8 bg-[#111]/80 backdrop-blur-xl border border-white/10 p-5 rounded-2xl shadow-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-br from-[#FF4500] to-orange-500 rounded-xl flex items-center justify-center text-white shadow-lg">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                </div>
                <div>
                  <p className="text-white font-bold text-sm">Alto Impacto</p>
                  <p className="text-neutral-400 text-xs mt-0.5">Metodologias Validadas</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE PATH TO SUCCESS - PREMIUM GRID */}
      <section className="py-24 px-6 bg-[#0A0A0A] border-b border-neutral-900 relative">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16">
            <div className="max-w-2xl">
              <h2 className="text-[#FF4500] text-xs font-bold uppercase tracking-[0.2em] mb-3">O Caminho do Sucesso</h2>
              <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">Metodologia comprovada para escalar o teu projeto do zero ao topo.</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { num: "01", title: "Definição de Nicho", desc: "Mapeamento cirúrgico de audiências lucrativas e oportunidades inexploradas." },
              { num: "02", title: "Posicionamento", desc: "Construção de autoridade e diferenciação num mercado saturado." },
              { num: "03", title: "Produto Digital", desc: "Criação de ofertas irresistíveis de alto valor percebido." },
              { num: "04", title: "Escala & Vendas", desc: "Sistemas de automação e tráfego para gerar receita diária." },
            ].map((step, idx) => (
              <div key={idx} className="bg-[#111] border border-neutral-800 rounded-2xl p-8 hover:border-[#FF4500]/50 transition-colors group relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-5 font-black text-6xl text-white group-hover:scale-110 transition-transform">{step.num}</div>
                <div className="text-[#FF4500] font-bold text-lg mb-6">{step.num}</div>
                <h4 className="text-xl font-bold mb-3 text-white">{step.title}</h4>
                <p className="text-sm text-neutral-400 leading-relaxed font-light">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. ARTICLES GRID - EDITORIAL DESIGN */}
      <section id="artigos" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
          <div>
            <h2 className="text-[#FF4500] text-xs font-bold uppercase tracking-[0.2em] mb-3">Editorial</h2>
            <h3 className="text-3xl md:text-4xl font-bold text-white leading-tight">Últimas Publicações</h3>
          </div>
          <div className="flex gap-3">
            <button className="bg-white text-black px-5 py-2 rounded-full font-bold text-xs tracking-wider">Tudo</button>
            <button className="border border-neutral-800 text-neutral-400 px-5 py-2 rounded-full font-bold text-xs tracking-wider hover:text-white hover:border-neutral-600 transition">Estratégia</button>
            <button className="border border-neutral-800 text-neutral-400 px-5 py-2 rounded-full font-bold text-xs tracking-wider hover:text-white hover:border-neutral-600 transition">Vendas</button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
          {articles && articles.length > 0 ? (
            articles.map((article, i) => (
              <a key={i} href={article.external_link || "#"} target="_blank" className="group cursor-pointer block flex flex-col h-full">
                <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden bg-neutral-900 mb-6 relative border border-neutral-800">
                  {article.cover_image_url ? (
                    <Image 
                      src={article.cover_image_url} 
                      alt={article.title} 
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-700" 
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-neutral-700 font-mono text-sm">Sem Capa</div>
                  )}
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                
                <div className="flex items-center gap-3 text-xs font-bold uppercase tracking-wider mb-3">
                  <span className="text-[#FF4500] bg-[#FF4500]/10 px-3 py-1 rounded-full">{article.category || 'Geral'}</span>
                  <span className="text-neutral-500">{new Date(article.published_at || article.created_at).toLocaleDateString("pt-PT")}</span>
                </div>
                
                <h4 className="text-2xl font-bold text-white leading-[1.3] group-hover:text-[#FF4500] transition-colors mb-3">
                  {article.title}
                </h4>
                
                <div className="mt-auto pt-4 flex items-center gap-2 text-sm font-bold text-neutral-400 group-hover:text-white transition-colors">
                  Ler artigo 
                  <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                </div>
              </a>
            ))
          ) : (
            <div className="col-span-full flex flex-col items-center justify-center py-20 bg-[#111] rounded-3xl border border-neutral-800">
              <svg className="w-12 h-12 text-neutral-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10l6 6v10a2 2 0 01-2 2z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M14 2v6h6M16 13H8M16 17H8M10 9H8"></path></svg>
              <p className="text-neutral-500 font-medium">Os artigos editoriais estão a ser preparados.</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. PREMIUM CTA - REPLACING THE UGLY FORM */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto relative rounded-3xl overflow-hidden">
          {/* Background image for CTA */}
          <div className="absolute inset-0 bg-[#FF4500]">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1600&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
            <div className="absolute inset-0 bg-gradient-to-r from-black/90 to-black/60"></div>
          </div>
          
          <div className="relative z-10 p-12 md:p-20 flex flex-col items-center text-center">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight max-w-3xl">
              Pronto para construir o teu império digital?
            </h2>
            <p className="text-lg text-neutral-300 mb-10 max-w-2xl font-light">
              Junta-te aos criadores de topo. Transforma o teu conhecimento numa plataforma rentável, escalável e de alto prestígio com a ABOVE.
            </p>
            <Link href="/signup" className="bg-white hover:bg-neutral-200 text-black px-10 py-5 rounded-xl font-bold text-lg transition-transform hover:scale-105 flex items-center gap-3">
              Criar Conta Gratuita
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
            </Link>
            <p className="text-sm text-neutral-500 mt-6 font-medium">Não requer cartão de crédito. Começa em 2 minutos.</p>
          </div>
        </div>
      </section>

      {/* 5. FREE RESOURCES - MINIMALIST LIST */}
      <section id="recursos" className="py-20 px-6 bg-[#0A0A0A] border-t border-neutral-900">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
          <div className="w-full lg:w-1/3">
            <h2 className="text-[#FF4500] text-xs font-bold uppercase tracking-[0.2em] mb-3">Biblioteca Exclusiva</h2>
            <h3 className="text-3xl font-bold text-white leading-tight mb-6">Recursos para acelerar os teus resultados.</h3>
            <p className="text-neutral-400 text-sm font-light leading-relaxed mb-8">
              Acedemos aos bastidores dos negócios que mais faturam e transformamos essas estratégias em ferramentas práticas que podes usar hoje mesmo.
            </p>
          </div>
          
          <div className="w-full lg:w-2/3 flex flex-col gap-4">
            {freeResources && freeResources.length > 0 ? (
              freeResources.map((res, i) => (
                <a key={i} href={res.external_link || "#"} target="_blank" className="flex items-center gap-6 p-6 rounded-2xl bg-[#111] border border-neutral-800 hover:border-neutral-600 hover:bg-[#151515] transition group">
                  <div className="w-14 h-14 bg-neutral-900 border border-neutral-700 rounded-xl flex items-center justify-center shrink-0 group-hover:border-[#FF4500] group-hover:text-[#FF4500] transition-colors text-white">
                    {res.type === 'ebook' ? (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.25278V19.2528M12 6.25278C10.8321 5.47727 9.24649 5 7.5 5C5.75351 5 4.16789 5.47727 3 6.25278V19.2528C4.16789 18.4773 5.75351 18 7.5 18C9.24649 18 10.8321 18.4773 12 19.2528M12 6.25278C13.1679 5.47727 14.7535 5 16.5 5C18.2465 5 19.8321 5.47727 21 6.25278V19.2528C19.8321 18.4773 18.2465 18 16.5 18C14.7535 18 13.1679 18.4773 12 19.2528"></path></svg>
                    ) : (
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 7H5A2 2 0 003 9v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4"></path></svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#FF4500] mb-1 block">{res.type}</span>
                    <h4 className="text-lg font-bold text-white group-hover:text-neutral-200">{res.title}</h4>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center text-neutral-400 group-hover:bg-white group-hover:text-black transition-colors shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3"></path></svg>
                  </div>
                </a>
              ))
            ) : (
              <div className="p-8 text-center text-neutral-500 border border-neutral-800 rounded-2xl border-dashed">
                Os recursos premium estarão disponíveis brevemente.
              </div>
            )}
          </div>
        </div>
      </section>

    </main>
  )
}
