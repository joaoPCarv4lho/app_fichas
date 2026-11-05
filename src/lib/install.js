// Ajuda de instalação do PWA.
// No Android/Chrome capturamos o evento "beforeinstallprompt" (permite um
// botão "Instalar"). No iPhone não existe esse evento — a instalação é manual
// pelo Compartilhar > Adicionar à Tela de Início.

let deferred = null
const listeners = new Set()
const notify = () => listeners.forEach((l) => l())

if (typeof window !== 'undefined') {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault()
    deferred = e
    notify()
  })
  window.addEventListener('appinstalled', () => {
    deferred = null
    notify()
  })
}

// iPadOS 13+ se identifica como Mac: distingue pelo toque.
export const isIOS = typeof navigator !== 'undefined' && !window.MSStream && (
  /iphone|ipad|ipod/i.test(navigator.userAgent) ||
  (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
)

export const isStandalone = typeof window !== 'undefined' && (
  window.matchMedia?.('(display-mode: standalone)').matches ||
  window.navigator.standalone === true
)

export const canInstall = () => Boolean(deferred)

export function onChange(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

export async function promptInstall() {
  if (!deferred) return false
  deferred.prompt()
  const { outcome } = await deferred.userChoice
  deferred = null
  notify()
  return outcome === 'accepted'
}
