"use client"

import { useState, useTransition } from "react"
import toast from "react-hot-toast"
import {
  Check, X, Shield, Ban, LogOut, KeyRound, Trash2, UserPlus, MoreHorizontal, Clock,
} from "lucide-react"
import {
  aprovarUtilizador, rejeitarUtilizador, mudarPapel, suspenderUtilizador,
  levantarSuspensao, terminarSessoes, reporPassword, apagarUtilizador, criarUtilizador,
} from "./actions"

const PAPEIS = { student: "Aluno", creator: "Criador", admin: "Administrador" }

export default function UtilizadoresClient({ utilizadores, estados, euId }) {
  const [aPensar, iniciar] = useTransition()
  const [aberto, setAberto] = useState(null)
  const [novoAberto, setNovoAberto] = useState(false)

  function correr(accao, mensagemOk) {
    iniciar(async () => {
      const r = await accao()
      if (r?.erro) toast.error(r.erro)
      else toast.success(mensagemOk)
      setAberto(null)
    })
  }

  function confirmar(pergunta, accao, mensagemOk) {
    if (window.confirm(pergunta)) correr(accao, mensagemOk)
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <button
          onClick={() => setNovoAberto((v) => !v)}
          className="flex items-center gap-2 rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white transition hover:bg-brand-dark"
        >
          <UserPlus size={16} />
          Criar utilizador
        </button>
      </div>

      {novoAberto && (
        <form
          action={(fd) => correr(() => criarUtilizador(fd), "Utilizador criado.")}
          className="mb-6 grid gap-3 rounded-xl border border-neutral-200 bg-white p-5 sm:grid-cols-4"
        >
          <input name="nome" placeholder="Nome" className={campo} />
          <input name="email" type="email" placeholder="Email" required className={campo} />
          <input name="password" type="password" placeholder="Palavra-passe" required minLength={8} className={campo} />
          <div className="flex gap-2">
            <select name="papel" className={campo} defaultValue="student">
              <option value="student">Aluno</option>
              <option value="creator">Criador</option>
              <option value="admin">Administrador</option>
            </select>
            <button disabled={aPensar} className="shrink-0 rounded-lg bg-ink-800 px-4 text-sm font-semibold text-white disabled:opacity-50">
              Criar
            </button>
          </div>
        </form>
      )}

      <div className="overflow-hidden rounded-xl border border-neutral-200 bg-white">
        {utilizadores.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <p className="font-semibold text-ink-800">Nenhum utilizador neste estado</p>
            <p className="mt-1 text-sm text-neutral-500">Quando alguém se registar, aparece aqui para aprovares.</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-neutral-200 bg-surface-50 text-[11px] uppercase tracking-wider text-neutral-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Utilizador</th>
                <th className="px-5 py-3 font-semibold">Papel</th>
                <th className="px-5 py-3 font-semibold">Estado</th>
                <th className="px-5 py-3 font-semibold">Entrou</th>
                <th className="px-5 py-3 text-right font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {utilizadores.map((u) => {
                const suspenso = u.banned_until && new Date(u.banned_until) > new Date()
                const sou = u.id === euId
                return (
                  <tr key={u.id} className="hover:bg-surface-50">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-soft text-xs font-bold text-brand">
                          {u.nome.charAt(0).toUpperCase()}
                        </span>
                        <span className="min-w-0">
                          <span className="block truncate font-semibold text-ink-800">
                            {u.nome} {sou && <span className="text-xs font-normal text-neutral-400">(tu)</span>}
                          </span>
                          <span className="block truncate text-xs text-neutral-500">{u.email}</span>
                        </span>
                      </div>
                    </td>

                    <td className="px-5 py-3.5">
                      <select
                        value={u.papel}
                        disabled={aPensar || sou}
                        onChange={(e) => correr(() => mudarPapel(u.id, e.target.value), "Papel alterado.")}
                        className="rounded-lg border border-neutral-200 bg-white px-2 py-1 text-xs font-semibold text-neutral-700 disabled:opacity-50"
                      >
                        {Object.entries(PAPEIS).map(([v, r]) => (
                          <option key={v} value={v}>{r}</option>
                        ))}
                      </select>
                    </td>

                    <td className="px-5 py-3.5">
                      <span className={`inline-block rounded-md border px-2 py-1 text-[11px] font-bold ${estados[u.estado]?.cor || ""}`}>
                        {estados[u.estado]?.rotulo || u.estado}
                      </span>
                      {suspenso && (
                        <span className="ml-1.5 inline-block rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[11px] font-bold text-red-700">
                          Suspenso
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-3.5 text-xs text-neutral-500">
                      {u.last_sign_in_at
                        ? new Date(u.last_sign_in_at).toLocaleDateString("pt-PT")
                        : "nunca"}
                      {u.sessoes > 0 && (
                        <span className="ml-1.5 text-[11px] font-semibold text-brand">· {u.sessoes} sessão(ões)</span>
                      )}
                    </td>

                    <td className="px-5 py-3.5">
                      <div className="flex items-center justify-end gap-1.5">
                        {u.estado === "pending" && (
                          <>
                            <button
                              disabled={aPensar}
                              onClick={() => correr(() => aprovarUtilizador(u.id), "Utilizador aprovado.")}
                              className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-1.5 text-xs font-bold text-white transition hover:bg-brand-dark disabled:opacity-50"
                            >
                              <Check size={13} /> Aprovar
                            </button>
                            <button
                              disabled={aPensar}
                              onClick={() => confirmar(`Rejeitar ${u.email}?`, () => rejeitarUtilizador(u.id), "Utilizador rejeitado.")}
                              className="flex items-center gap-1.5 rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-600 transition hover:border-red-300 hover:text-red-600 disabled:opacity-50"
                            >
                              <X size={13} /> Rejeitar
                            </button>
                          </>
                        )}

                        {u.estado === "rejected" && (
                          <button
                            disabled={aPensar}
                            onClick={() => correr(() => aprovarUtilizador(u.id), "Utilizador reativado.")}
                            className="rounded-lg border border-neutral-200 px-3 py-1.5 text-xs font-bold text-neutral-600 transition hover:border-brand hover:text-brand disabled:opacity-50"
                          >
                            Reativar
                          </button>
                        )}

                        <div className="relative">
                          <button
                            onClick={() => setAberto(aberto === u.id ? null : u.id)}
                            className="flex h-7 w-7 items-center justify-center rounded-lg text-neutral-400 transition hover:bg-neutral-100 hover:text-ink-800"
                            aria-label="Mais ações"
                          >
                            <MoreHorizontal size={16} />
                          </button>

                          {aberto === u.id && (
                            <div className="absolute right-0 top-full z-20 mt-1 w-56 overflow-hidden rounded-xl border border-neutral-200 bg-white py-1.5 shadow-float">
                              <Accao
                                icone={LogOut}
                                onClick={() => correr(() => terminarSessoes(u.id), "Sessões terminadas.")}
                              >
                                Terminar sessões
                              </Accao>

                              <Accao
                                icone={KeyRound}
                                onClick={() => {
                                  const nova = window.prompt("Nova palavra-passe (mínimo 8 caracteres):")
                                  if (nova) correr(() => reporPassword(u.id, nova), "Palavra-passe reposta.")
                                }}
                              >
                                Repor palavra-passe
                              </Accao>

                              {suspenso ? (
                                <Accao icone={Shield} onClick={() => correr(() => levantarSuspensao(u.id), "Suspensão levantada.")}>
                                  Levantar suspensão
                                </Accao>
                              ) : (
                                <Accao
                                  icone={Ban}
                                  desativado={sou}
                                  onClick={() => {
                                    const dias = window.prompt("Suspender por quantos dias? (vazio = sem fim)")
                                    if (dias !== null) correr(() => suspenderUtilizador(u.id, dias || null), "Utilizador suspenso.")
                                  }}
                                >
                                  Suspender conta
                                </Accao>
                              )}

                              <div className="my-1 h-px bg-neutral-100" />

                              <Accao
                                icone={Trash2}
                                perigo
                                desativado={sou}
                                onClick={() =>
                                  confirmar(
                                    `Apagar ${u.email}? Isto apaga também as compras, o progresso e as mensagens desta pessoa. Não há volta atrás.`,
                                    () => apagarUtilizador(u.id),
                                    "Utilizador apagado."
                                  )
                                }
                              >
                                Apagar conta
                              </Accao>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {aPensar && (
        <p className="mt-3 flex items-center gap-2 text-xs font-medium text-neutral-500">
          <Clock size={13} /> a aplicar…
        </p>
      )}
    </>
  )
}

const campo =
  "w-full rounded-lg border border-neutral-200 bg-white px-3 py-2 text-sm outline-none transition focus:border-brand focus:ring-4 focus:ring-brand/10"

function Accao({ icone: Icone, children, onClick, perigo, desativado }) {
  return (
    <button
      onClick={onClick}
      disabled={desativado}
      className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm font-medium transition disabled:opacity-40 ${
        perigo ? "text-red-600 hover:bg-red-50" : "text-neutral-700 hover:bg-neutral-100"
      }`}
    >
      <Icone size={14} />
      {children}
    </button>
  )
}
