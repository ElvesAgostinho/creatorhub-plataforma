import { redirect } from "next/navigation"
import { createClient, createServiceClient } from "@/lib/supabase/server"
import InboxItem from "@/components/InboxItem"

export const dynamic = "force-dynamic"

export default async function InboxPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login?next=/inbox")

  const svc = createServiceClient()

  // Fetch messages where recipient is the user, or recipient is NULL (broadcasts)
  const { data: messages } = await svc
    .from("messages")
    .select(`
      id, sender_id, recipient_id, subject, content, is_read, created_at, lesson_id, product_id,
      products(title),
      lessons(title)
    `)
    .or(`recipient_id.eq.${user.id},recipient_id.is.null`)
    .order("created_at", { ascending: false })
    .limit(50)

  // Fetch senders' names
  const senderIds = [...new Set((messages || []).map(m => m.sender_id).filter(Boolean))]
  let senderProfiles = {}
  if (senderIds.length > 0) {
    const { data: profs } = await svc.from("profiles").select("id, full_name, role").in("id", senderIds)
    senderProfiles = Object.fromEntries((profs || []).map(p => [p.id, p]))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-3xl font-extrabold">Caixa de Mensagens</h1>
      </div>

      <div className="bg-white border border-neutral-200 rounded-2xl shadow-sm overflow-hidden divide-y divide-neutral-100">
        {(!messages || messages.length === 0) && (
          <div className="p-10 text-center text-neutral-500">
            A tua caixa está vazia. Não tens novas mensagens.
          </div>
        )}
        
        {messages?.map(msg => (
          <InboxItem 
            key={msg.id}
            message={msg}
            sender={senderProfiles[msg.sender_id]}
            isBroadcast={!msg.recipient_id}
            currentUserId={user.id}
          />
        ))}
      </div>
    </div>
  )
}
