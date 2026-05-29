import { notFound, redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import Link from "next/link"
import { ArrowLeft, Download, BookOpen } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function EbookReaderPage({ params }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/ebook/${params.slug}`)

  const svc = createServiceClient()
  
  // Find product by slug
  const { data: product } = await svc
    .from("products")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle()

  if (!product) notFound()
  if (product.type !== "book") redirect("/library")

  // VERIFY ACCESS
  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
  const isAdmin = profile?.role === "admin"
  
  let hasAccess = isAdmin
  if (!hasAccess) {
    const { data: purchase } = await svc
      .from("purchases")
      .select("status")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .eq("status", "active")
      .maybeSingle()
    
    if (purchase) hasAccess = true
  }

  if (!hasAccess) {
    redirect(`/product/${params.slug}`)
  }

  const pdfUrl = `/api/books/${product.slug}/download`

  return (
    <div className="h-screen flex flex-col bg-[#F4F5F7] overflow-hidden font-sans">
      
      {/* HEADER */}
      <header className="h-16 bg-white border-b border-neutral-200 flex items-center justify-between px-6 shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Link href="/library" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-neutral-100 text-neutral-500 transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#FFF0EB] text-[#FF4500] flex items-center justify-center hidden md:flex">
              <BookOpen size={20} />
            </div>
            <div>
              <h1 className="font-bold text-neutral-900 text-sm md:text-base leading-tight line-clamp-1">{product.title}</h1>
              <p className="text-xs font-medium text-neutral-500">Leitura Online</p>
            </div>
          </div>
        </div>

        {/* DOWNLOAD ACTION */}
        <div className="flex items-center gap-3">
          <a 
            href={pdfUrl} 
            download={`${product.slug}.pdf`}
            className="flex items-center gap-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-sm font-bold px-4 py-2 rounded-lg transition-colors"
          >
            <Download size={16} />
            <span className="hidden sm:inline">Baixar PDF</span>
          </a>
        </div>
      </header>

      {/* PDF VIEWER CONTAINER */}
      <main className="flex-1 w-full bg-[#E5E7EB] relative">
        <iframe 
          src={`${pdfUrl}#toolbar=0&navpanes=0`} 
          className="w-full h-full border-none shadow-inner"
          title={`E-book: ${product.title}`}
          sandbox="allow-scripts allow-same-origin"
        ></iframe>
      </main>

    </div>
  )
}
