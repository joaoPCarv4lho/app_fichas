export const STATUS = {
  agendado:   { label: 'Agendado',   cls: 'st-agendado' },
  confirmado: { label: 'Confirmado', cls: 'st-confirmado' },
  realizado:  { label: 'Realizado',  cls: 'st-realizado' },
  cancelado:  { label: 'Cancelado',  cls: 'st-cancelado' },
  faltou:     { label: 'Faltou',     cls: 'st-faltou' },
}
export const STATUS_ORDEM = ['agendado', 'confirmado', 'realizado', 'cancelado', 'faltou']

export const DURACOES = [30, 45, 60, 90]

export const hojeISO = () => {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function addDias(iso, n) {
  const d = new Date(iso + 'T00:00:00')
  d.setDate(d.getDate() + n)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

export function rotuloDia(iso) {
  const d = new Date(iso + 'T00:00:00')
  const hoje = hojeISO()
  const semana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado']
  const base = `${semana[d.getDay()]}, ${d.getDate()}/${String(d.getMonth() + 1).padStart(2, '0')}`
  if (iso === hoje) return `Hoje · ${base}`
  if (iso === addDias(hoje, 1)) return `Amanhã · ${base}`
  if (iso === addDias(hoje, -1)) return `Ontem · ${base}`
  return base
}

export function fimDe(hora, duracaoMin) {
  const [h, m] = hora.split(':').map(Number)
  const total = h * 60 + m + Number(duracaoMin || 0)
  const hh = Math.floor((total % 1440) / 60)
  const mm = total % 60
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`
}

export const hhmm = (hora = '') => hora.slice(0, 5)

// dois agendamentos se sobrepõem no mesmo dia?
export function conflita(a, b) {
  if (a.data !== b.data) return false
  const ini = (x) => { const [h, m] = x.hora.split(':').map(Number); return h * 60 + m }
  const aI = ini(a), aF = aI + Number(a.duracao_min || 0)
  const bI = ini(b), bF = bI + Number(b.duracao_min || 0)
  return aI < bF && bI < aF
}
