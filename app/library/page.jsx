import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getMyPurchases, typeLabels } from "@/lib/data/products"
import { getCourseProgressPercentages } from "@/lib/data/lessons"
import { BookOpen, Rocket, GraduationCap, Users, Ticket, PlayCircle } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function Library() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/library")

  const items = await getMyPurchases()
  const courseIds = items.filter(it => it.product.type === "course").map(it => it.product.id)
  const progressMap = await getCourseProgressPercentages(courseIds)

  return (
    <div className="bg-[#F9FAFB] text-neutral-900 min-h-screen relative overflow-hidden">
      {/* Premium Background Grid & Glow */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#00000005_1px,transparent_1px),linear-gradient(to_bottom,#00000005_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1000px] h-[400px] bg-[#FF4500] opacity-5 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative z-10">
        {/* INTRUDUCTION / HERO */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-8 sm:p-12 mb-12 flex flex-col md:flex-row items-center justify-between shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FF4500] rounded-full blur-[150px] opacity-10 pointer-events-none"></div>
          
          <div className="max-w-2xl relative z-10">
            <h1 className="text-4xl sm:text-5xl font-black mb-4 tracking-tight text-neutral-900">
              Bem-vindo à tua Academia.
            </h1>
            <p className="text-neutral-500 text-lg leading-relaxed font-medium">
              Aqui tens acesso imediato a todo o conhecimento que adquiriste. Retoma os teus cursos, lê os teus ebooks e acede aos teus eventos com a melhor experiência de aprendizagem.
            </p>
          </div>
          <div className="hidden md:flex flex-col gap-3 mt-6 md:mt-0 items-end relative z-10">
            <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 px-5 py-2.5 rounded-xl text-sm font-bold text-neutral-700 shadow-sm">
              <BookOpen className="w-5 h-5 text-indigo-500" /> {items.length} Produtos
            </div>
            <div className="flex items-center gap-3 bg-neutral-50 border border-neutral-200 px-5 py-2.5 rounded-xl text-sm font-bold text-neutral-700 shadow-sm">
              <Rocket className="w-5 h-5 text-[#FF4500]" /> Acesso Vitalício
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="mt-12 border border-neutral-200 rounded-3xl p-16 text-center bg-white shadow-sm">
            <p className="text-neutral-500 text-lg mb-6 font-medium">Ainda não tens compras na tua conta.</p>
            <a href="/marketplace" className="inline-block bg-[#FF4500] hover:bg-[#e03d00] text-white font-bold px-8 py-3.5 rounded-xl transition shadow-lg shadow-[#FF4500]/20">
              Explorar Marketplace
            </a>
          </div>
        ) : (
          <div className="mt-12 space-y-16">
            {["course", "book", "mentorship", "event"].map(typeKey => {
              const typeItems = items.filter(it => it.product.type === typeKey)
              if (typeItems.length === 0) return null
              
              const sectionTitles = {
                course: { title: "Os Meus Cursos", icon: GraduationCap, color: "text-blue-400" },
                book: { title: "A Minha Biblioteca (E-books / PDFs)", icon: BookOpen, color: "text-emerald-400" },
                mentorship: { title: "As Minhas Mentorias", icon: Users, color: "text-fuchsia-400" },
                event: { title: "Os Meus Eventos", icon: Ticket, color: "text-sky-400" }
              }

              const SectionIcon = sectionTitles[typeKey].icon

              return (
                <div key={typeKey} className="space-y-6">
                  <h2 className="text-xl font-bold text-neutral-900 flex items-center gap-3">
                    <SectionIcon className={`w-6 h-6 ${sectionTitles[typeKey].color}`} />
                    {sectionTitles[typeKey].title}
                    <span className="text-xs font-bold bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full border border-neutral-200">{typeItems.length}</span>
                  </h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {typeItems.map(it => {
                      const hrefByType = {
                        course: `/learn/${it.product.slug}`,
                        book: `/api/books/${it.product.slug}/download`,
                        mentorship: `/book/${it.product.slug}`,
                        event: `/product/${it.product.slug}`
                      }
                      const href = hrefByType[it.product.type] || `/product/${it.product.slug}`
                      const target = it.product.type === "book" ? "_blank" : undefined
                      const cta = {
                        course: "Continuar curso",
                        book: "Abrir PDF",
                        mentorship: "Agendar sessão",
                        event: "Aceder ao evento"
                      }[it.product.type] || "Aceder"
                      
                      return (
                        <a
                          key={it.purchaseId}
                          href={href}
                          target={target}
                          className="group relative bg-white border border-neutral-200 rounded-2xl overflow-hidden hover:shadow-md hover:border-[#FF4500]/30 transition-all duration-300 flex flex-col shadow-sm"
                        >
                          <div className="relative aspect-video overflow-hidden">
                            <img 
                              src={it.product.image} 
                              alt={it.product.title} 
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-80"></div>
                            <span className="absolute top-3 left-3 bg-[#FF4500] text-white text-[10px] font-bold uppercase px-3 py-1 rounded-md shadow-sm">
                              {typeLabels[it.product.type]}
                            </span>
                          </div>
                          <div className="p-5 flex flex-col flex-1 min-w-0 relative z-10">
                            <span className="font-bold text-lg leading-tight line-clamp-2 text-neutral-900 mb-2 group-hover:text-[#FF4500] transition-colors">{it.product.title}</span>
                            <span className="text-xs font-medium text-neutral-500 mt-auto mb-4">por {it.product.instructor}</span>
                            
                            {it.product.type === "course" && progressMap[it.product.id] !== undefined && (
                              <div className="mb-4">
                                <div className="flex justify-between items-center mb-1.5">
                                  <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">Progresso</span>
                                  <span className="text-[10px] font-bold text-emerald-500">{progressMap[it.product.id]}%</span>
                                </div>
                                <div className="w-full bg-neutral-100 rounded-full h-1.5 overflow-hidden">
                                  <div 
                                    className="bg-emerald-500 h-1.5 rounded-full transition-all duration-1000 ease-out" 
                                    style={{ width: `${progressMap[it.product.id]}%` }}
                                  ></div>
                                </div>
                              </div>
                            )}

                            <div className="w-full bg-neutral-50 border border-neutral-200 group-hover:bg-[#FF4500] group-hover:border-[#FF4500] group-hover:text-white text-neutral-700 py-2.5 rounded-xl text-center text-sm font-bold transition-all duration-300">
                              {cta}
                            </div>
                          </div>
                        </a>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
