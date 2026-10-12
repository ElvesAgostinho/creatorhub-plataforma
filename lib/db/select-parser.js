/**
 * Interpreta a string de .select() no mesmo formato que o código já usa.
 *
 * Exemplos que aparecem no projeto:
 *   "*"
 *   "id, slug, title"
 *   "*, products(title, created_by)"
 *   "products!inner ( title )"
 *   "creator:profiles(full_name, avatar_url)"
 *   "profiles!purchases_user_id_profiles_fk ( full_name )"
 *
 * Devolve { colunas: [...], relacoes: [{ alias, tabela, dica, interna, colunas }] }
 */
export function interpretarSelect(texto) {
  const colunas = []
  const relacoes = []

  if (!texto || texto.trim() === "") return { colunas: ["*"], relacoes }

  // Parte ao nível de topo, ignorando vírgulas dentro de parênteses
  const partes = []
  let atual = ""
  let profundidade = 0
  for (const c of texto) {
    if (c === "(") profundidade++
    if (c === ")") profundidade--
    if (c === "," && profundidade === 0) {
      partes.push(atual)
      atual = ""
    } else {
      atual += c
    }
  }
  if (atual.trim()) partes.push(atual)

  for (const parteBruta of partes) {
    const parte = parteBruta.trim()
    if (!parte) continue

    const abre = parte.indexOf("(")
    if (abre === -1) {
      colunas.push(parte)
      continue
    }

    const cabecalho = parte.slice(0, abre).trim()
    const fecha = parte.lastIndexOf(")")
    const interior = parte.slice(abre + 1, fecha === -1 ? undefined : fecha)

    // alias:tabela!dica
    let alias = null
    let resto = cabecalho
    const doisPontos = resto.indexOf(":")
    if (doisPontos !== -1) {
      alias = resto.slice(0, doisPontos).trim()
      resto = resto.slice(doisPontos + 1).trim()
    }

    let dica = null
    let interna = false
    const exclamacao = resto.indexOf("!")
    if (exclamacao !== -1) {
      const sufixo = resto.slice(exclamacao + 1).trim()
      resto = resto.slice(0, exclamacao).trim()
      if (sufixo === "inner") interna = true
      else if (sufixo === "left") interna = false
      else dica = sufixo
    }

    const tabela = resto.trim()
    const filhas = interpretarSelect(interior)

    relacoes.push({
      alias: alias || tabela,
      tabela,
      dica,
      interna,
      colunas: filhas.colunas,
      relacoes: filhas.relacoes,
    })
  }

  if (colunas.length === 0) colunas.push("*")
  return { colunas, relacoes }
}
