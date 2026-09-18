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
    timers.current.push(setTimeout(() => setToast((t) => t && { ...t, leaving: true }), 2200))
    timers.current.push(setTimeout(() => setToast(null), 2500))
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      {toast && (
        <div className={`toast ${toast.ok ? 'ok' : ''} ${toast.leaving ? 'leaving' : ''}`} role="status" aria-live="polite">
          {toast.msg}
        </div>
      )}
    </ToastContext.Provider>
  )
}
