"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) { setError(error.message); return }
    router.push("/")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE: FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 bg-white">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-[#111]">Bem-vindo de volta</h1>
            <p className="text-neutral-600 mt-3 text-lg">A tua jornada contínua aqui no CreatorHub.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-bold text-neutral-800">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="mt-2 w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF4500]/10 focus:border-[#FF4500] transition-all shadow-sm"
                placeholder="o.teu.email@exemplo.com"
              />
            </div>
            <div>
              <label className="text-sm font-bold text-neutral-800">Palavra-passe</label>
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="mt-2 w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF4500]/10 focus:border-[#FF4500] transition-all shadow-sm"
                placeholder="••••••••"
              />
            </div>

            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF4500] hover:bg-[#E03E00] disabled:opacity-60 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-[#FF4500]/20 mt-4"
            >
              {loading ? "A entrar…" : "Entrar na conta"}
            </button>
          </form>

          <p className="text-center text-neutral-600 mt-8">
            Ainda não tens conta?{" "}
            <a href="/signup" className="font-bold text-[#FF4500] hover:underline">Criar conta</a>
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: IMAGE */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#111] relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20 z-10"></div>
        <img 
          src="/auth_side_image.png" 
          alt="Inspiração" 
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-16 pb-24 text-white bg-gradient-to-t from-[#111]/90 to-transparent">
          <h2 className="text-4xl font-extrabold mb-4">Aprende, Ensina, Evolui.</h2>
          <p className="text-lg text-neutral-300 max-w-md">Junta-te a milhares de criadores e alunos que transformam conhecimento em resultados reais todos os dias.</p>
        </div>
      </div>
    </div>
  )
}
