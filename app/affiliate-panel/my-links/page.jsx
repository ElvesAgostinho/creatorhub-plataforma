import { redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import PanelSearch from "@/components/PanelSearch"
import { Suspense } from "react"
import { typeLabels } from "@/lib/data/products"

export const dynamic = "force-dynamic"

export default async function MyLinksPage({ searchParams }) {
  const params = await searchParams;
  const searchFilter = (params?.q || "").toLowerCase()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/affiliate-panel/my-links")

  const { data: application } = await supabase
    .from("affiliate_applications")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!application || application.status !== "approved") {
    redirect("/affiliates")
  }

  // Get all published products
  let productsQuery = supabase
    .from("products")
    .select("id, slug, title, price_cents, image_url, type, affiliate_commission_pct")
    .eq("published", true)
  
  if (searchFilter) {
    productsQuery = productsQuery.ilike("title", `%${searchFilter}%`)
  }

  const { data: products } = await productsQuery

  const typeBadge = {
    course: "bg-[#FFF8E7] text-yellow-700 border border-yellow-200",
    book: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    mentorship: "bg-fuchsia-50 text-fuchsia-700 border border-fuchsia-200"
  }

  const fmt = n => (n ?? 0).toLocaleString("pt-PT")

  return (
    <div className="pt-10 pb-20 px-4 sm:px-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Meus Links</h1>
          <p className="text-neutral-500 mt-2 text-sm font-medium">Copia os teus links exclusivos de venda abaixo e começa a lucrar.</p>
        </div>
        <Suspense fallback={<div className="h-10 bg-neutral-100 rounded-xl w-full max-w-md animate-pulse" />}>
          <PanelSearch placeholder="Pesquisar produtos pelo nome..." />
        </Suspense>
      </div>
      
      {(!products || products.length === 0) ? (
        <div className="bg-white border border-neutral-100 rounded-3xl p-16 text-center shadow-sm">
          <p className="text-xl font-bold text-neutral-500">Nenhum produto encontrado.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map(p => {
            const commissionPct = p.affiliate_commission_pct || 20
            const comm = Math.round((p.price_cents * commissionPct) / 10000)
            
            return (
              <a href={`/affiliate-panel/product/${p.slug}`} key={p.id} className="group relative bg-white border border-neutral-100 rounded-[2rem] overflow-hidden hover:shadow-[0_20px_40px_-15px_rgba(255,69,0,0.2)] hover:border-[#FF4500]/30 transition-all duration-500 flex flex-col text-neutral-900">
                <div className="relative block aspect-[16/9] overflow-hidden bg-neutral-100">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-neutral-400 text-xs font-bold">
                      Sem capa
                    </div>
                  )}
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent opacity-60 group-hover:opacity-30 transition-opacity duration-500" />
                  
                  <div className="absolute top-4 left-4 flex gap-2 flex-wrap z-10">
                    <span className={`text-[10px] font-black px-3 py-1.5 rounded-lg shadow-md ${typeBadge[p.type] || "bg-white text-neutral-900 border border-neutral-200"}`}>
                      {typeLabels[p.type]?.toUpperCase() || "PRODUTO"}
                    </span>
                  </div>
                </div>

                <div className="p-6 flex flex-col gap-4 flex-1">
                  <h3 className="font-extrabold text-[18px] leading-snug line-clamp-2 text-neutral-900">
                    {p.title}
                  </h3>

                  <div className="flex items-center justify-between border-t border-neutral-100 pt-4 mt-auto">
                    <div>
                      <p className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider">Preço Base</p>
                      <p className="font-bold text-neutral-600">{fmt(Math.round(p.price_cents/100))} Kz</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-black text-[#10B981] uppercase tracking-wider">Comissão ({commissionPct}%)</p>
                      <p className="font-black text-xl text-[#10B981]">{fmt(comm)} Kz</p>
                    </div>
                  </div>

                  <div className="mt-2 text-center text-sm font-bold text-[#FF4500] group-hover:bg-[#FF4500] group-hover:text-white border border-[#FF4500]/20 py-2.5 rounded-xl transition-colors">
                    Ver e Copiar Link
                  </div>
                </div>
              </a>
            )
          })}
        </div>
      )}
    </div>
  )
}
