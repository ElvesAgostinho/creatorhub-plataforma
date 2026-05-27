"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Eye, EyeOff, Loader2, CheckCircle2 } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const supabase = createClient()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [done, setDone] = useState(false)

  const passwordStrength = password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3
  const strengthLabels = ["", "Fraca", "Média", "Forte"]
  const strengthColors = ["", "bg-red-400", "bg-yellow-400", "bg-green-500"]

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true); setError(null)
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
    if (data?.session) { router.push("/"); router.refresh() }
    else setDone(true)
  }

  if (done) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white px-4">
        <div className="max-w-md w-full text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-extrabold text-neutral-900 mb-3">Conta criada com sucesso!</h2>
          <p className="text-neutral-500 mb-6">Enviámos um link de confirmação para <strong>{email}</strong>. Verifica a tua caixa de entrada e clica no link para activares a conta.</p>
          <a href="/login" className="inline-block bg-[#FF4500] text-white font-bold px-8 py-3.5 rounded-xl hover:bg-[#E03E00] transition">
            Ir para o Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      {/* LEFT SIDE: FORM */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-16 lg:px-24 py-12 bg-white">
        <div className="max-w-md w-full mx-auto">

          <a href="/" className="inline-block mb-10">
            <span className="text-2xl font-black italic tracking-tighter text-neutral-900">ABOVE</span>
          </a>

          <div className="mb-8">
            <h1 className="text-3xl font-extrabold text-[#111] tracking-tight">Cria a tua conta</h1>
            <p className="text-neutral-500 mt-2 text-base">Junta-te a milhares de alunos e começa a aprender hoje.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Nome completo</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4500]/20 focus:border-[#FF4500] transition-all"
                placeholder="O teu nome completo"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4500]/20 focus:border-[#FF4500] transition-all"
                placeholder="o.teu.email@exemplo.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-neutral-700 mb-1.5">Palavra-passe</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={6}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3.5 pr-12 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#FF4500]/20 focus:border-[#FF4500] transition-all"
                  placeholder="Mínimo 6 caracteres"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 transition">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              {password.length > 0 && (
                <div className="mt-2 space-y-1">
                  <div className="flex gap-1">
                    {[1,2,3].map(i => (
                      <div key={i} className={`h-1 flex-1 rounded-full transition-all ${i <= passwordStrength ? strengthColors[passwordStrength] : "bg-neutral-200"}`} />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-500 font-medium">Força: <span className={`font-bold ${passwordStrength === 1 ? "text-red-500" : passwordStrength === 2 ? "text-yellow-600" : "text-green-600"}`}>{strengthLabels[passwordStrength]}</span></p>
                </div>
              )}
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm font-medium px-4 py-3 rounded-xl flex items-start gap-2">
                <span className="mt-0.5">⚠</span> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF4500] hover:bg-[#E03E00] disabled:opacity-60 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-[#FF4500]/20 flex items-center justify-center gap-2 text-sm mt-2"
            >
              {loading ? <><Loader2 size={18} className="animate-spin" /> A criar conta…</> : "Criar conta grátis"}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-neutral-200" />
            <span className="text-xs text-neutral-400 font-medium">ou</span>
            <div className="flex-1 h-px bg-neutral-200" />
          </div>

          <p className="text-center text-sm text-neutral-600">
            Já tens conta?{" "}
            <a href="/login" className="font-bold text-[#FF4500] hover:underline">Entrar</a>
          </p>

          <p className="text-center text-xs text-neutral-400 mt-6">
            Ao criares conta, aceitas os nossos{" "}
            <a href="/support" className="underline hover:text-neutral-700">Termos de Serviço</a>
            {" "}e{" "}
            <a href="/support" className="underline hover:text-neutral-700">Política de Privacidade</a>.
          </p>
        </div>
      </div>

      {/* RIGHT SIDE: VISUAL */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#111] relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20 z-10" />
        <img src="/auth_side_image.png" alt="Inspiração" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 z-20 flex flex-col justify-end p-16 pb-20 text-white bg-gradient-to-t from-[#111]/95 via-[#111]/40 to-transparent">
          <div className="flex gap-3 mb-8 flex-wrap">
            {["✅ +10.000 alunos", "🎓 Certificado digital", "🔒 Pagamento seguro"].map(b => (
              <span key={b} className="bg-white/10 backdrop-blur-sm border border-white/20 text-white text-xs font-semibold px-3 py-1.5 rounded-full">{b}</span>
            ))}
          </div>
          <h2 className="text-4xl font-extrabold mb-4 leading-tight">Constrói o teu futuro digital.</h2>
          <p className="text-base text-neutral-300 max-w-md leading-relaxed">
            Mais de 10.000 profissionais já criaram os seus negócios online com a nossa plataforma. O próximo és tu.
          </p>
        </div>
      </div>
    </div>
  )
}
