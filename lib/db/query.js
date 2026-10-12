import { sql } from "./pool"
import { interpretarSelect } from "./select-parser"
import { ligacao } from "./relations"

/**
 * Construtor de consultas com a mesma API encadeada que o código já usa.
 *
 * O objetivo não é reimplementar o PostgREST: é cobrir exatamente o que estes
 * 91 ficheiros chamam, para que nenhum deles precise de mudar. Tudo o que não
 * esteja coberto falha com uma mensagem explícita, em vez de devolver dados
 * errados em silêncio.
 */

const IDENT = /^[a-zA-Z_][a-zA-Z0-9_]*$/

function ident(nome) {
  const limpo = String(nome).trim()
  if (!IDENT.test(limpo)) throw new Error(`Identificador inválido: "${nome}"`)
  return `"${limpo}"`
}

function colunasSql(colunas) {
  if (!colunas || colunas.length === 0 || colunas.includes("*")) return "*"
  return colunas.map((c) => ident(c)).join(", ")
}

class Consulta {
  constructor(tabela, { admin = false, utilizador = null } = {}) {
    this.tabela = tabela
    this.admin = admin
    this.utilizador = utilizador

    this.accao = "select"
    this.selectTexto = "*"
    this.valores = null
    this.conflito = null
    this.filtros = []
    this.ordenacoes = []
    this._limite = null
    this._desvio = null
    this.modo = null // "single" | "maybeSingle"
    this.contagem = null
    this.apenasCabecalho = false
    this.devolver = false
  }

  // ---------------- ações ----------------

  select(texto = "*", opcoes = {}) {
    if (this.accao === "select") {
      this.selectTexto = texto || "*"
    } else {
      // .insert().select() — devolver as linhas afetadas
      this.devolver = true
      this.selectTexto = texto || "*"
    }
    if (opcoes.count) this.contagem = opcoes.count
    if (opcoes.head) this.apenasCabecalho = true
    return this
  }

  insert(valores) {
    this.accao = "insert"
    this.valores = Array.isArray(valores) ? valores : [valores]
    return this
  }

  update(valores) {
    this.accao = "update"
    this.valores = valores
    return this
  }

  upsert(valores, opcoes = {}) {
    this.accao = "upsert"
    this.valores = Array.isArray(valores) ? valores : [valores]
    this.conflito = opcoes.onConflict
      ? String(opcoes.onConflict).split(",").map((c) => c.trim())
      : null
    return this
  }

  delete() {
    this.accao = "delete"
    return this
  }

  // ---------------- filtros ----------------

  _add(coluna, operador, valor) {
    this.filtros.push({ coluna, operador, valor })
    return this
  }

  eq(c, v) { return this._add(c, "=", v) }
  neq(c, v) { return this._add(c, "<>", v) }
  gt(c, v) { return this._add(c, ">", v) }
  gte(c, v) { return this._add(c, ">=", v) }
  lt(c, v) { return this._add(c, "<", v) }
  lte(c, v) { return this._add(c, "<=", v) }
  like(c, v) { return this._add(c, "LIKE", v) }
  ilike(c, v) { return this._add(c, "ILIKE", v) }
  is(c, v) { return this._add(c, "IS", v) }
  in(c, v) { return this._add(c, "IN", v) }

  not(coluna, operador, valor) {
    const mapa = { eq: "<>", is: "IS NOT", in: "NOT IN" }
    if (!mapa[operador]) throw new Error(`.not("${operador}") ainda não é suportado.`)
    return this._add(coluna, mapa[operador], valor)
  }

  match(objeto) {
    for (const [c, v] of Object.entries(objeto)) this.eq(c, v)
    return this
  }

  filter(coluna, operador, valor) {
    const mapa = { eq: "=", neq: "<>", gt: ">", gte: ">=", lt: "<", lte: "<=", like: "LIKE", ilike: "ILIKE", is: "IS", in: "IN" }
    if (!mapa[operador]) throw new Error(`.filter("${operador}") ainda não é suportado.`)
    return this._add(coluna, mapa[operador], valor)
  }

