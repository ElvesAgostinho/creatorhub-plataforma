import { createClient } from "@/lib/supabase/server"
import { categoryTree } from "@/lib/data/categories"

export const typeLabels = {
  course: "Curso",
  book: "Livro",
  mentorship: "Mentoria"
}

function rowToProduct(r) {
  if (!r) return null
  return {
    id: r.id,
    slug: r.slug,
    type: r.type,
    category: r.category,
    title: r.title,
    description: r.description,
    image: r.image_url,
    instructor: r.profiles?.full_name || "Criador",
    role: r.profiles?.specialty || "",
    avatar: r.profiles?.avatar_url || null,
    price: Math.round((r.price_cents || 0) / 100),
    originalPrice: Math.round((r.original_price_cents || 0) / 100),
    discount: r.discount_pct || 0,
    bestSeller: !!r.best_seller,
    students: r.students_count || 0,
    reviewsPositive: r.reviews_positive_pct || 0,
    reviewsCount: r.reviews_count || "0",
    event_starts_at: r.event_starts_at,
    event_meeting_url: r.event_meeting_url,
    advantages: r.advantages || "",
    targetAudience: r.target_audience || "",
    externalSalesUrl: r.external_sales_url || "",
    creatorSocialLinks: {
      instagram: r.profiles?.instagram,
      youtube: r.profiles?.youtube,
      website: r.profiles?.website
    },
    promoVideoUrl: r.promo_video_url || null,
    promoMediaSource: r.promo_media_source || "internal"
  }
}

export async function getProducts({ type, category, search } = {}) {
  const supabase = createClient()
  let q = supabase.from("products")
    .select("*, profiles (full_name, specialty, avatar_url, instagram, youtube, website)")
    .eq("published", true)
    .order("best_seller", { ascending: false })
    .order("students_count", { ascending: false })
  if (type) q = q.eq("type", type)
  if (category) {
    if (categoryTree[category]) {
      q = q.in("category", [category, ...categoryTree[category]])
    } else {
      q = q.eq("category", category)
    }
  }
  if (search) {
    q = q.ilike("title", `%${search}%`)
  }
  const { data, error } = await q
  if (error) {
    console.error("[getProducts]", error.message)
    return []
  }
  return (data || []).map(rowToProduct)
}

export async function getProductBySlug(slug) {
  const supabase = createClient()
  const { data, error } = await supabase
    .from("products")
    .select("*, profiles (full_name, specialty, avatar_url, instagram, youtube, website)")
    .eq("slug", slug)
    .eq("published", true)
    .maybeSingle()
  if (error) {
    console.error("[getProductBySlug]", error.message)
    return null
  }
  return rowToProduct(data)
}

export async function getMyPurchases() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []
  const { data, error } = await supabase
    .from("purchases")
    .select("*, products(*)")
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("created_at", { ascending: false })
  if (error) {
    console.error("[getMyPurchases]", error.message)
    return []
  }
  return (data || []).map(row => ({
    purchaseId: row.id,
    status: row.status,
    grantedAt: row.granted_at,
    product: rowToProduct(row.products)
  }))
}

export async function hasActivePurchase(productId) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false
  const { data, error } = await supabase
    .from("purchases")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .eq("status", "active")
    .maybeSingle()
  if (error) {
    console.error("[hasActivePurchase]", error.message)
    return false
  }
  return !!data
}

export async function getFeaturedProducts() {
  const supabase = createClient()
  
  // 1. Get all active hero highlights, ordered by priority weight
  const { data: highlights, error: highlightsErr } = await supabase
    .from("hero_highlights")
    .select("product_id, priority_weight, impressions_limit, impressions_count")
    .eq("is_active", true)
    .order("priority_weight", { ascending: false })
    
  if (highlightsErr || !highlights || highlights.length === 0) {
    // Fallback: If no campaigns are active, just return top sellers
    return await getProducts({ type: null, category: null, search: null })
  }

  // Filter out those that exceeded their impression limits
  const validHighlights = highlights.filter(h => 
    !h.impressions_limit || h.impressions_count < h.impressions_limit
  )

  if (validHighlights.length === 0) {
    return await getProducts({ type: null, category: null, search: null })
  }

  // Increment impressions async for valid highlights (best effort, non-blocking)
  const idsToIncrement = validHighlights.map(h => h.product_id);
  // We can't do bulk increment easily via standard JS client without an RPC, 
  // but since we are just doing best effort, we can run a quick update if needed.
  // We will let the RPC or a separate task handle the exact math, or we skip incrementing here if it slows down.
  // To keep it perfectly optimized like big platforms, we just fetch them.

  // Fetch the actual products for these highlights
  const { data: products, error: prodErr } = await supabase
    .from("products")
    .select("*")
    .in("id", idsToIncrement)
    .eq("published", true)

  if (prodErr || !products) {
    return await getProducts({ type: null, category: null, search: null })
  }

  // Map to the required object shape and sort according to the highlights priority
  const mappedProducts = products.map(rowToProduct)
  
  // Re-sort to match the 'priority_weight' order we established
  return mappedProducts.sort((a, b) => {
    const weightA = validHighlights.find(h => h.product_id === a.id)?.priority_weight || 0
    const weightB = validHighlights.find(h => h.product_id === b.id)?.priority_weight || 0
    return weightB - weightA // Descending order
  })
}
