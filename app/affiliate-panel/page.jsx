import { redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import Header from "@/components/Header"
import { PremiumButton } from "@/components/PremiumForms"
import { generateAffiliateLink } from "./actions"

export const dynamic = "force-dynamic"

export default async function AffiliatePanel() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/affiliate-panel")

  // Verify they are an approved affiliate
  const { data: application } = await supabase
    .from("affiliate_applications")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!application || application.status !== "approved") {
    redirect("/affiliates")
  }

  // Get all products that have affiliate commission > 0
  const { data: products } = await supabase
    .from("products")
    .select("id, title, price_cents, image_url, affiliate_commission_pct, slug")
    .gt("affiliate_commission_pct", 0)
    .eq("published", true)

  // Get current affiliate's generated links
  const { data: myLinks } = await supabase
    .from("affiliate_links")
    .select("*")
    .eq("affiliate_id", user.id)

  // Get earnings
  const { data: earnings } = await supabase
    .from("affiliate_earnings")
    .select("*")
    .eq("affiliate_id", user.id)

  const totalEarnings = earnings?.reduce((acc, curr) => acc + curr.amount_cents, 0) || 0
  const pendingEarnings = earnings?.filter(e => e.status === 'pending').reduce((acc, curr) => acc + curr.amount_cents, 0) || 0
  const paidEarnings = earnings?.filter(e => e.status === 'paid').reduce((acc, curr) => acc + curr.amount_cents, 0) || 0

  return (
    <div className="min-h-screen bg-[#F8F7F5] text-neutral-900 font-sans">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-10 mt-4 space-y-8">
        <h1 className="text-3xl font-extrabold text-neutral-900">Painel de Afiliado</h1>

        {/* Dashboard Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex flex-col justify-center">
            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">Ganhos Totais</h3>
            <p className="text-4xl font-black text-neutral-900">{new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(totalEarnings / 100)}</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex flex-col justify-center">
            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">Saldo Pendente</h3>
            <p className="text-4xl font-black text-orange-500">{new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(pendingEarnings / 100)}</p>
            <p className="text-xs text-neutral-400 mt-2">A aguardar libertação de fundos.</p>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-neutral-200 shadow-sm flex flex-col justify-center">
            <h3 className="text-sm font-bold text-neutral-500 uppercase tracking-wider mb-2">Já Pago</h3>
            <p className="text-4xl font-black text-green-500">{new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(paidEarnings / 100)}</p>
          </div>
        </div>

        {/* Produtos para Promover */}
        <div>
          <h2 className="text-2xl font-bold text-neutral-900 mb-6">Produtos Disponíveis para Promover</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products?.map(product => {
              const myLink = myLinks?.find(l => l.product_id === product.id)
              const commissionValue = Math.round((product.price_cents * (product.affiliate_commission_pct / 100)) / 100)
              
              return (
                <div key={product.id} className="bg-white border border-neutral-200 rounded-3xl overflow-hidden flex flex-col hover:shadow-md transition">
                  <div className="h-40 bg-neutral-100 relative">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-300">Sem Imagem</div>
                    )}
                    <div className="absolute top-3 right-3 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      {product.affiliate_commission_pct}% Comissão
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-lg mb-2 line-clamp-2">{product.title}</h3>
                    <p className="text-neutral-500 text-sm mb-4">
                      Preço: {new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(product.price_cents / 100)}<br/>
                      <span className="font-bold text-green-600">Ganha: {new Intl.NumberFormat("pt-AO", { style: "currency", currency: "AOA" }).format(commissionValue)} / venda</span>
                    </p>

                    <div className="mt-auto">
                      {myLink ? (
                        <div className="bg-neutral-50 p-3 rounded-xl border border-neutral-200">
                          <p className="text-xs font-bold text-neutral-500 mb-1">O teu link exclusivo:</p>
                          <input 
                            type="text" 
                            readOnly 
                            value={`https://above.com/product/${product.slug}?ref=${myLink.code}`} 
                            className="w-full bg-white border border-neutral-300 rounded px-3 py-2 text-xs font-mono mb-2"
                            onClick={(e) => e.target.select()}
                          />
                        </div>
                      ) : (
                        <form action={generateAffiliateLink}>
                          <input type="hidden" name="product_id" value={product.id} />
                          <PremiumButton type="submit" variant="primary" className="w-full !py-2.5">
                            Gerar Link de Afiliado
                          </PremiumButton>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
            
            {products?.length === 0 && (
              <div className="col-span-3 text-center py-12 text-neutral-500 bg-white rounded-3xl border border-neutral-200">
                Nenhum produto com programa de afiliados aberto no momento.
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
