import { notFound, redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import AudiobookPlayer from "@/components/AudiobookPlayer"

export const dynamic = "force-dynamic"

export default async function AudiobookPage({ params }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/audiobook/${params.slug}`)

  const svc = createServiceClient()

  const { data: product } = await svc
    .from("products")
    .select("*, profiles(full_name)")
    .eq("slug", params.slug)
    .maybeSingle()

  if (!product) notFound()
  if (product.type !== "audiobook") redirect("/library")

  // Verificar acesso
  const { data: profile } = await svc.from("profiles").select("role").eq("id", user.id).maybeSingle()
  const isAdmin = profile?.role === "admin"

  let hasAccess = isAdmin
  if (!hasAccess) {
    const { data: purchase } = await svc
      .from("purchases")
      .select("id")
      .eq("user_id", user.id)
      .eq("product_id", product.id)
      .eq("status", "active")
      .maybeSingle()
    if (purchase) hasAccess = true
  }

  if (!hasAccess) redirect(`/product/${params.slug}`)

  const productData = {
    id: product.id,
    slug: product.slug,
    title: product.title,
    image: product.image_url,
    instructor: product.profiles?.full_name || "Autor",
  }

  const streamUrl = `/api/audio/${product.slug}/stream`

  return <AudiobookPlayer product={productData} streamUrl={streamUrl} />
}
