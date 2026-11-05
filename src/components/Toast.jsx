import { createContext, useContext, useState, useCallback, useRef } from 'react'

const ToastContext = createContext(() => {})
export const useToast = () => useContext(ToastContext)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null) // { msg, ok, leaving }
  const timers = useRef([])

  const show = useCallback((msg, ok = true) => {
    timers.current.forEach(clearTimeout)
    timers.current = []
    setToast({ msg, ok, leaving: false })
    const dur = ok ? 2200 : 5000 // erro fica mais tempo na tela
    timers.current.push(setTimeout(() => setToast((t) => t && { ...t, leaving: true }), dur))
    timers.current.push(setTimeout(() => setToast(null), dur + 300))
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <div
          className={`toast ${toast.ok ? 'ok' : 'err'} ${toast.leaving ? 'leaving' : ''}`}
          role={toast.ok ? 'status' : 'alert'}
          aria-live={toast.ok ? 'polite' : 'assertive'}
        >
          {toast.msg}
        </div>
      )}
    </ToastContext.Provider>
  )
}
