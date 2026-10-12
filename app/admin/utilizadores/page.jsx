import { redirect } from "next/navigation"
import { sql } from "@/lib/db/pool"
import { getUser, papelDe } from "@/lib/auth"
import UtilizadoresClient from "./UtilizadoresClient"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Utilizadores — Administração ABOVE",
}

const ESTADOS = {
  pending: { rotulo: "A aguardar aprovação", cor: "bg-accent-soft text-accent-dark border-accent/30" },
  active: { rotulo: "Ativo", cor: "bg-brand-soft text-brand border-brand/20" },
  rejected: { rotulo: "Rejeitado", cor: "bg-red-50 text-red-700 border-red-200" },
}

export default async function UtilizadoresPage({ searchParams }) {
  const { data } = await getUser()
  if (!data.user) redirect("/login?next=/admin/utilizadores")

  const { papel } = await papelDe(data.user.id)
  if (papel !== "admin") redirect("/dashboard")

  const filtro = searchParams?.estado || "pending"
  const procura = (searchParams?.q || "").trim()

  const condicoes = []
  const params = []

  if (filtro !== "todos") {
    params.push(filtro)
    condicoes.push(`COALESCE(p.status, 'pending') = $${params.length}`)
  }
  if (procura) {
    params.push(`%${procura}%`)
    condicoes.push(`(u.email ILIKE $${params.length} OR p.full_name ILIKE $${params.length})`)
  }

  const where = condicoes.length ? `WHERE ${condicoes.join(" AND ")}` : ""

  let utilizadores = []
  let contagens = { pending: 0, active: 0, rejected: 0, todos: 0 }
  let erro = null

  try {
    const { rows } = await sql(
      `SELECT u.id, u.email, u.created_at, u.last_sign_in_at, u.banned_until,
              COALESCE(p.full_name, split_part(u.email, '@', 1)) AS nome,
              COALESCE(p.role, 'student')   AS papel,
              COALESCE(p.status, 'pending') AS estado,
              (SELECT count(*)::int FROM auth.sessions s
                WHERE s.user_id = u.id AND s.revoked_at IS NULL AND s.expires_at > now()) AS sessoes
         FROM auth.users u
         LEFT JOIN public.profiles p ON p.id = u.id
         ${where}
         ORDER BY (COALESCE(p.status,'pending') = 'pending') DESC, u.created_at DESC
         LIMIT 200`,
      params
    )
    utilizadores = rows

    const { rows: c } = await sql(`
      SELECT COALESCE(p.status, 'pending') AS estado, count(*)::int AS total
        FROM auth.users u LEFT JOIN public.profiles p ON p.id = u.id
       GROUP BY 1
    `)
    for (const linha of c) {
      contagens[linha.estado] = linha.total
      contagens.todos += linha.total
    }
  } catch (e) {
    erro = e.message
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="text-display-md text-ink-800">Utilizadores</h1>
        <p className="mt-1 text-neutral-500">
          Ninguém entra na plataforma sem passar por aqui. Contas novas ficam a aguardar aprovação.
        </p>
      </div>

      {erro && (
        <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          <p className="font-semibold">Não foi possível ler os utilizadores.</p>
          <p className="mt-1 font-mono text-xs">{erro}</p>
        </div>
      )}

      {/* Separadores por estado */}
      <div className="mb-6 flex flex-wrap items-center gap-2">
        {[
          { chave: "pending", rotulo: "A aguardar" },
          { chave: "active", rotulo: "Ativos" },
          { chave: "rejected", rotulo: "Rejeitados" },
          { chave: "todos", rotulo: "Todos" },
        ].map((t) => {
          const ativo = filtro === t.chave
          return (
            <a
              key={t.chave}
              href={`/admin/utilizadores?estado=${t.chave}${procura ? `&q=${encodeURIComponent(procura)}` : ""}`}
              className={`rounded-lg border px-3.5 py-2 text-sm font-semibold transition ${
                ativo
                  ? "border-brand bg-brand-soft text-brand"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-neutral-300 hover:text-ink-800"
              }`}
            >
              {t.rotulo}
              <span className={`ml-2 rounded px-1.5 py-0.5 text-xs ${ativo ? "bg-brand text-white" : "bg-neutral-100 text-neutral-500"}`}>
                {contagens[t.chave] ?? 0}
              </span>
            </a>
          )
        })}

        <form action="/admin/utilizadores" className="ml-auto flex items-center gap-2">
          <input type="hidden" name="estado" value={filtro} />
          <input
            type="search"
            name="q"
            defaultValue={procura}
            placeholder="Procurar por nome ou email"
            className="w-64 rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"
          />
        </form>
      </div>

      <UtilizadoresClient utilizadores={utilizadores} estados={ESTADOS} euId={data.user.id} />
    </div>
  )
}
