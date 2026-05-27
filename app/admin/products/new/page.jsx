import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CreateProductForm from "@/components/CreateProductForm"

export const dynamic = "force-dynamic"

export default async function NewProductPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login?next=/admin/products/new")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (profile?.role !== "admin" && profile?.role !== "creator") {
    redirect("/")
  }

  const { data: billing } = await supabase
    .from("creator_storage_billing")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle()

  const isStorageActive = profile?.role === "admin" || billing?.status === "active"

  return (
    <div className="bg-[#F8F7F5] min-h-screen pt-10 pb-20 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* HEADER */}
        <div className="mb-8">
          <a href="/admin/products" className="inline-flex items-center gap-2 text-neutral-500 hover:text-[#FF4500] font-semibold text-sm mb-4 transition-colors">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>
            Voltar aos Produtos
          </a>
          <h1 className="text-3xl font-extrabold text-neutral-900">Novo Infoproduto</h1>
          <p className="text-neutral-500 mt-2">Preenche os dados abaixo para lançar o teu próximo sucesso de vendas.</p>
        </div>

        {/* FORM CONTAINER */}
        <div className="bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 shadow-sm">
          <CreateProductForm isStorageActive={isStorageActive} />
        </div>

      </div>
    </div>
  )
}
