import Hero from "@/components/Hero"
import ProductGrid from "@/components/ProductGrid"
import { getProducts } from "@/lib/data/products"
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

  const typeLabels = {
    course: { title: "Cursos em Vídeo", subtitle: "Aprende ao teu próprio ritmo com especialistas" },
    book: { title: "E-books / PDF", subtitle: "Material de leitura profunda" },
    mentorship: { title: "Mentorias 1:1", subtitle: "Sessões personalizadas" },
    event: { title: "Eventos & Workshops", subtitle: "Sessões ao vivo" }
  }

  const isFiltered = typeFilter || categoryFilter || searchQuery;

  return (
    <div className="bg-[#050505] text-white min-h-screen relative overflow-hidden">
      {/* Premium Background Grid & Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[400px] bg-[#FF4500] opacity-20 blur-[120px] rounded-full pointer-events-none mix-blend-screen" />

      <div className="relative z-10">
        {!isFiltered && <Hero slides={all} />}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 space-y-20">
          {!isFiltered && (
            <>
              <header className="text-center max-w-4xl mx-auto mb-12">
                <h2 className="text-4xl sm:text-6xl font-black tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-white to-neutral-400">
                  Aprende uma nova habilidade.
                </h2>
                <p className="text-xl text-neutral-400 font-medium">
                  Explora o nosso ambiente seguro, repleto de conteúdos e recursos incríveis.
              </p>
            </header>

            {/* BENEFITS SECTION */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              <div className="bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/5 hover:border-white/20 transition-all p-6 rounded-2xl flex flex-col items-center text-center group">
                <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center text-neutral-300 mb-5 group-hover:bg-[#FF4500]/20 group-hover:text-[#FF4500] transition-colors">
                  <Search className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-lg mb-2 text-white">Encontra o melhor conteúdo</h4>
                <p className="text-sm text-neutral-400">Selecionámos os melhores produtos para te ajudar a encontrar o que procuras.</p>
              </div>
              <div className="bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/5 hover:border-white/20 transition-all p-6 rounded-2xl flex flex-col items-center text-center group">
                <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center text-neutral-300 mb-5 group-hover:bg-[#FF4500]/20 group-hover:text-[#FF4500] transition-colors">
                  <CreditCard className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-lg mb-2 text-white">Paga como preferires</h4>
                <p className="text-sm text-neutral-400">Compra com facilidade e segurança usando vários métodos locais.</p>
              </div>
              <div className="bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/5 hover:border-white/20 transition-all p-6 rounded-2xl flex flex-col items-center text-center group">
                <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center text-neutral-300 mb-5 group-hover:bg-[#FF4500]/20 group-hover:text-[#FF4500] transition-colors">
                  <Smartphone className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-lg mb-2 text-white">Acede de qualquer lugar</h4>
                <p className="text-sm text-neutral-400">Estuda no computador, tablet ou telemóvel ao teu próprio ritmo.</p>
              </div>
              <div className="bg-[#0A0A0A]/60 backdrop-blur-xl border border-white/5 hover:border-white/20 transition-all p-6 rounded-2xl flex flex-col items-center text-center group">
                <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center text-neutral-300 mb-5 group-hover:bg-[#FF4500]/20 group-hover:text-[#FF4500] transition-colors">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-lg mb-2 text-white">Interage com criadores</h4>
                <p className="text-sm text-neutral-400">Deixa dúvidas, comentários e cria uma ligação real com o produtor.</p>
              </div>
            </div>
          </>
        )}

        {searchQuery && (
          <Section title={`Resultados para "${searchQuery}"`} subtitle={`${all.length} produto(s) encontrado(s)`}>
            <ProductGrid items={all} />
            {all.length === 0 && <p className="text-neutral-500">Não encontrámos nenhum resultado para a tua pesquisa.</p>}
          </Section>
        )}

        {categoryFilter && !searchQuery && (
          <Section title={`Categoria: ${categoryFilter}`} subtitle={`Todos os resultados em ${categoryFilter}`}>
            <ProductGrid items={all} />
            {all.length === 0 && <p className="text-neutral-500">Sem produtos nesta categoria.</p>}
          </Section>
        )}

        {typeFilter && !categoryFilter && !searchQuery && typeLabels[typeFilter] && (
          <Section title={typeLabels[typeFilter].title} subtitle={typeLabels[typeFilter].subtitle}>
            <ProductGrid items={all} />
            {all.length === 0 && <p className="text-neutral-500">Sem produtos neste formato.</p>}
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
          const events = otherProducts.filter(p => p.type === 'event');
          const mentorships = otherProducts.filter(p => p.type === 'mentorship');
          const books = otherProducts.filter(p => p.type === 'book');
          const rest = otherProducts.filter(p => !['course', 'event', 'mentorship', 'book'].includes(p.type));

          return (
            <>
              {sections}
              {courses.length > 0 && (
                <Section title="Cursos" subtitle="Aprende ao teu próprio ritmo">
                  <ProductGrid items={courses} />
                </Section>
              )}
              {events.length > 0 && (
                <Section title="Eventos" subtitle="Participa em sessões ao vivo">
                  <ProductGrid items={events} />
                </Section>
              )}
              {mentorships.length > 0 && (
                <Section title="Mentorias" subtitle="Acompanhamento personalizado">
                  <ProductGrid items={mentorships} />
                </Section>
              )}
              {books.length > 0 && (
                <Section title="E-books / PDF" subtitle="Material de leitura">
                  <ProductGrid items={books} />
                </Section>
              )}
              {rest.length > 0 && (
                <Section title="Outros Conteúdos" subtitle="Descobre mais materiais">
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
      <div className="border-b border-neutral-800 pb-4">
        <h3 className="text-2xl font-extrabold text-white">{title}</h3>
        {subtitle && <p className="text-sm text-neutral-400 mt-1">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}
