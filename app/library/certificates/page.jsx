import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getMyPurchases } from "@/lib/data/products"
import { getCourseProgressPercentages } from "@/lib/data/lessons"
import { Award, Download } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CertificatesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/library/certificates")

  const items = await getMyPurchases()
  const courses = items.filter(it => it.product.type === "course")
  const courseIds = courses.map(it => it.product.id)
  const progressMap = await getCourseProgressPercentages(courseIds)

  const completedCourses = courses.filter(it => {
    const progress = progressMap[it.product.id]
    return typeof progress === "number" ? progress === 100 : progress?.pct === 100
  })

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Meus Certificados</h1>
        <p className="text-neutral-500 mt-2">Aqui estão os certificados de todos os cursos que concluíste a 100%.</p>
      </div>

      {completedCourses.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-neutral-100 text-neutral-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Award size={32} />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">Ainda não tens certificados</h3>
          <p className="text-neutral-500 mt-2">Completa todas as aulas de um curso para desbloquear o teu certificado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {completedCourses.map(it => (
            <div key={it.purchaseId} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition group flex flex-col">
              <div className="aspect-video bg-neutral-100 relative overflow-hidden">
                {it.product.image ? (
                  <img src={it.product.image} alt={it.product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300">
                    <Award size={48} />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                  <span className="text-white font-bold text-sm tracking-wide flex items-center gap-2">
                    <Award size={16} className="text-[#FF4500]" />
                    CONCLUÍDO
                  </span>
                </div>
              </div>
              <div className="p-5 flex-1 flex flex-col">
                <h3 className="font-bold text-neutral-900 line-clamp-2 flex-1 mb-4">{it.product.title}</h3>
                <a 
                  href={`/api/certificate?productId=${it.product.id}`}
                  download
                  className="w-full py-3 px-4 bg-[#FFF0EB] text-[#FF4500] hover:bg-[#FF4500] hover:text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Baixar Certificado
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
