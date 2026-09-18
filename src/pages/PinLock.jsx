import { useState } from 'react'
import { useAuth } from '../auth/AuthContext.jsx'

export default function PinLock() {
  const { verifyPin, signOut } = useAuth()
  const [pin, setPin] = useState('')
  const [erro, setErro] = useState(false)

  const press = async (n) => {
    setErro(false)
    const next = (pin + n).slice(0, 4)
    setPin(next)
    if (next.length === 4) {
      const ok = await verifyPin(next)
      if (!ok) { setErro(true); setTimeout(() => setPin(''), 400) }
    }
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
          <button className="blank" onClick={signOut} style={{ fontSize: 13 }}>Sair</button>
          <button onClick={() => press('0')}>0</button>
          <button onClick={back}>⌫</button>
        </div>
      </div>
    </div>
  )
}
