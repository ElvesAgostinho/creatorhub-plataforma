import AdminSidebar from "@/components/AdminSidebar"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export default async function AdminLayout({ children }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect("/login?next=/admin")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .maybeSingle()

  if (!profile || (profile.role !== "admin" && profile.role !== "creator")) {
    redirect("/") // Não tem permissão
  }

  return (
    <div className="min-h-screen bg-[#F8F7F5] flex font-sans text-neutral-900">
      {/* Barra Lateral Fixa (Desktop) */}
      <AdminSidebar role={profile.role} />
      
      {/* Área de Conteúdo Principal */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Mobile Header simples */}
        <header className="md:hidden h-14 bg-white border-b border-neutral-200 flex items-center justify-between px-4 shrink-0">
          <span className="font-black text-[#FF4500]">ABOVE Admin</span>
          <a href="/admin" className="text-xs font-bold text-neutral-500">Menu</a>
        </header>
        
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
