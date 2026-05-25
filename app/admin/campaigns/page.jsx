import { createServiceClient } from "@/lib/supabase/server"
import { getProducts } from "@/lib/data/products"
import CampaignsClient from "./CampaignsClient"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Marketing e Campanhas — Admin",
}

export default async function CampaignsPage() {
  const svc = createServiceClient()

  // Fetch highlights
  const { data: highlights } = await svc
    .from("hero_highlights")
    .select("*, products(title, image_url)")
    .order("priority_weight", { ascending: false })

  // Fetch past campaigns
  const { data: campaigns } = await svc
    .from("marketing_campaigns")
    .select("*")
    .order("created_at", { ascending: false })

  // Fetch all published products for the select dropdown
  const allProducts = await getProducts()

  return (
    <div className="p-8 max-w-6xl mx-auto min-h-screen">
      <div className="mb-10">
        <h1 className="text-4xl font-black tracking-tight text-neutral-900 mb-2">Marketing & Campanhas 🚀</h1>
        <p className="text-neutral-500 font-medium">Gere os destaques do Marketplace e dispara e-mails para toda a base de alunos.</p>
      </div>

      <CampaignsClient 
        highlights={highlights || []} 
        campaigns={campaigns || []} 
        products={allProducts} 
      />
    </div>
  )
}
