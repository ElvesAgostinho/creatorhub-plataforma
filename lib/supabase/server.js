import { consulta } from "@/lib/db/query"
import { storage } from "@/lib/storage"
import * as autenticacao from "@/lib/auth"

/**
 * Fachada compatível, no mesmo caminho de sempre.
 *
 * Os 91 ficheiros que faziam createClient().from("products").select() continuam
 * a fazê-lo; por baixo deixou de haver Supabase e passou a haver o Postgres e o
 * MinIO do EasyPanel. Manter este ficheiro no mesmo sítio foi o que evitou
 * reescrever as 223 consultas.
 *
 * Diferença que interessa saber: createServiceClient() já não "ignora RLS",
 * porque RLS deixou de ser o que protege os dados. A autorização está agora em
 * lib/auth — exigirAdmin(), exigirCriador(). Quem escrever código novo tem de
 * as chamar.
 */

function fachada() {
  return {
    from(tabela) {
      return consulta(tabela)
    },

    auth: {
      getUser: (...a) => autenticacao.getUser(...a),
      getSession: (...a) => autenticacao.getSession(...a),
      signUp: (...a) => autenticacao.signUp(...a),
      signInWithPassword: (...a) => autenticacao.signInWithPassword(...a),
      signOut: (...a) => autenticacao.signOut(...a),
      admin: autenticacao.admin,

      // Existia para o fluxo OAuth da Supabase, que deixou de haver.
      async exchangeCodeForSession() {
        return { data: null, error: { message: "Login por fornecedor externo não está ativo." } }
      },
    },

    storage,
  }
}

export function createClient() {
  return fachada()
}

export function createServiceClient() {
  return fachada()
}

// Reexportado para quem precisa das verificações de permissão
export { exigirSessao, exigirAdmin, exigirCriador, registarAccao } from "@/lib/auth"
