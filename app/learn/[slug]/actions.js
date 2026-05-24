"use server"

import { createClient } from "@/lib/supabase/server"

export async function saveProgress({ lessonId, watchedSeconds, completed }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Não autenticado." }

  const payload = {
    user_id: user.id,
    lesson_id: lessonId,
    watched_seconds: Math.max(0, Math.floor(watchedSeconds || 0)),
    completed: !!completed,
    completed_at: completed ? new Date().toISOString() : null,
    updated_at: new Date().toISOString()
  }

  const { error } = await supabase
    .from("lesson_progress")
    .upsert(payload, { onConflict: "user_id,lesson_id" })

  if (error) return { ok: false, error: error.message }
  return { ok: true }
}

export async function addXP({ academyId, xpAmount, actionType }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { ok: false, error: "Não autenticado." }

  // 1. Verificamos se já ganhámos XP para esta ação hoje (para evitar spam de refresh de página)
  // Mas para simplificar nesta fase 1, vamos inserir sempre, a não ser que a ação seja "lesson_complete",
  // aí poderíamos verificar, mas o upsert já cuida do progresso.
  // Vamos apenas inserir no log.
  
  const { error } = await supabase
    .from("user_xp_logs")
    .insert({
      user_id: user.id,
      academy_id: academyId,
      xp_amount: xpAmount,
      action_type: actionType
    })

  if (error) {
    console.error("Error adding XP:", error)
    return { ok: false, error: error.message }
  }
  
  return { ok: true }
}
