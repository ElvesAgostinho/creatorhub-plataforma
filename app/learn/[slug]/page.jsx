import { notFound, redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import CoursePlayer from "@/components/CoursePlayer"
import ErrorBoundary from "@/components/ErrorBoundary"

export const dynamic = "force-dynamic"

export default async function LearnPage({ params }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect(`/login?next=/learn/${params.slug}`)

  const svc = createServiceClient()
  
  // Find product by slug
  const { data: product } = await svc
    .from("products")
    .select("*")
    .eq("slug", params.slug)
    .maybeSingle()

  if (!product) notFound()

  // VERIFY ACCESS
  // 1. If admin, full access
  // 2. If bought it, full access
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
    // Redirect to sales page or library if no access
    redirect(`/product/${params.slug}`)
  }

  if (product.type !== "course") {
    // If it's a book or something else, handle differently (maybe redirect to a generic learn page or library)
    redirect("/library")
  }

  // Load modules and lessons
  const { data: modules } = await svc
    .from("modules")
    .select("*")
    .eq("product_id", product.id)
    .order("position", { ascending: true })

  const { data: lessons } = await svc
    .from("lessons")
    .select("*")
    .in("module_id", modules?.map(m => m.id) || [])
    .order("position", { ascending: true })

  // Fetch Academy settings for White-label branding
  let academy = null
  if (product.created_by) {
    const { data: ac } = await svc.from("creator_academies").select("*").eq("creator_id", product.created_by).maybeSingle()
    if (ac) academy = ac
  }

  // Fetch user progress for this course
  const { data: progressData } = await svc
    .from("lesson_progress")
    .select("lesson_id, watched_seconds, completed")
    .eq("user_id", user.id)
    .in("lesson_id", lessons?.map(l => l.id) || [])

  const initialProgress = {}
  if (progressData) {
    for (const p of progressData) {
      initialProgress[p.lesson_id] = { watched_seconds: p.watched_seconds, completed: p.completed }
    }
  }

  return (
    <ErrorBoundary>
      <CoursePlayer product={product} modules={modules || []} lessons={lessons || []} academy={academy} initialProgress={initialProgress} />
    </ErrorBoundary>
  )
}
