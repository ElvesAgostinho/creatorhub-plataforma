import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import LibrarySidebar from "@/components/LibrarySidebar"

export const dynamic = "force-dynamic"

export default async function LibraryLayout({ children }) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/login?next=/library")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, email")
    .eq("id", user.id)
    .maybeSingle()

  return (
    <LibrarySidebar userProfile={profile}>
      {children}
    </LibrarySidebar>
  )
}
