import ProductGrid from "@/components/ProductGrid"
import { getProducts, getFeaturedProducts } from "@/lib/data/products"
import { Search, Flame, Star, Clock } from "lucide-react"
import { categoryTree } from "@/lib/data/categories"

export const dynamic = "force-dynamic"

export default async function MarketplaceHome({ searchParams }) {
  const params = await searchParams;
  const typeFilter = params?.type
  const categoryFilter = params?.category
  const searchQuery = params?.q
  
  const all = await getProducts({ type: typeFilter, category: categoryFilter, search: searchQuery })
  const isFiltered = typeFilter || categoryFilter || searchQuery;

  // Derive "Mais Quentes", "Recomendados", "Recentes" for demo
  // In a real scenario we'd use actual sales data
  const maisQuentes = [...all].sort((a, b) => (b.students_count || 0) - (a.students_count || 0)).slice(0, 4);
  const recentes = [...all].sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)).slice(0, 4);
  const cursos = all.filter(p => p.type === 'course').slice(0, 4);
  const ebooks = all.filter(p => p.type === 'book').slice(0, 4);

  const typeLabels = {
    course: { title: "Cursos em Vídeo", subtitle: "Aprende ao teu próprio ritmo" },
    book: { title: "E-books / PDF", subtitle: "Material de leitura profunda" },
    mentorship: { title: "Mentorias 1:1", subtitle: "Sessões personalizadas" },
  }

  const categoryChips = [
    { label: "Negócios", icon: "💼", value: "Negócios" },
    { label: "Marketing", icon: "🚀", value: "Marketing e Vendas" },
    { label: "Programação", icon: "💻", value: "Tecnologia" },
    { label: "Saúde", icon: "🧘‍♀️", value: "Saúde e Desporto" },
    { label: "Design", icon: "🎨", value: "Design e Arte" },
  ]

  return (
    <div className="bg-[#F8F9FA] text-neutral-900 min-h-screen relative font-sans pb-20">
      
      {/* SEARCH HERO */}
      {!isFiltered && (
        <div className="bg-white border-b border-neutral-200 overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 py-16 sm:py-24 flex flex-col lg:flex-row items-center justify-between gap-12">
            
            <div className="w-full lg:w-1/2 flex flex-col items-start text-left z-10">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#111827] mb-6 leading-tight">
                O que queres <br className="hidden lg:block"/>
                <span className="text-[#FF4500]">aprender hoje?</span>
              </h1>
              <p className="text-lg text-neutral-500 mb-8 max-w-xl">
                Aprende com os melhores criadores. Cursos, e-books e mentorias que te levam ao próximo nível na tua carreira.
              </p>
              
              {/* Search Bar */}
              <form action="/marketplace" className="w-full max-w-xl relative shadow-lg shadow-neutral-200/50 rounded-full mb-8">
                <input 
                  type="text" 
                  name="q"
                  placeholder="Pesquisar por cursos, habilidades..." 
                  className="w-full pl-6 pr-14 py-4 sm:py-5 rounded-full border border-neutral-200 text-base sm:text-lg focus:outline-none focus:ring-2 focus:ring-[#FF4500] focus:border-transparent transition-shadow"
                  defaultValue={searchQuery || ""}
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 w-12 h-12 bg-[#FF4500] hover:bg-[#E03E00] text-white rounded-full flex items-center justify-center transition-colors">
                  <Search size={24} strokeWidth={2.5} />
                </button>
              </form>

              {/* Category Chips */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-bold text-neutral-400 mr-1">Populares:</span>
                {categoryChips.slice(0, 4).map(chip => (
                  <a 
                    key={chip.label} 
                    href={`/marketplace?category=${chip.value}`}
                    className="bg-neutral-50 border border-neutral-200 hover:border-[#FF4500] hover:text-[#FF4500] text-neutral-700 px-3 py-1.5 rounded-full text-xs font-bold transition-all duration-300 flex items-center gap-1.5"
                  >
                    <span>{chip.icon}</span>
                    {chip.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Image (Right) */}
            <div className="w-full lg:w-1/2 relative flex justify-center lg:justify-end mt-10 lg:mt-0">
              <div className="relative w-full max-w-[500px] aspect-[4/3] rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white/50">
                <img 
                  src="/hero_woman_laptop.png" 
                  alt="Aprender online na plataforma" 
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
                {/* Subtle overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-tr from-[#FF4500]/10 to-transparent mix-blend-overlay pointer-events-none"></div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FILTER HEADER (if filtered) */}
      {isFiltered && (
        <div className="bg-white border-b border-neutral-200 px-4 sm:px-6 py-8 mb-8">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black text-[#111827]">
                {searchQuery ? `Resultados para "${searchQuery}"` : 
                 categoryFilter ? `Categoria: ${categoryFilter}` :
                 typeFilter ? typeLabels[typeFilter]?.title : 'Filtro Ativo'}
              </h1>
              <p className="text-neutral-500 mt-1">{all.length} produtos encontrados</p>
            </div>
            
            <form action="/marketplace" className="relative max-w-sm w-full">
              <input 
                type="text" 
                name="q"
                placeholder="Nova pesquisa..." 
                className="w-full pl-4 pr-10 py-2.5 rounded-lg border border-neutral-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#FF4500] focus:border-transparent"
                defaultValue={searchQuery || ""}
              />
              {typeFilter && <input type="hidden" name="type" value={typeFilter} />}
              {categoryFilter && <input type="hidden" name="category" value={categoryFilter} />}
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                <Search size={18} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CONTENT SECTIONS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 space-y-20">
        
        {/* Filtered View */}
        {isFiltered && (
          <div className="min-h-[40vh]">
            <ProductGrid items={all} />
            {all.length === 0 && (
              <div className="text-center py-20 bg-white border border-neutral-200 rounded-3xl mt-8">
                <Search size={48} className="mx-auto text-neutral-300 mb-4" />
                <h3 className="text-xl font-bold text-neutral-900 mb-2">Sem resultados</h3>
                <p className="text-neutral-500 mb-6">Não encontrámos produtos para esta pesquisa ou filtro.</p>
                <a href="/marketplace" className="px-6 py-3 bg-neutral-900 text-white font-bold rounded-xl hover:bg-black transition-colors">
                  Limpar Filtros
                </a>
              </div>
            )}
          </div>
        )}

        {/* Default View */}
        {!isFiltered && (
          <>
            {maisQuentes.length > 0 && (
              <Section 
                title="Mais Quentes" 
                subtitle="Os produtos mais vendidos na plataforma" 
                icon={<Flame className="text-[#FF4500]" size={28} />}
              >
                <ProductGrid items={maisQuentes} />
              </Section>
            )}

            {recentes.length > 0 && (
              <Section 
                title="Adicionados Recentemente" 
                subtitle="As novidades fresquinhas do mercado" 
                icon={<Clock className="text-[#0E7C86]" size={28} />}
              >
                <ProductGrid items={recentes} />
              </Section>
            )}

            {cursos.length > 0 && (
              <Section 
                title="Cursos de Destaque" 
                subtitle="Aprende novas habilidades passo a passo" 
                icon={<Star className="text-yellow-500" size={28} />}
              >
                <ProductGrid items={cursos} />
              </Section>
            )}

            {ebooks.length > 0 && (
              <Section 
                title="E-books Recomendados" 
                subtitle="Leitura aprofundada para o teu desenvolvimento" 
              >
                <ProductGrid items={ebooks} />
              </Section>
            )}

            {/* Explorar Cursos - Fallback */}
            {all.length > 0 && maisQuentes.length === 0 && (
              <Section title="Explorar Catálogo" subtitle="Todos os produtos disponíveis">
                <ProductGrid items={all} />
              </Section>
            )}
            
            {all.length === 0 && (
              <div className="text-center py-20">
                <p className="text-neutral-500">O catálogo está vazio de momento.</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

function Section({ title, subtitle, icon, children }) {
  return (
    <section>
      <div className="flex items-center gap-3 mb-6">
        {icon && <div className="w-12 h-12 rounded-full bg-white border border-neutral-100 flex items-center justify-center shadow-sm shrink-0">
          {icon}
        </div>}
        <div>
          <h2 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">{title}</h2>
          {subtitle && <p className="text-neutral-500 mt-1 font-medium">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  )
}
