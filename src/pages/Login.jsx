import { useState } from 'react'
import { supabase } from '../lib/supabase.js'
import { mensagemDeErro } from '../lib/erros.js'

export default function Login() {
  const [email, setEmail] = useState('')
  const [senha, setSenha] = useState('')
  const [erro, setErro] = useState('')
  const [busy, setBusy] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    setErro(''); setBusy(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password: senha })
      if (error) throw error
    } catch (err) {
      setErro(traduz(err.message) || mensagemDeErro(err))
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="center-screen">
      <div className="auth-box">
        <div className="logo">💅</div>
        <h2>Fichas</h2>
        <p className="muted center" style={{ marginTop: 0 }}>Anamnese • Pele & Manicure</p>
        <form onSubmit={submit} className="card">
          <div className="field">
            <label>E-mail</label>
            <input type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label>Senha</label>
            <input type="password" autoComplete="current-password" required value={senha} onChange={(e) => setSenha(e.target.value)} />
          </div>
          {erro && <div className="error-text">{erro}</div>}
          <button className="btn" disabled={busy} style={{ marginTop: 8 }}>
            {busy ? '…' : 'Entrar'}
          </button>
        </form>
        <p className="muted center" style={{ fontSize: 13 }}>Acesso restrito. Fale com o administrador se não conseguir entrar.</p>
      </div>
    </div>
  )
}

function traduz(m = '') { // null = não reconhecido (cai em mensagemDeErro)
  if (/Invalid login/i.test(m)) return 'E-mail ou senha incorretos.'
  if (/Email not confirmed/i.test(m)) return 'E-mail ainda não confirmado.'
  return null
}
