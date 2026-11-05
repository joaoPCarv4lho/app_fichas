// update/delete bloqueado por RLS (ou registro já apagado) não dá erro no supabase-js: volta lista vazia.
export function exigeLinhas(data) {
  if (!data || data.length === 0) throw Object.assign(new Error('nenhuma linha afetada'), { code: 'SEM_LINHAS' })
}
