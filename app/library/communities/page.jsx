import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getMyPurchases } from "@/lib/data/products"
import { MessageSquare, ExternalLink } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function CommunitiesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/library/communities")

  const items = await getMyPurchases()
  
  // Filter products that have a community_url
  const communities = items.filter(it => it.product.community_url && it.product.community_url.trim().length > 0)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-neutral-900 tracking-tight">Comunidades</h1>
        <p className="text-neutral-500 mt-2">Acede aos grupos exclusivos dos teus produtos e interage com outros alunos.</p>
      </div>

      {communities.length === 0 ? (
        <div className="bg-white border border-neutral-200 rounded-3xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-neutral-100 text-neutral-400 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <MessageSquare size={32} />
          </div>
          <h3 className="text-lg font-bold text-neutral-900">Sem comunidades ativas</h3>
          <p className="text-neutral-500 mt-2">Nenhum dos produtos que compraste possui um grupo ou comunidade associada.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {communities.map(it => (
            <div key={it.id} className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition flex flex-col items-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-neutral-100 overflow-hidden mb-4 border border-neutral-100 shrink-0">
                {it.product.image_url ? (
                  <img src={it.product.image_url} alt={it.product.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-300">
                    <MessageSquare size={32} />
                  </div>
                )}
              </div>
              <h3 className="font-bold text-neutral-900 line-clamp-2 mb-1">{it.product.title}</h3>
              <p className="text-xs font-medium text-neutral-500 mb-6">Comunidade de Alunos</p>
              
              <a 
                href={it.product.community_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-auto w-full py-3 px-4 bg-[#FF4500] hover:bg-[#E03E00] text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2"
              >
                <ExternalLink size={16} />
                Aceder à Comunidade
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
