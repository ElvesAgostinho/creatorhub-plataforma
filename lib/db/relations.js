import { sql } from "./pool"

/**
 * Mapa de chaves estrangeiras, lido do próprio Postgres.
 *
 * As 19 consultas com relações embebidas do código — products(title),
 * profiles!purchases_user_id_profiles_fk(full_name), creator:profiles(...) —
 * precisam de saber por que coluna ligar. Em vez de manter esse mapa à mão e
 * ele ficar desatualizado, lemo-lo do information_schema uma vez por processo.
 */

let cache = null

async function carregar() {
  const { rows } = await sql(`
    SELECT
      con.conname                AS constraint_name,
      ori.relname                AS origem,
      ori_col.attname            AS coluna_origem,
      alvo.relname               AS alvo,
      alvo_col.attname           AS coluna_alvo
    FROM pg_constraint con
    JOIN pg_class ori            ON ori.oid = con.conrelid
    JOIN pg_namespace ori_ns     ON ori_ns.oid = ori.relnamespace
    JOIN pg_class alvo           ON alvo.oid = con.confrelid
    JOIN pg_attribute ori_col    ON ori_col.attrelid = con.conrelid AND ori_col.attnum = con.conkey[1]
    JOIN pg_attribute alvo_col   ON alvo_col.attrelid = con.confrelid AND alvo_col.attnum = con.confkey[1]
    WHERE con.contype = 'f' AND ori_ns.nspname = 'public'
  `)

  return rows.map((r) => ({
    nome: r.constraint_name,
    origem: r.origem,
    colunaOrigem: r.coluna_origem,
    alvo: r.alvo,
    colunaAlvo: r.coluna_alvo,
  }))
}

export async function chaves() {
  if (!cache) cache = carregar().catch((e) => { cache = null; throw e })
  return cache
}

/**
 * Descobre como ligar `tabela` a `relacao`.
 * `dica` é o nome da constraint quando a consulta usa products!nome_da_fk(...).
 *
 * Devolve { tipo: "um"|"muitos", colunaLocal, colunaRemota }.
 *   "um"     — a linha local aponta para uma linha remota (products(title))
 *   "muitos" — várias linhas remotas apontam para a local (academy_posts)
 */
export async function ligacao(tabela, relacao, dica) {
  const fks = await chaves()

  if (dica) {
    const porNome = fks.find((f) => f.nome === dica)
    if (porNome) {
      return porNome.origem === tabela
        ? { tipo: "um", colunaLocal: porNome.colunaOrigem, colunaRemota: porNome.colunaAlvo }
        : { tipo: "muitos", colunaLocal: porNome.colunaAlvo, colunaRemota: porNome.colunaOrigem }
    }
  }

  const paraFora = fks.filter((f) => f.origem === tabela && f.alvo === relacao)
  if (paraFora.length === 1) {
    return { tipo: "um", colunaLocal: paraFora[0].colunaOrigem, colunaRemota: paraFora[0].colunaAlvo }
  }

  const paraDentro = fks.filter((f) => f.origem === relacao && f.alvo === tabela)
  if (paraDentro.length === 1) {
    return { tipo: "muitos", colunaLocal: paraDentro[0].colunaAlvo, colunaRemota: paraDentro[0].colunaOrigem }
  }

  if (paraFora.length > 1 || paraDentro.length > 1) {
    const nomes = [...paraFora, ...paraDentro].map((f) => f.nome).join(", ")
    throw new Error(
      `Há mais do que uma ligação entre "${tabela}" e "${relacao}". Indica qual na consulta, com ${relacao}!nome_da_constraint(...). Disponíveis: ${nomes}`
    )
  }

  throw new Error(`Não existe chave estrangeira entre "${tabela}" e "${relacao}".`)
}

/** Usado pelos testes e pelo painel de administração. */
export function limparCache() {
  cache = null
}