  /**
   * Sintaxe do PostgREST: "coluna.op.valor,outra.op.valor" unidas por OR.
   * O projeto usa isto num sítio: a caixa de entrada, para apanhar as mensagens
   * do próprio utilizador e os avisos gerais (recipient_id nulo).
   */
  or(expressao) {
    const ramos = String(expressao).split(",").map((bruto) => {
      const [coluna, op, ...resto] = bruto.trim().split(".")
      const valor = resto.join(".")
      if (op === "is") return { coluna, operador: "IS", valor: valor === "null" ? null : valor }
      if (op === "in") return { coluna, operador: "IN", valor: valor.replace(/^\(|\)$/g, "").split(",") }
      const mapa = { eq: "=", neq: "<>", gt: ">", gte: ">=", lt: "<", lte: "<=", like: "LIKE", ilike: "ILIKE" }
      if (!mapa[op]) throw new Error(`.or() com o operador "${op}" ainda não é suportado.`)
      return { coluna, operador: mapa[op], valor }
    })
    this.filtros.push({ ou: ramos })
    return this
  }

  // ---------------- ordem e limites ----------------

  order(coluna, opcoes = {}) {
    this.ordenacoes.push({ coluna, ascendente: opcoes.ascending !== false, nullsFirst: opcoes.nullsFirst })
    return this
  }

  limit(n) { this._limite = n; return this }

  range(de, ate) {
    this._desvio = de
    this._limite = ate - de + 1
    return this
  }

  single() { this.modo = "single"; return this }
  maybeSingle() { this.modo = "maybeSingle"; return this }

  // ---------------- construção do SQL ----------------

  _where(params) {
    if (this.filtros.length === 0) return ""
    const partes = []

    for (const f of this.filtros) {
      if (f.ou) {
        const ramos = f.ou.map((r) => this._condicao(r, params))
        partes.push("(" + ramos.join(" OR ") + ")")
      } else {
        partes.push(this._condicao(f, params))
      }
    }
    return " WHERE " + partes.join(" AND ")
  }

  _condicao({ coluna, operador, valor }, params) {
    const col = ident(coluna)

    if (operador === "IS" || (operador === "=" && valor === null)) {
      return valor === null ? `${col} IS NULL` : `${col} IS ${valor === true ? "TRUE" : valor === false ? "FALSE" : "NULL"}`
    }
    if (operador === "IS NOT") {
      return valor === null ? `${col} IS NOT NULL` : `${col} IS NOT ${valor === true ? "TRUE" : "FALSE"}`
    }
    if (operador === "IN" || operador === "NOT IN") {
      const lista = Array.isArray(valor) ? valor : [valor]
      if (lista.length === 0) return operador === "IN" ? "FALSE" : "TRUE"
      params.push(lista)
      return `${col} ${operador === "IN" ? "=" : "<>"} ANY($${params.length})`
    }
    params.push(valor)
    return `${col} ${operador} $${params.length}`
  }

  _ordemLimite() {
    let s = ""
    if (this.ordenacoes.length > 0) {
      s += " ORDER BY " + this.ordenacoes
        .map((o) => `${ident(o.coluna)} ${o.ascendente ? "ASC" : "DESC"} NULLS ${o.nullsFirst ? "FIRST" : "LAST"}`)
        .join(", ")
    }
    if (this._limite != null) s += ` LIMIT ${Number(this._limite)}`
    if (this._desvio != null) s += ` OFFSET ${Number(this._desvio)}`
    return s
  }

  // ---------------- execução ----------------

  async executar() {
    const tabela = ident(this.tabela)
    const params = []

    if (this.accao === "select") {
      const plano = interpretarSelect(this.selectTexto)

      if (this.apenasCabecalho || this.contagem) {
        const { rows } = await sql(`SELECT count(*)::int AS total FROM ${tabela}${this._where(params)}`, params)
        const total = rows[0]?.total ?? 0
        if (this.apenasCabecalho) return { data: null, error: null, count: total }
        // Com contagem mas sem head: continua para obter as linhas
        const p2 = []
        const r = await sql(
          `SELECT ${colunasSql(plano.colunas)} FROM ${tabela}${this._where(p2)}${this._ordemLimite()}`, p2
        )
        const dados = await this._hidratar(r.rows, plano)
        return { data: dados, error: null, count: total }
      }

      const { rows } = await sql(
        `SELECT ${colunasSql(plano.colunas)} FROM ${tabela}${this._where(params)}${this._ordemLimite()}`, params
      )
      const dados = await this._hidratar(rows, plano)
      return this._formatar(dados)
    }

    if (this.accao === "insert" || this.accao === "upsert") {
      if (this.valores.length === 0) return { data: [], error: null }

      const colunas = [...new Set(this.valores.flatMap((v) => Object.keys(v)))]
      const linhas = this.valores.map((v) => {
        const marcas = colunas.map((c) => {
          params.push(v[c] === undefined ? null : v[c])
          return `$${params.length}`
        })
        return `(${marcas.join(", ")})`
      })

      let texto = `INSERT INTO ${tabela} (${colunas.map(ident).join(", ")}) VALUES ${linhas.join(", ")}`

      if (this.accao === "upsert") {
        const alvo = this.conflito || ["id"]
        const atualizar = colunas.filter((c) => !alvo.includes(c))
        texto += ` ON CONFLICT (${alvo.map(ident).join(", ")}) DO ${
          atualizar.length === 0
            ? "NOTHING"
            : "UPDATE SET " + atualizar.map((c) => `${ident(c)} = EXCLUDED.${ident(c)}`).join(", ")
        }`
      }

      texto += " RETURNING *"
      const { rows } = await sql(texto, params)
      return this._formatar(rows)
    }

    if (this.accao === "update") {
      const colunas = Object.keys(this.valores)
      if (colunas.length === 0) return { data: [], error: null }
      const atribuicoes = colunas.map((c) => {
        params.push(this.valores[c])
        return `${ident(c)} = $${params.length}`
      })
      const texto = `UPDATE ${tabela} SET ${atribuicoes.join(", ")}${this._where(params)} RETURNING *`
      const { rows } = await sql(texto, params)
      return this._formatar(rows)
    }

    if (this.accao === "delete") {
      const texto = `DELETE FROM ${tabela}${this._where(params)} RETURNING *`
      const { rows } = await sql(texto, params)
      return this._formatar(rows)
    }

    throw new Error(`Ação desconhecida: ${this.accao}`)
  }

