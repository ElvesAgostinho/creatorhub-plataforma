"use client"
import Logo from "@/components/brand/Logo"
import AuthShowcase from "@/components/mockups/AuthShowcase"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    setLoading(false)
    if (error) {
      setError("Email ou palavra-passe incorrectos. Tenta novamente.")
      return
    }
    router.push("/")
    router.refresh()
  }

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE: FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 bg-white">
        <div className="max-w-md w-full mx-auto">

          {/* Logo */}
          <a href="/" className="inline-block mb-10">
            <Logo size="lg" />
          </a>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-ink-800 tracking-tight">Bem-vindo de volta</h1>
            <p className="text-neutral-500 mt-2 text-base">Entra na tua conta para continuar a aprender.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                placeholder="o.teu.email@exemplo.com"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-sm font-semibold text-neutral-700">Palavra-passe</label>
                <a href="/support" className="text-xs text-brand hover:underline font-medium">Esqueceste?</a>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 pr-12 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand/20 focus:border-brand transition-all"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl flex items-start gap-2">
                <span className="text-red-500 mt-0.5">⚠</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-brand hover:bg-brand-dark disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all shadow-brand flex items-center justify-center gap-2 text-sm mt-2"
            >
              {loading ? (
                <><Loader2 size={18} className="animate-spin" /> A entrar…</>
              ) : "Entrar na conta"}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-xs text-neutral-400 font-medium">ou</span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          <p className="text-center text-sm text-neutral-600">
            Ainda não tens conta?{" "}
            <a href="/signup" className="font-bold text-brand hover:underline">Criar conta grátis</a>
          </p>
        </div>
      </div>

      {/* LADO DIREITO: A PLATAFORMA */}
      <AuthShowcase
        title="Aprende, Ensina, Evolui."
        subtitle="Junta-te aos criadores e alunos que transformam conhecimento em resultados reais todos os dias."
        badges={["Certificado digital", "Pagamento seguro", "Acesso vitalício"]}
      />

    </div>
  )
}
