// Resposta de um campo sim_nao. Com detalheSe o valor é { resp, detalhe }; sem, ou no formato antigo, é a string.
export function leResposta(valor) {
  if (valor && typeof valor === 'object') return valor.resp ?? null
  return valor ?? null
}
