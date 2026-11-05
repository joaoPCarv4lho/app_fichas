import { useState } from 'react'
import TopBar from '../components/TopBar.jsx'
import InstallCard from '../components/InstallCard.jsx'
import { useAuth } from '../auth/AuthContext.jsx'

export default function Configuracoes() {
  const { hasPin, setupPin, verifyPin, removePin, signOut, session, isAdmin } = useAuth()
  const [removendo, setRemovendo] = useState(false)
  const [pinAtual, setPinAtual] = useState('')
  const [pin, setPin] = useState('')
  const [pin2, setPin2] = useState('')
  const [msg, setMsg] = useState('')
  const [erro, setErro] = useState('')

  const salvarPin = async () => {
    setErro(''); setMsg('')
    if (!/^\d{4}$/.test(pin)) { setErro('O PIN deve ter 4 dígitos.'); return }
    if (pin !== pin2) { setErro('Os PINs não conferem.'); return }
    await setupPin(pin)
    setPin(''); setPin2(''); setMsg('PIN salvo! Ele será pedido ao abrir o app.')
  }

  const confirmarRemocao = async () => {
    setErro(''); setMsg('')
    if (!(await verifyPin(pinAtual))) { setErro('PIN incorreto.'); return }
    removePin()
    setRemovendo(false); setPinAtual(''); setMsg('PIN removido.')
  }

  return (
    <div className="app">
      <TopBar title={isAdmin ? 'Configurações' : 'Segurança'} />
      <div className="content">
        {isAdmin && (
          <div className="card">
            <div className="muted" style={{ fontSize: 13 }}>Conta</div>
            <div style={{ fontWeight: 600 }}>{session?.user?.email}</div>
            <div className="badge ok" style={{ marginTop: 8 }}>✓ Admin</div>
          </div>
        )}

        <div className="section-title">Aplicativo</div>
        <InstallCard />

        <div className="section-title">Trava de segurança (PIN)</div>
        <div className="card">
          <p className="muted" style={{ marginTop: 0, fontSize: 14 }}>
            Um PIN de 4 dígitos é pedido toda vez que o app abre, protegendo as fichas caso alguém pegue seu aparelho.
          </p>
          {hasPin ? (
            removendo ? (
              <>
                <div className="field">
                  <label>PIN atual</label>
                  <input type="password" inputMode="numeric" maxLength={4} value={pinAtual} onChange={(e) => setPinAtual(e.target.value.replace(/\D/g, ''))} />
                </div>
                <button className="btn" onClick={confirmarRemocao}>Confirmar</button>
              </>
            ) : (
              <button className="btn ghost" onClick={() => { setRemovendo(true); setErro(''); setMsg('') }}>Remover PIN</button>
            )
          ) : (
            <>
              <div className="field">
                <label>Novo PIN (4 dígitos)</label>
                <input type="password" inputMode="numeric" maxLength={4} value={pin} onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))} />
              </div>
              <div className="field">
                <label>Confirmar PIN</label>
                <input type="password" inputMode="numeric" maxLength={4} value={pin2} onChange={(e) => setPin2(e.target.value.replace(/\D/g, ''))} />
              </div>
              <button className="btn" onClick={salvarPin}>Salvar PIN</button>
            </>
          )}
          {erro && <div className="error-text">{erro}</div>}
          {msg && <div className="notice" style={{ marginTop: 10 }}>{msg}</div>}
        </div>

        <div className="section-title">Sessão</div>
        <button className="btn danger" onClick={signOut}>Sair da conta</button>
      </div>
    </div>
  )
}
