import { redirect } from "next/navigation"
import { createServiceClient } from "@/lib/supabase/server"
import Link from "next/link"
import { PackagePlus, LayoutGrid, Search, MoreVertical, Edit, ExternalLink, Activity, Eye, PlaySquare, TrendingUp } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminProducts({ searchParams }) {
  const svc = createServiceClient()
  const { data: rows } = await svc
    .from("products")
    .select("id, slug, type, title, students_count, price_cents, created_at, image_url")
    .order("created_at", { ascending: false })

  const fmt = n => (n ?? 0).toLocaleString("pt-PT")

  const totalProducts = rows?.length || 0;
  const activeProducts = totalProducts; // Assume all active for now to prevent breaking UI
  const draftProducts = 0;

  // Tabs logic
  const tab = searchParams?.tab || "all";
  
  let filteredRows = rows || [];
  if (tab === "active") filteredRows = filteredRows; 
  if (tab === "drafts") filteredRows = []; 

  // Revenue calc
  let totalRevenue = 0;
  rows?.forEach(r => {
    totalRevenue += (r.students_count || 0) * (r.price_cents / 100);
  });

  return (
    <div className="bg-[#F4F5F7] min-h-screen text-[#1E293B] font-sans pb-20">
      
      {/* Topbar / Header */}
      <div className="bg-white border-b border-neutral-200 px-8 py-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-[#111827] tracking-tight">Os meus Produtos</h1>
            <p className="text-neutral-500 text-sm mt-1">Gere o teu portfólio de cursos, mentorias e conteúdos.</p>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/admin/products/new" className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#FF4500] hover:bg-[#E03E00] text-white text-sm font-bold rounded-lg transition-colors shadow-sm">
              <PackagePlus size={18} />
              Novo Produto
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-8 mt-8">
        
        {/* KPI Cards (Hotmart Style: very clean, white, subtle borders) */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-500 mb-4">
              <span className="text-sm font-semibold">Total de Produtos</span>
              <LayoutGrid size={18} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-[#111827]">{totalProducts}</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-500 mb-4">
              <span className="text-sm font-semibold">Ativos</span>
              <Activity size={18} className="text-green-500" />
            </div>
            <div>
              <h3 className="text-3xl font-black text-[#111827]">{activeProducts}</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-500 mb-4">
              <span className="text-sm font-semibold">Total de Alunos</span>
              <Eye size={18} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-[#111827]">{rows?.reduce((acc, curr) => acc + (curr.students_count || 0), 0)}</h3>
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-neutral-200 shadow-sm flex flex-col justify-between">
            <div className="flex items-center justify-between text-neutral-500 mb-4">
              <span className="text-sm font-semibold">Receita Gerada</span>
              <TrendingUp size={18} className="text-[#FF4500]" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-[#FF4500]">Kz {fmt(totalRevenue)}</h3>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="bg-white border border-neutral-200 rounded-xl shadow-sm overflow-hidden">
          
          {/* Tabs & Search */}
          <div className="px-6 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              <Link href="?tab=all" className={`py-4 text-sm font-bold border-b-2 transition-colors ${tab === 'all' ? 'border-[#FF4500] text-[#FF4500]' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}>
                Todos os produtos
              </Link>
              <Link href="?tab=active" className={`py-4 text-sm font-bold border-b-2 transition-colors ${tab === 'active' ? 'border-[#FF4500] text-[#FF4500]' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}>
                Ativos
              </Link>
              <Link href="?tab=drafts" className={`py-4 text-sm font-bold border-b-2 transition-colors ${tab === 'drafts' ? 'border-[#FF4500] text-[#FF4500]' : 'border-transparent text-neutral-500 hover:text-neutral-800'}`}>
                Rascunhos
              </Link>
            </div>
            
            <div className="pb-4 sm:pb-0">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input 
                  type="text" 
                  placeholder="Procurar produto..." 
                  className="pl-9 pr-4 py-2 border border-neutral-300 rounded-lg text-sm w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-[#FF4500]/20 focus:border-[#FF4500] transition-shadow"
                />
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-neutral-500 bg-neutral-50/50 uppercase border-b border-neutral-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">Produto</th>
                  <th className="px-6 py-4 font-semibold">Tipo</th>
                  <th className="px-6 py-4 font-semibold">Preço</th>
                  <th className="px-6 py-4 font-semibold">Vendas / Alunos</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredRows.map(product => (
                  <tr key={product.id} className="hover:bg-neutral-50/80 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg bg-neutral-100 flex items-center justify-center overflow-hidden shrink-0 border border-neutral-200">
                          {product.image_url ? (
                            <img src={product.image_url} alt={product.title} className="w-full h-full object-cover" />
                          ) : (
                            <PackagePlus size={20} className="text-neutral-400" />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-[#111827] mb-0.5 group-hover:text-[#FF4500] transition-colors">{product.title}</div>
                          <div className="text-xs text-neutral-500">ID: {product.id.split('-')[0]}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-600">
                      <div className="flex items-center gap-1.5">
                        {product.type === 'course' && <PlaySquare size={14} />}
                        <span className="capitalize">{product.type === 'course' ? 'Curso' : product.type === 'book' ? 'E-book' : 'Mentoria'}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-neutral-900">
                      Kz {fmt(Math.round(product.price_cents / 100))}
                    </td>
                    <td className="px-6 py-4 text-neutral-600">
                      {product.students_count || 0}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800`}>
                        Ativo
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/products/${product.id}`} className="p-2 text-neutral-400 hover:text-[#FF4500] hover:bg-[#FFF0EB] rounded-lg transition-colors" title="Editar Produto">
                          <Edit size={18} />
                        </Link>
                        <Link href={`/product/${product.slug}`} target="_blank" className="p-2 text-neutral-400 hover:text-[#FF4500] hover:bg-[#FFF0EB] rounded-lg transition-colors" title="Ver Página de Vendas">
                          <ExternalLink size={18} />
                        </Link>
                        <button className="p-2 text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 rounded-lg transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredRows.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <div className="flex flex-col items-center justify-center">
                        <PackagePlus size={48} className="text-neutral-300 mb-4" />
                        <h3 className="text-lg font-bold text-neutral-900 mb-1">Nenhum produto encontrado</h3>
                        <p className="text-neutral-500 text-sm mb-6">Ainda não tens produtos {tab === 'active' ? 'ativos' : tab === 'drafts' ? 'em rascunho' : ''} nesta secção.</p>
                        <Link href="/admin/products/new" className="px-4 py-2 bg-neutral-900 hover:bg-black text-white text-sm font-bold rounded-lg transition-colors">
                          Criar o meu primeiro produto
                        </Link>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
        </div>
      </div>
    </div>
  )
}
