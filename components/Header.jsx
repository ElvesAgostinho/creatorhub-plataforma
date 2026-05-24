import { createClient } from "@/lib/supabase/server"
import HeaderUI from "@/components/HeaderUI"

export default async function Header() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  let unreadCount = 0
  if (user) {
    const { data } = await supabase.from("profiles").select("role").eq("id", user.id).maybeSingle()
    profile = data
    const { count } = await supabase.from("messages").select("*", { count: "exact", head: true }).eq("recipient_id", user.id).eq("is_read", false)
    unreadCount = count || 0
  }

  return (
    <HeaderUI user={user} profile={profile} unreadCount={unreadCount} />
  )
}
