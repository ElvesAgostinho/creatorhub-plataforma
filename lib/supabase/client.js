"use client"

/**
 * Cliente de browser.
 *
 * Antes falava diretamente com a Supabase a partir do navegador. Agora não
 * pode: as credenciais do Postgres e do MinIO são do servidor e nunca podem
 * chegar ao browser. Em vez disso, cada método chama uma rota da própria
 * aplicação, que faz o trabalho do lado de dentro.
 *
 * Os nomes dos métodos mantêm-se, para os seis componentes que o usam
 * continuarem a funcionar sem alterações.
 */

async function pedir(url, corpo) {
  const resposta = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(corpo || {}),
  })
  const dados = await resposta.json().catch(() => ({}))
  if (!resposta.ok) {
    return { data: { user: null }, error: { message: dados.error || "Pedido falhou." } }
  }
  return { data: dados.data || {}, error: null }
}

class ContentorBrowser {
  constructor(nome) {
    this.nome = nome
  }

  async upload(caminho, ficheiro, opcoes = {}) {
    const formulario = new FormData()
    formulario.append("contentor", this.nome)
    formulario.append("caminho", caminho)
    formulario.append("upsert", opcoes.upsert ? "1" : "0")
    formulario.append("ficheiro", ficheiro)

    const resposta = await fetch("/api/storage/upload", { method: "POST", body: formulario })
    const dados = await resposta.json().catch(() => ({}))
    if (!resposta.ok) return { data: null, error: { message: dados.error || "Falha no envio." } }
    return { data: dados.data, error: null }
  }

  getPublicUrl(caminho) {
    const base = (process.env.NEXT_PUBLIC_S3_URL || "").replace(/\/+$/, "")
    return { data: { publicUrl: `${base}/${this.nome}/${caminho}` } }
  }

  async remove(caminhos) {
    return pedir("/api/storage/remove", { contentor: this.nome, caminhos })
  }
}

export function createClient() {
  return {
    auth: {
      signInWithPassword: (credenciais) => pedir("/api/auth/login", credenciais),
      signUp: (dados) => pedir("/api/auth/signup", dados),
      async signOut() {
        await fetch("/api/auth/logout", { method: "POST" })
        return { error: null }
      },
      async getUser() {
        const r = await fetch("/api/auth/me")
        const d = await r.json().catch(() => ({}))
        return { data: { user: d.user || null }, error: null }
      },
    },

    storage: {
      from: (nome) => new ContentorBrowser(nome),
    },
  }
}
