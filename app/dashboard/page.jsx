import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { getMyPurchases } from "@/lib/data/products"
import ProductCard from "@/components/ProductCard"

export const dynamic = "force-dynamic"

export default async function Dashboard() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/dashboard")

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle()

  const cards = [
    { title: "Biblioteca", desc: "Cursos, livros e mentorias que compraste.", href: "/library" },
  ]
  if (profile?.role === "admin" || profile?.role === "creator") {
    cards.unshift({ title: "Gestão de Conteúdo (Criador)", desc: "Criar e editar cursos, aulas e módulos.", href: "/admin/products" })
  }
  if (profile?.role === "admin") {
    cards.push({ title: "Gestão da Plataforma (Admin)", desc: "Aprovar compras e gerir acessos.", href: "/admin" })
  }

  const myPurchases = await getMyPurchases()
  const myProductIds = new Set(myPurchases.map(p => p.product?.id))
  
  // Busca apenas 8 produtos e filtra em memória — muito mais rápido que buscar TUDO
  const { data: recentProducts } = await (createClient())
    .from("products")
    .select("id, slug, title, image_url, type, price_cents, discount_pct, best_seller, instructor_name")
    .eq("published", true)
    .not("id", "in", `(${myProductIds.size > 0 ? [...myProductIds].join(",") : "00000000-0000-0000-0000-000000000000"})`)
    .order("best_seller", { ascending: false })
    .order("students_count", { ascending: false })
    .limit(4)

  const recommended = (recentProducts || []).map(r => ({
    id: r.id, slug: r.slug, title: r.title, image: r.image_url,
    type: r.type, price: Math.round((r.price_cents || 0) / 100),
    discount: r.discount_pct || 0, bestSeller: !!r.best_seller, instructor: r.instructor_name
  }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
      {/* INTRODUCTION / HERO */}
      <div className="bg-[#111] text-white rounded-3xl p-8 sm:p-12 mb-10 shadow-xl flex flex-col md:flex-row items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="w-16 h-16 rounded-full bg-[#FF4500] text-white flex items-center justify-center text-3xl font-extrabold shadow-lg border-4 border-[#111]">
            {(user.email || "?").slice(0, 1).toUpperCase()}
          </div>
          <div>
            <h1 className="text-3xl font-extrabold">Olá, {profile?.full_name?.split(' ')[0] || user.email?.split('@')[0]}!</h1>
            <p className="text-neutral-400 mt-1">Bem-vindo ao teu painel de controlo. Aqui geres a tua conta, os teus acessos e o teu percurso de aprendizagem.</p>
          </div>
        </div>
        
        <form action="/auth/logout" method="post" className="mt-6 md:mt-0">
          <button
            type="submit"
            className="border border-neutral-700 hover:bg-neutral-800 text-neutral-300 transition px-6 py-3 rounded-xl font-bold"
          >
            Sair da conta
          </button>
        </form>
      </div>

      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map(c => (
          <a
            key={c.title}
            href={c.href}
            className="border border-neutral-200 rounded-2xl p-6 hover:shadow-lg transition bg-white group"
          >
            <div className="font-bold text-lg group-hover:text-[#FF4500] transition-colors">{c.title}</div>
            <p className="text-sm text-neutral-600 mt-2">{c.desc}</p>
          </a>
        ))}
      </div>

      {recommended.length > 0 && (
        <div className="mt-16 pt-10 border-t border-neutral-200">
          <div className="flex items-center gap-3 mb-6">
            <span className="text-2xl">🔥</span>
            <h2 className="text-2xl font-extrabold">Recomendados para ti</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommended.map(item => (
              <ProductCard key={item.id} item={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
