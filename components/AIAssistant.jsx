"use client"

import { useState, useRef, useEffect } from "react"
import { MessageSquare, X, Send, Bot, User } from "lucide-react"

export default function AIAssistant({ courseTitle, lessonTitle }) {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: "assistant", content: `Olá! Eu sou o Sacapuri, o teu assistente de IA. Como te posso ajudar com a aula "${lessonTitle}"?` }
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput("")
    setMessages(prev => [...prev, { role: "user", content: userMessage }])
    setIsLoading(true)

    // Simulando chamada à API (ex: Groq)
    try {
      // Num ambiente real, fariamos um fetch para /api/ai/chat
      // fetch("/api/ai/chat", { method: "POST", body: JSON.stringify({ message: userMessage, context: lessonTitle }) })
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: `(Simulação) Estou a processar a tua dúvida sobre "${userMessage}". Esta resposta é gerada pelo Sacapuri. Em breve estarei ligado à API do Groq para respostas reais!`
      }])
    } catch (error) {
      setMessages(prev => [...prev, { role: "assistant", content: "Desculpa, tive um problema a processar a tua mensagem." }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 w-14 h-14 bg-[#FF4500] text-white rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(255,69,0,0.4)] hover:scale-110 transition-transform z-40 ${isOpen ? 'scale-0 opacity-0' : 'scale-100 opacity-100'}`}
      >
        <MessageSquare className="w-6 h-6" />
      </button>

      {/* Chat Drawer / Window */}
      <div 
        className={`fixed bottom-6 right-6 w-[380px] h-[600px] max-h-[80vh] bg-[#111111] border border-neutral-800 rounded-2xl shadow-2xl flex flex-col z-50 transition-all duration-300 origin-bottom-right
        ${isOpen ? 'scale-100 opacity-100 translate-y-0' : 'scale-90 opacity-0 translate-y-10 pointer-events-none'}`}
      >
        {/* Header */}
        <div className="p-4 border-b border-neutral-800 flex items-center justify-between bg-gradient-to-r from-[#1A1A1A] to-[#111] rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#FF4500]/20 flex items-center justify-center text-[#FF4500]">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">Sacapuri IA</h3>
              <p className="text-xs text-[#FF4500]">Online e a aprender</p>
            </div>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="text-neutral-500 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-neutral-800' : 'bg-[#FF4500]/20 text-[#FF4500]'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4 text-white" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className={`px-4 py-3 rounded-2xl text-sm max-w-[80%] ${
                msg.role === 'user' 
                  ? 'bg-neutral-800 text-white rounded-tr-sm' 
                  : 'bg-[#1A1A1A] border border-neutral-800 text-neutral-300 rounded-tl-sm'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-[#FF4500]/20 text-[#FF4500] flex items-center justify-center shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-[#1A1A1A] border border-neutral-800 text-neutral-300 rounded-tl-sm text-sm flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce delay-100"></span>
                <span className="w-1.5 h-1.5 bg-neutral-500 rounded-full animate-bounce delay-200"></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <div className="p-4 border-t border-neutral-800 bg-[#1A1A1A] rounded-b-2xl">
          <form onSubmit={handleSubmit} className="relative">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Pergunta algo sobre a aula..."
              className="w-full bg-[#111] border border-neutral-800 text-sm text-white rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-[#FF4500] transition-colors"
            />
            <button 
              type="submit"
              disabled={!input.trim() || isLoading}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-[#FF4500] hover:bg-[#FF4500]/10 rounded-lg transition-colors disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
          <div className="text-center mt-2">
            <span className="text-[10px] text-neutral-600">As respostas são geradas por Inteligência Artificial.</span>
          </div>
        </div>
      </div>
    </>
  )
}
