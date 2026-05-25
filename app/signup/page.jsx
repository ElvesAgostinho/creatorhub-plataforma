"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [info, setInfo] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true); setError(null); setInfo(null)

    const origin = typeof window !== "undefined" ? window.location.origin : ""
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName },
        emailRedirectTo: `${origin}/auth/callback`
      }
    })
    setLoading(false)

    if (error) { setError(error.message); return }

    if (data?.session) {
      router.push("/")
      router.refresh()
    } else {
      setInfo("Conta criada. Verifica o teu email para confirmar.")
    }
  }

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE: FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 bg-white">
        <div className="max-w-md w-full mx-auto">
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-[#111]">Criar conta</h1>
            <p className="text-neutral-600 mt-3 text-lg">Junta-te ao CreatorHub e começa a tua jornada.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="text-sm font-bold text-neutral-800">Nome completo</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="mt-2 w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#FF4500]/10 focus:border-[#FF4500] transition-all shadow-sm"
                placeholder="O teu nome"
              />
            </div>
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
              <p className="text-xs text-neutral-500 mt-2 font-medium">No mínimo 6 caracteres.</p>
            </div>

            {error && <p className="text-sm text-red-600 font-medium">{error}</p>}
            {info && <div className="bg-green-50 text-green-800 border border-green-200 p-4 rounded-xl text-sm font-medium">{info}</div>}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF4500] hover:bg-[#E03E00] disabled:opacity-60 text-white font-bold py-4 rounded-xl transition shadow-lg shadow-[#FF4500]/20 mt-4"
            >
              {loading ? "A criar…" : "Criar conta grátis"}
            </button>
          </form>

          <p className="text-center text-neutral-600 mt-8">
            Já tens conta?{" "}
            <a href="/login" className="font-bold text-[#FF4500] hover:underline">Entrar</a>
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
          <h2 className="text-4xl font-extrabold mb-4">Construir o futuro.</h2>
          <p className="text-lg text-neutral-300 max-w-md">Mais de 10.000 profissionais já criaram os seus negócios online com a nossa plataforma. O próximo és tu.</p>
        </div>
      </div>
    </div>
  )
}
