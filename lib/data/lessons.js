import { createClient, createServiceClient } from "@/lib/supabase/server"

const SIGNED_URL_SECONDS = 60 * 60 // 1h

// Aceita: `storage:lessons/<path>` → signed URL no bucket "lessons"
// Aceita: `https://…` → devolve como está (URLs externos, Mux, Bunny, demo)
async function resolveVideoUrl(rawUrl) {
  if (!rawUrl) return null
  if (rawUrl.startsWith("storage:")) {
    const [, rest] = rawUrl.split("storage:")
    const slash = rest.indexOf("/")
    const bucket = rest.slice(0, slash)
    const path = rest.slice(slash + 1)
    const svc = createServiceClient()
    const { data, error } = await svc.storage.from(bucket).createSignedUrl(path, SIGNED_URL_SECONDS)
    if (error) {
      console.error("[resolveVideoUrl]", error.message)
      return null
    }
    return data.signedUrl
  }
  return rawUrl
}

export async function getLessonsForProduct(productId) {
  const supabase = createClient()
  
  const { data: modules, error: errM } = await supabase
    .from("modules")
    .select("id, title, position")
    .eq("product_id", productId)
    .order("position", { ascending: true })
    
  if (errM || !modules || modules.length === 0) return []

  const { data, error } = await supabase
    .from("lessons")
    .select("id, title, description, video_url, duration_seconds, position, is_preview, module_id")
    .in("module_id", modules.map(m => m.id))
    .order("position", { ascending: true })

  if (error) {
    console.error("[getLessonsForProduct]", error.message)
    return []
  }

  // Flatten and sort by module position then lesson position
  const sortedLessons = []
  for (const mod of modules) {
    const modLessons = (data || []).filter(l => l.module_id === mod.id).sort((a, b) => a.position - b.position)
    for (const l of modLessons) {
      sortedLessons.push({
        ...l,
        module_title: mod.title,
        module_position: mod.position,
      })
    }
  }

  const resolved = await Promise.all(
    sortedLessons.map(async l => ({ ...l, video_url: await resolveVideoUrl(l.video_url) }))
  )
  return resolved
}

export async function getMyProgress(productId) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return {}

  const { data: modules } = await supabase
    .from("modules")
    .select("id")
    .eq("product_id", productId)

  if (!modules || modules.length === 0) return {}

  const { data: lessons } = await supabase
    .from("lessons")
    .select("id")
    .in("module_id", modules.map(m => m.id))

  const ids = (lessons || []).map(l => l.id)
  if (!ids.length) return {}
  const { data: progress } = await supabase
    .from("lesson_progress")
    .select("lesson_id, watched_seconds, completed")
    .in("lesson_id", ids)
    .eq("user_id", user.id)
  return Object.fromEntries((progress || []).map(p => [p.lesson_id, p]))
}

export async function getCourseProgressPercentages(productIds) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !productIds || productIds.length === 0) return {}

  const { data: modules } = await supabase.from("modules").select("id, product_id").in("product_id", productIds)
  if (!modules || modules.length === 0) return {}

  const { data: lessons } = await supabase.from("lessons").select("id, module_id").in("module_id", modules.map(m => m.id))
  if (!lessons || lessons.length === 0) return {}

  const { data: progress } = await supabase.from("lesson_progress").select("lesson_id").in("lesson_id", lessons.map(l => l.id)).eq("user_id", user.id).eq("completed", true)

  const counts = {}
  productIds.forEach(pid => counts[pid] = { total: 0, completed: 0 })

  const moduleToProduct = {}
  modules.forEach(m => moduleToProduct[m.id] = m.product_id)

  const lessonToProduct = {}
  lessons.forEach(l => {
    const pid = moduleToProduct[l.module_id]
    lessonToProduct[l.id] = pid
    if (counts[pid]) counts[pid].total++
  })

  ;(progress || []).forEach(p => {
    const pid = lessonToProduct[p.lesson_id]
    if (counts[pid]) counts[pid].completed++
  })

  const percentages = {}
  for (const pid of productIds) {
    if (counts[pid].total === 0) percentages[pid] = 0
    else percentages[pid] = Math.round((counts[pid].completed / counts[pid].total) * 100)
  }

  return percentages
}
