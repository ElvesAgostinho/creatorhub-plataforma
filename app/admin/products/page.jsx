import { redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import CreateProductForm from "@/components/CreateProductForm"

export const dynamic = "force-dynamic"

export default async function AdminProducts() {
  const svc = createServiceClient()
  const { data: rows } = await svc
    .from("products")
    .select("id, slug, type, title, published, best_seller, students_count, price_cents")
    .order("created_at", { ascending: false })

  const fmt = n => (n ?? 0).toLocaleString("pt-PT")

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold text-neutral-900">Produtos</h1>
          <p className="text-sm text-neutral-500 mt-1">Gere os teus cursos, mentorias e e-books.</p>
        </div>
      </div>

      <details className="mt-6 border border-neutral-200 rounded-2xl p-5 bg-white" open>
        <summary className="font-bold cursor-pointer">+ Criar novo produto</summary>
        <CreateProductForm />
      </details>

      <div className="mt-8 space-y-8">
        {["course", "book", "mentorship", "event"].map(typeKey => {
          const typeRows = rows?.filter(r => r.type === typeKey) || []
          if (typeRows.length === 0) return null
          
          const typeLabels = {
            course: "🎓 Cursos",
            book: "📚 E-books / PDFs",
            mentorship: "🤝 Mentorias",
            event: "🎟️ Eventos"
          }

          return (
            <div key={typeKey} className="bg-white border border-neutral-200 rounded-2xl overflow-hidden">
              <div className="bg-neutral-50 px-5 py-4 border-b border-neutral-200">
                <h3 className="font-bold text-neutral-900 text-base">{typeLabels[typeKey]} <span className="text-neutral-500 font-normal ml-2 text-sm">({typeRows.length})</span></h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="text-neutral-500 text-xs uppercase border-b border-neutral-100">
                    <tr>
                      <th className="text-left p-4 font-medium">Título</th>
                      <th className="text-left p-4 font-medium">Slug</th>
                      <th className="text-left p-4 font-medium">Preço</th>
                      <th className="text-left p-4 font-medium">Estado</th>
                      <th className="p-4"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {typeRows.map(r => (
                      <tr key={r.id} className="border-b border-neutral-50 last:border-0 hover:bg-neutral-50/50">
                        <td className="p-4 font-medium text-neutral-800">{r.title}{r.best_seller && <span className="ml-2 text-[10px] bg-yellow-300 text-black px-1.5 py-0.5 rounded">BS</span>}</td>
                        <td className="p-4 text-xs text-neutral-500">{r.slug}</td>
                        <td className="p-4 whitespace-nowrap">{fmt(Math.round(r.price_cents/100))} Kz</td>
                        <td className="p-4 text-xs">
                          <span className={`px-2 py-1 rounded-md ${r.published ? 'bg-green-100 text-green-700' : 'bg-neutral-100 text-neutral-600'}`}>
                            {r.published ? "publicado" : "rascunho"}
                          </span>
                        </td>
                        <td className="p-4 text-right">
                          <a href={`/admin/products/${r.id}`} className="text-[#0E7C86] font-semibold hover:underline">Editar</a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}

        {(!rows || rows.length === 0) && (
          <div className="border border-neutral-200 rounded-2xl p-10 text-center bg-white text-neutral-500">
            Ainda não criaste nenhum produto. Começa agora clicando em "+ Criar novo produto".
          </div>
        )}
      </div>
    </div>
  )
}

