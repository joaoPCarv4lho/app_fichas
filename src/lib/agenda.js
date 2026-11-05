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

// agendamento que passa da meia-noite? (termina às 24:00 exatas = não)
export function cruzaMeiaNoite(hora, duracaoMin) {
  const [h, m] = hora.split(':').map(Number)
  return h * 60 + m + Number(duracaoMin || 0) > 1440
}

// idade em anos em `hojeISOStr`, lendo 'YYYY-MM-DD' por partes (sem Date/UTC); inválido => null
export function idadeDe(nascISO, hojeISOStr) {
  const mn = /^(\d{4})-(\d{2})-(\d{2})$/.exec(nascISO || '')
  if (!mn) return null
  const [, ny, nm, nd] = mn.map(Number)
  const [hy, hm, hd] = hojeISOStr.split('-').map(Number)
  // 29/02 em ano não bissexto: aniversário conta em 01/03
  const bissexto = (y) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
  const [am, ad] = nm === 2 && nd === 29 && !bissexto(hy) ? [3, 1] : [nm, nd]
  const a = hy - ny - (hm < am || (hm === am && hd < ad) ? 1 : 0)
  return a >= 0 && a < 130 ? a : null
}
