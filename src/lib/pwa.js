// Atualização do PWA por aviso (registerType 'prompt'): o SW novo fica em
// espera e só assume quando a usuária toca em "Atualizar agora". Nunca
// recarrega sozinho, para não perder uma ficha preenchida e não salva.
import { registerSW } from 'virtual:pwa-register'

let precisa = false
const listeners = new Set()
const notify = () => listeners.forEach((l) => l())

const HORA = 60 * 60 * 1000
let atualizarSW = null

export function iniciarPwa() {
  if (typeof window === 'undefined' || atualizarSW) return
  atualizarSW = registerSW({
    onNeedRefresh() { precisa = true; notify() },
    onRegisteredSW(_url, reg) {
      if (!reg) return
      let ultima = Date.now()
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState !== 'visible' || Date.now() - ultima < HORA) return
        ultima = Date.now()
        reg.update().catch(() => {}) // offline: tenta de novo na próxima vez
      })
    }
  })
}

export const precisaAtualizar = () => precisa
export function onChange(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}
export function dispensar() { precisa = false; notify() } // "Depois": some até a próxima abertura
export function atualizarAgora() { return atualizarSW?.(true) } // recarrega ao assumir
