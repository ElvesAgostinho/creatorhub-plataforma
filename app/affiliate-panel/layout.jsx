import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import AffiliateSidebar from "@/components/AffiliateSidebar"

export const dynamic = "force-dynamic"

export default async function AffiliatePanelLayout({ children }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/affiliate-panel")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .single()

  const { data: application } = await supabase
    .from("affiliate_applications")
    .select("status")
    .eq("user_id", user.id)
    .maybeSingle()

  if (!application || application.status !== "approved") {
    redirect("/affiliates")
  }

  return (
    <AffiliateSidebar userProfile={profile}>
      {children}
    </AffiliateSidebar>
  )
}
