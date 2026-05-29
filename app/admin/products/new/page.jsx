import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import CreateProductForm from "@/components/CreateProductForm"
import Link from "next/link"
import { ArrowLeft, PackagePlus } from "lucide-react"

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

  const { data: settingsRows } = await supabase.from("platform_settings").select("key, value")
  const settings = {}
  for (const row of settingsRows || []) {
    settings[row.key] = row.value === "true"
  }
  const platformVideoEnabled = settings.upload_video_enabled !== false
  const platformPhotoEnabled = settings.upload_photo_enabled !== false

  return (
    <div className="bg-[#F4F5F7] min-h-screen text-[#1E293B] font-sans pb-20">
      
      {/* Topbar / Header Minimalista */}
      <div className="bg-white border-b border-neutral-200 px-4 sm:px-8 py-4 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/products" className="p-2 text-neutral-400 hover:text-[#FF4500] hover:bg-[#FFF0EB] rounded-full transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <div className="h-6 w-px bg-neutral-200 hidden sm:block"></div>
            <div className="flex items-center gap-2">
              <PackagePlus size={20} className="text-[#FF4500]" />
              <h1 className="text-lg font-bold text-[#111827]">Novo Produto</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 mt-8">
        {/* Intro */}
        <div className="mb-8 text-center sm:text-left">
          <h2 className="text-2xl font-black text-[#111827] tracking-tight">O que vais criar hoje?</h2>
          <p className="text-neutral-500 mt-2">Preenche as informações básicas para iniciar a configuração do teu novo infoproduto.</p>
        </div>

        {/* Formulário Principal */}
        <CreateProductForm 
          userId={user.id}
          isStorageActive={isStorageActive} 
          platformVideoEnabled={platformVideoEnabled} 
          platformPhotoEnabled={platformPhotoEnabled} 
        />
      </div>
    </div>
  )
}
