// Cor determinística para o avatar da cliente (variedade visual agradável,
// sempre a mesma cor para o mesmo nome).
const PARES = [
  { bg: '#f3e0e4', fg: '#9c5060' },
  { bg: '#e9e2f0', fg: '#6a4e8f' },
  { bg: '#e0ece6', fg: '#2f7a5c' },
  { bg: '#f7ead2', fg: '#9a6b16' },
  { bg: '#e3ecf5', fg: '#3d6a9c' },
  { bg: '#f6e2d8', fg: '#a65b39' },
  { bg: '#e6e9dd', fg: '#5c6b3a' },
]

export function avatarColor(nome = '') {
  let h = 0
  for (let i = 0; i < nome.length; i++) h = (h * 31 + nome.charCodeAt(i)) >>> 0
  return PARES[h % PARES.length]
}

export function iniciais(nome = '') {
  return nome.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() || '').join('')
}
