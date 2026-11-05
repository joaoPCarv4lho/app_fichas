import { useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'

export default function PinLock() {
  const { verifyPin, removePin, signOut } = useAuth()
  const [pin, setPin] = useState('')
  const [erro, setErro] = useState(false)
  const [confirma, setConfirma] = useState(false)

  const press = async (n) => {
    setErro(false); setConfirma(false)
    const next = (pin + n).slice(0, 4)
    setPin(next)
    if (next.length === 4) {
      const ok = await verifyPin(next)
      if (!ok) { setErro(true); setTimeout(() => setPin(''), 400) }
    }
  }
  // 1º toque só pede confirmação; 2º sai e, só depois de a sessão cair, remove o PIN
  // (se signOut falhar, o PIN continua valendo e a sessão não fica aberta sem trava)
  const esqueci = async () => {
    if (!confirma) { setConfirma(true); return }
    await signOut()
    removePin()
  }
  const back = () => setPin(pin.slice(0, -1))

  return (
    <div className="center-screen">
      <div className="auth-box center">
        <div className="logo">🔒</div>
        <h2>Digite seu PIN</h2>
        <div className="pin-dots">
          {[0, 1, 2, 3].map((i) => <div key={i} className={'d' + (pin.length > i ? ' on' : '')} />)}
        </div>
        {erro && <div className="error-text center" style={{ marginBottom: 12 }}>PIN incorreto</div>}
        <div className="keypad">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
            <button key={n} onClick={() => press(String(n))}>{n}</button>
          ))}
          <button className="blank" onClick={esqueci} style={{ fontSize: 13 }}>{confirma ? 'Confirmar: sair e remover o PIN' : 'Esqueci o PIN'}</button>
          <button onClick={() => press('0')}>0</button>
          <button onClick={back}>⌫</button>
        </div>
        <p className="muted" style={{ fontSize: 12, marginBottom: 0 }}>
          Você vai sair e entrar de novo com e-mail e senha; o PIN será removido.
        </p>
      </div>
    </div>
  )
}
