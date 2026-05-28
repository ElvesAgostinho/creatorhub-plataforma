import { redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import { Suspense } from "react"
import { getProducts } from "@/lib/data/products"
import MarketplaceProductCard from "@/components/MarketplaceProductCard"
import PanelSearch from "@/components/PanelSearch"
import { TrendingUp, Users, Zap, Shield, BadgeCheck } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AffiliateMarketplace({ searchParams }) {
  const params = await searchParams
  const searchFilter = (params?.q || "").toLowerCase()

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/marketplace/affiliates")

  const { data: application } = await supabase
    .from("affiliate_applications")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!application || application.status !== "approved") {
    redirect("/affiliates")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  // Get all published products
  const svc = createServiceClient()
  let query = svc
    .from("products")
    .select("id, slug, title, price_cents, image_url, type, affiliate_commission_pct, profiles(full_name)")
    .eq("published", true)
    .order("best_seller", { ascending: false })

  if (searchFilter) {
    query = query.ilike("title", `%${searchFilter}%`)
  }

  const { data: rawProducts } = await query
  const products = (rawProducts || []).map(p => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    price: Math.round((p.price_cents || 0) / 100),
    image: p.image_url,
    type: p.type,
    commissionPct: p.affiliate_commission_pct || 20,
    instructor: p.profiles?.full_name || "Criador"
  }))

  const totalCommission = products.reduce((acc, p) => acc + Math.round((p.price * p.commissionPct) / 100), 0)
  const avgCommission = products.length > 0
    ? Math.round(products.reduce((acc, p) => acc + p.commissionPct, 0) / products.length)
    : 20

  const fmt = n => (n ?? 0).toLocaleString("pt-PT")

  return (
    <div className="bg-[#F9FAFB] min-h-screen text-neutral-900 pt-10 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <BadgeCheck size={18} className="text-[#00A859]" />
              <span className="text-xs font-bold text-[#00A859] uppercase tracking-wider">Marketplace de Afiliados</span>
            </div>
            <h1 className="text-4xl font-black text-neutral-900 tracking-tight">
              O que queres promover hoje?
            </h1>
            <p className="text-neutral-500 mt-2 text-base font-medium">
              Olá, {profile?.full_name?.split(' ')[0]}! Escolhe um produto e começa a ganhar comissões.
            </p>
          </div>
          <div className="flex gap-3 flex-wrap">
            <a href="/affiliate-panel" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-white border border-neutral-200 hover:border-[#FF4500] hover:text-[#FF4500] text-sm font-bold transition-all shadow-sm text-neutral-700">
              ← Painel de Afiliado
            </a>
          </div>
        </div>

        {/* KPI QUICK STATS */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          <div className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#FF4500]/10 flex items-center justify-center">
              <TrendingUp size={22} className="text-[#FF4500]" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wide">Produtos disponíveis</p>
              <p className="text-2xl font-black text-neutral-900">{products.length}</p>
            </div>
          </div>
          <div className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
              <Zap size={22} className="text-[#00A859]" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wide">Comissão média</p>
              <p className="text-2xl font-black text-[#00A859]">{avgCommission}%</p>
            </div>
          </div>
          <div className="bg-white border border-neutral-100 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
              <Shield size={22} className="text-blue-500" />
            </div>
            <div>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wide">Rastreio automático</p>
              <p className="text-2xl font-black text-neutral-900">30 dias</p>
            </div>
          </div>
        </div>

        {/* SEARCH + PRODUCTS */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-black text-neutral-900">Produtos para Promover</h2>
              <span className="text-sm font-black bg-[#FF4500]/10 text-[#FF4500] px-3 py-1.5 rounded-xl">{products.length}</span>
            </div>
            <Suspense fallback={<div className="h-10 bg-neutral-100 rounded-xl w-full max-w-md animate-pulse" />}>
              <PanelSearch placeholder="Pesquisar produtos..." />
            </Suspense>
          </div>

          {products.length === 0 ? (
            <div className="bg-white border border-neutral-100 rounded-3xl p-16 text-center shadow-sm">
              <p className="text-xl font-bold text-neutral-500">Nenhum produto encontrado.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {products.map(p => (
                <MarketplaceProductCard key={p.id} item={p} commissionPct={p.commissionPct} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
