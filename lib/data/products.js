import { createClient } from "@/lib/supabase/server"
import { categoryTree } from "@/lib/data/categories"

export const typeLabels = {
  course: "Curso",
  book: "Livro",
  mentorship: "Mentoria",
  event: "Evento"
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
    instructor: r.instructor_name,
    role: r.instructor_role,
    price: Math.round((r.price_cents || 0) / 100),
    originalPrice: Math.round((r.original_price_cents || 0) / 100),
    discount: r.discount_pct || 0,
    bestSeller: !!r.best_seller,
    students: r.students_count || 0,
    reviewsPositive: r.reviews_positive_pct || 0,
    reviewsCount: r.reviews_count || "0",
    event_starts_at: r.event_starts_at,
    event_meeting_url: r.event_meeting_url
  }
}

export async function getProducts({ type, category, search } = {}) {
  const supabase = createClient()
  let q = supabase.from("products")
    .select("*")
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
    .select("*")
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
