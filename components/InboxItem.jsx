"use client"

import { useState } from "react"
import { markAsRead, sendMessage } from "@/app/inbox/actions"

export default function InboxItem({ message, sender, isBroadcast, currentUserId }) {
  const [open, setOpen] = useState(false)
  const [replyText, setReplyText] = useState("")
  const [loading, setLoading] = useState(false)

  const isUnread = !isBroadcast && !message.is_read

  const handleOpen = () => {
    setOpen(!open)
    if (!open && isUnread) {
      markAsRead(message.id)
    }
  }

  const handleReply = async (e) => {
    e.preventDefault()
    if (!replyText.trim()) return
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append("recipient_id", message.sender_id)
      fd.append("subject", `Re: ${message.subject || "Dúvida da aula"}`)
      fd.append("content", replyText)
      if (message.lesson_id) fd.append("lesson_id", message.lesson_id)
      if (message.product_id) fd.append("product_id", message.product_id)

      await sendMessage(fd)
      setReplyText("")
      alert("Resposta enviada com sucesso!")
      setOpen(false)
    } catch (err) {
      alert("Erro ao enviar resposta.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`p-4 hover:bg-neutral-50 transition-colors ${isUnread ? "bg-blue-50/30" : ""}`}>
      <div 
        className="flex items-start gap-3 cursor-pointer"
        onClick={handleOpen}
      >
        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${isBroadcast ? "bg-purple-100 text-purple-600" : "bg-neutral-100 text-neutral-600"}`}>
          {isBroadcast ? "📢" : (sender?.full_name?.[0]?.toUpperCase() || "U")}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <span className={`text-sm truncate ${isUnread ? "font-bold text-black" : "font-medium text-neutral-700"}`}>
              {isBroadcast ? "Sistema ABOVE" : (sender?.full_name || "Utilizador Desconhecido")}
              {sender?.role === "admin" && <span className="ml-2 text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded">Admin</span>}
              {sender?.role === "creator" && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">Criador</span>}
            </span>
            <span className="text-xs text-neutral-400 whitespace-nowrap">
              {new Date(message.created_at).toLocaleDateString("pt-PT")}
            </span>
          </div>
          <div className={`text-sm mt-0.5 truncate ${isUnread ? "font-semibold text-neutral-900" : "text-neutral-600"}`}>
            {message.subject || "Sem assunto"}
          </div>
          {message.lessons?.title && (
            <div className="text-xs text-neutral-400 mt-1 truncate">
              Aula: {message.lessons.title} • Curso: {message.products?.title}
            </div>
          )}
        </div>
      </div>

      {open && (
        <div className="mt-4 pl-13 pr-4 pb-2 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="bg-neutral-50 p-4 rounded-lg border border-neutral-200 text-sm whitespace-pre-wrap text-neutral-800">
            {message.content}
          </div>

          {!isBroadcast && message.sender_id !== currentUserId && (
            <form onSubmit={handleReply} className="mt-4 border border-neutral-200 rounded-lg overflow-hidden bg-white">
              <textarea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Escreve a tua resposta..."
                className="w-full text-sm p-3 focus:outline-none focus:ring-0 min-h-[80px]"
                required
              />
              <div className="bg-neutral-50 px-3 py-2 flex justify-end border-t border-neutral-200">
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-[#0E7C86] hover:bg-[#0a626a] text-white text-xs font-bold px-4 py-2 rounded disabled:opacity-50"
                >
                  {loading ? "A enviar..." : "Responder"}
                </button>
              </div>
            </form>
          )}
        </div>
      )}
    </div>
  )
}
