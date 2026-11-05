// Converte qualquer erro em mensagem pt-BR para a usuária; nunca devolve texto cru.
export function mensagemDeErro(e) {
  console.error(e)
  const texto = String((e && e.message) || (typeof e === 'string' ? e : '')).toLowerCase()
  const codigo = e && e.code
  const status = e && e.status
  if (
    (typeof navigator !== 'undefined' && navigator.onLine === false) ||
    /failed to fetch|networkerror|load failed/.test(texto)
  ) return 'Sem conexão com a internet. Verifique o Wi-Fi e tente de novo.'
  if (status === 401 || codigo === 'PGRST301' || codigo === 'PGRST303' || /jwt expired|invalid refresh token/.test(texto))
    return 'Sua sessão expirou. Entre de novo.'
  if (codigo === '42501' || texto.includes('row-level security')) return 'Você não tem permissão para fazer isso.'
  if (codigo === '23505') return 'Já existe um registro igual.'
  if (codigo === 'SEM_LINHAS') return 'Não foi possível alterar: você não tem permissão ou o registro não existe mais.'
  if (codigo === 'PGRST116') return 'Registro não encontrado.'
  return 'Não foi possível concluir. Tente de novo.'
}
