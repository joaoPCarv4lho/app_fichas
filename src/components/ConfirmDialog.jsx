import { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react'

const ConfirmContext = createContext(() => Promise.resolve(false))
export const useConfirm = () => useContext(ConfirmContext)

// confirmar({ titulo, texto, ok = 'Confirmar', perigo = false }) -> Promise<boolean>
export function ConfirmProvider({ children }) {
  const [dlg, setDlg] = useState(null)
  const resolver = useRef(null)
  const cancelRef = useRef(null)
  const antes = useRef(null)
  const uid = useId()

  const confirmar = useCallback((opts) => new Promise((resolve) => {
    resolver.current?.(false) // diálogo anterior ainda aberto: cancela
    resolver.current = resolve
    antes.current = document.activeElement
    setDlg(opts)
  }), [])

  const fechar = useCallback((resultado) => {
    resolver.current?.(resultado)
    resolver.current = null
    setDlg(null)
    antes.current?.focus?.() // devolve o foco a quem abriu
  }, [])

  useEffect(() => {
    if (!dlg) return
    cancelRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') fechar(false)
      else if (e.key === 'Tab') { // prende o foco nos dois botões
        const bts = [...document.querySelectorAll('.confirm-card button')]
        const i = bts.indexOf(document.activeElement)
        const prox = bts[(i + (e.shiftKey ? -1 : 1) + bts.length) % bts.length]
        e.preventDefault()
        prox.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [dlg, fechar])

  return (
    <ConfirmContext.Provider value={confirmar}>
      {children}
      {dlg && (
        <div className="confirm-overlay" onClick={() => fechar(false)}>
          <div
            className="confirm-card"
            role="alertdialog"
            aria-modal="true"
            aria-labelledby={`${uid}-t`}
            aria-describedby={dlg.texto ? `${uid}-d` : undefined}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id={`${uid}-t`}>{dlg.titulo}</h2>
            {dlg.texto && <p id={`${uid}-d`}>{dlg.texto}</p>}
            <div className="confirm-actions">
              <button type="button" ref={cancelRef} className="btn ghost" onClick={() => fechar(false)}>Cancelar</button>
              <button type="button" className={`btn ${dlg.perigo ? 'danger' : ''}`} onClick={() => fechar(true)}>{dlg.ok || 'Confirmar'}</button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  )
}
