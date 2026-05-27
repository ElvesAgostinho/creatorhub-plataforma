import Hero from "@/components/Hero"
import ProductGrid from "@/components/ProductGrid"
import { getProducts, getFeaturedProducts } from "@/lib/data/products"
import { Search, CreditCard, Smartphone, MessageSquare } from "lucide-react"

import { categoryTree } from "@/lib/data/categories"

export const revalidate = 60

export default async function Home({ searchParams }) {
  const params = await searchParams;
  const typeFilter = params?.type
  const categoryFilter = params?.category
  const searchQuery = params?.q
  
  const all = await getProducts({ type: typeFilter, category: categoryFilter, search: searchQuery })
  const by = t => all.filter(p => p.type === t)
  const featured = (!typeFilter && !categoryFilter && !searchQuery) ? await getFeaturedProducts() : all;

  const typeLabels = {
    course: { title: "Cursos em Vídeo", subtitle: "Aprende ao teu próprio ritmo com especialistas" },
    book: { title: "E-books / PDF", subtitle: "Material de leitura profunda" },
    mentorship: { title: "Mentorias 1:1", subtitle: "Sessões personalizadas" },

  }

  const isFiltered = typeFilter || categoryFilter || searchQuery;

  return (
    <div className="bg-[#FAFAFA] text-neutral-900 min-h-screen relative overflow-hidden">
      {/* Premium Background Grid & Glow (Light Mode) */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000008_1px,transparent_1px),linear-gradient(to_bottom,#00000008_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[400px] bg-[#FF4500] opacity-[0.08] blur-[120px] rounded-full pointer-events-none mix-blend-multiply" />

      <div className="relative z-10">
        {!isFiltered && <Hero slides={featured} />}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 space-y-24">
          {!isFiltered && (
            <>
              <header className="text-center max-w-4xl mx-auto mb-16">
                <h2 className="text-4xl sm:text-6xl font-black tracking-tighter mb-6 text-neutral-900">
                  Aprende uma <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FF4500] to-[#FF8C00]">nova habilidade.</span>
                </h2>
                <p className="text-xl text-neutral-500 font-medium max-w-2xl mx-auto">
                  Explora o nosso ambiente seguro, repleto de conteúdos e recursos incríveis desenvolvidos pelos melhores criadores.
                </p>
              </header>

              {/* BENEFITS SECTION */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
                <div className="bg-white border border-neutral-100 hover:border-[#FF4500]/30 hover:shadow-[0_8px_30px_rgb(255,69,0,0.08)] transition-all duration-300 p-8 rounded-[2rem] flex flex-col items-center text-center group">
                  <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400 mb-6 group-hover:bg-[#FFF0EB] group-hover:text-[#FF4500] group-hover:scale-110 transition-all duration-300">
                    <Search className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-neutral-900">Encontra o melhor conteúdo</h4>
                  <p className="text-sm text-neutral-500 leading-relaxed">Selecionámos os melhores produtos para te ajudar a encontrar exatamente o que procuras.</p>
                </div>
                <div className="bg-white border border-neutral-100 hover:border-[#FF4500]/30 hover:shadow-[0_8px_30px_rgb(255,69,0,0.08)] transition-all duration-300 p-8 rounded-[2rem] flex flex-col items-center text-center group">
                  <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400 mb-6 group-hover:bg-[#FFF0EB] group-hover:text-[#FF4500] group-hover:scale-110 transition-all duration-300">
                    <CreditCard className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-neutral-900">Paga como preferires</h4>
                  <p className="text-sm text-neutral-500 leading-relaxed">Compra com facilidade e segurança usando vários métodos locais, como Multicaixa.</p>
                </div>
                <div className="bg-white border border-neutral-100 hover:border-[#FF4500]/30 hover:shadow-[0_8px_30px_rgb(255,69,0,0.08)] transition-all duration-300 p-8 rounded-[2rem] flex flex-col items-center text-center group">
                  <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400 mb-6 group-hover:bg-[#FFF0EB] group-hover:text-[#FF4500] group-hover:scale-110 transition-all duration-300">
                    <Smartphone className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-neutral-900">Acede de qualquer lugar</h4>
                  <p className="text-sm text-neutral-500 leading-relaxed">Estuda no computador, tablet ou telemóvel ao teu próprio ritmo e horário.</p>
                </div>
                <div className="bg-white border border-neutral-100 hover:border-[#FF4500]/30 hover:shadow-[0_8px_30px_rgb(255,69,0,0.08)] transition-all duration-300 p-8 rounded-[2rem] flex flex-col items-center text-center group">
                  <div className="w-16 h-16 bg-neutral-50 rounded-2xl flex items-center justify-center text-neutral-400 mb-6 group-hover:bg-[#FFF0EB] group-hover:text-[#FF4500] group-hover:scale-110 transition-all duration-300">
                    <MessageSquare className="w-7 h-7" />
                  </div>
                  <h4 className="font-bold text-lg mb-2 text-neutral-900">Interage com criadores</h4>
                  <p className="text-sm text-neutral-500 leading-relaxed">Deixa dúvidas, comentários e cria uma ligação real com o produtor do conteúdo.</p>
                </div>
              </div>
            </>
          )}

          {searchQuery && (
            <Section title={`Resultados para "${searchQuery}"`} subtitle={`${all.length} produto(s) encontrado(s)`}>
              <ProductGrid items={all} />
              {all.length === 0 && <p className="text-neutral-500 bg-white p-8 rounded-2xl border border-neutral-100 text-center">Não encontrámos nenhum resultado para a tua pesquisa.</p>}
            </Section>
          )}

          {categoryFilter && !searchQuery && (
            <Section title={`Categoria: ${categoryFilter}`} subtitle={`Todos os resultados em ${categoryFilter}`}>
              <ProductGrid items={all} />
              {all.length === 0 && <p className="text-neutral-500 bg-white p-8 rounded-2xl border border-neutral-100 text-center">Sem produtos nesta categoria.</p>}
            </Section>
          )}

          {typeFilter && !categoryFilter && !searchQuery && typeLabels[typeFilter] && (
            <Section title={typeLabels[typeFilter].title} subtitle={typeLabels[typeFilter].subtitle}>
              <ProductGrid items={all} />
              {all.length === 0 && <p className="text-neutral-500 bg-white p-8 rounded-2xl border border-neutral-100 text-center">Sem produtos neste formato.</p>}
            </Section>
          )}

          {!typeFilter && !categoryFilter && !searchQuery && (() => {
            const renderedIds = new Set();
            const sections = Object.keys(categoryTree).map(cat => {
              const catProducts = all.filter(p => p.category === cat || (categoryTree[cat] && categoryTree[cat].includes(p.category)));
              catProducts.forEach(p => renderedIds.add(p.id));
              if (catProducts.length === 0) return null;
              return (
                <Section key={cat} title={cat} subtitle={`Explora os melhores conteúdos de ${cat}`}>
                  <ProductGrid items={catProducts} />
                </Section>
              )
            });
            
            const otherProducts = all.filter(p => !renderedIds.has(p.id));
            const courses = otherProducts.filter(p => p.type === 'course');
            const mentorships = otherProducts.filter(p => p.type === 'mentorship');
            const books = otherProducts.filter(p => p.type === 'book');
            const rest = otherProducts.filter(p => !['course', 'mentorship', 'book'].includes(p.type));

            return (
              <>
                {sections}
                {courses.length > 0 && (
                  <Section title="Cursos" subtitle="Aprende ao teu próprio ritmo">
                    <ProductGrid items={courses} />
                  </Section>
                )}
                {mentorships.length > 0 && (
                  <Section title="Mentorias" subtitle="Acompanhamento personalizado">
                    <ProductGrid items={mentorships} />
                  </Section>
                )}
                {books.length > 0 && (
                  <Section title="E-books / PDF" subtitle="Material de leitura e guias">
                    <ProductGrid items={books} />
                  </Section>
                )}
                {rest.length > 0 && (
                  <Section title="Outros Conteúdos" subtitle="Descobre mais materiais exclusivos">
                    <ProductGrid items={rest} />
                  </Section>
                )}
              </>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

function Section({ title, subtitle, children }) {
  return (
    <section className="space-y-6">
      <div className="border-b border-neutral-200 pb-4">
        <h3 className="text-3xl font-extrabold text-neutral-900 tracking-tight">{title}</h3>
        {subtitle && <p className="text-neutral-500 mt-1.5 font-medium">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}