  /** Vai buscar as relações embebidas e cola-as a cada linha. */
  async _hidratar(linhas, plano) {
    if (linhas.length === 0 || !plano.relacoes || plano.relacoes.length === 0) return linhas

    for (const rel of plano.relacoes) {
      const lig = await ligacao(this.tabela, rel.tabela, rel.dica)
      const chaves = [...new Set(linhas.map((l) => l[lig.colunaLocal]).filter((v) => v != null))]

      if (chaves.length === 0) {
        for (const l of linhas) l[rel.alias] = lig.tipo === "muitos" ? [] : null
        continue
      }

      const colunasRemotas = rel.colunas.includes("*")
        ? "*"
        : [...new Set([...rel.colunas, lig.colunaRemota])].map(ident).join(", ")

      const { rows } = await sql(
        `SELECT ${colunasRemotas} FROM ${ident(rel.tabela)} WHERE ${ident(lig.colunaRemota)} = ANY($1)`,
        [chaves]
      )

      const filhas = await new Consulta(rel.tabela)._hidratar(rows, rel)

      const porChave = new Map()
      for (const r of filhas) {
        const k = r[lig.colunaRemota]
        if (lig.tipo === "muitos") {
          if (!porChave.has(k)) porChave.set(k, [])
          porChave.get(k).push(r)
        } else {
          porChave.set(k, r)
        }
      }

      for (const l of linhas) {
        const k = l[lig.colunaLocal]
        l[rel.alias] = lig.tipo === "muitos" ? porChave.get(k) || [] : porChave.get(k) ?? null
      }
    }

    // !inner descarta as linhas sem correspondência
    const internas = plano.relacoes.filter((r) => r.interna)
    if (internas.length > 0) {
      return linhas.filter((l) =>
        internas.every((r) => {
          const v = l[r.alias]
          return Array.isArray(v) ? v.length > 0 : v != null
        })
      )
    }

    return linhas
  }

  _formatar(linhas) {
    if (this.modo === "single") {
      if (linhas.length !== 1) {
        return {
          data: null,
          error: { message: `Esperava exatamente uma linha em "${this.tabela}", vieram ${linhas.length}.`, code: "PGRST116" },
        }
      }
      return { data: linhas[0], error: null }
    }
    if (this.modo === "maybeSingle") {
      if (linhas.length > 1) {
        return {
          data: null,
          error: { message: `Esperava no máximo uma linha em "${this.tabela}", vieram ${linhas.length}.`, code: "PGRST116" },
        }
      }
      return { data: linhas[0] ?? null, error: null }
    }
    return { data: linhas, error: null }
  }

  // Torna o objeto esperável com await, sem precisar de .then()
  then(aoResolver, aoRejeitar) {
    return this.executar()
      .catch((err) => {
        console.error(`[db] ${this.tabela}: ${err.message}`, err.query ? `\n   SQL: ${err.query}` : "")
        return { data: null, error: { message: err.message, code: err.code || "DB_ERROR" }, count: null }
      })
      .then(aoResolver, aoRejeitar)
  }
}

export function consulta(tabela, contexto) {
  return new Consulta(tabela, contexto)
}
