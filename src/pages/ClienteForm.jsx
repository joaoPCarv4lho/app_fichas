import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import TopBar from '../components/TopBar.jsx'
import { getCliente, saveCliente } from '../lib/db.js'
import { useToast } from '../components/Toast.jsx'
import { SkeletonDetail } from '../components/Skeleton.jsx'

const VAZIO = { nome: '', nascimento: '', whatsapp: '', email: '', como_conheceu: '', observacoes: '' }

export default function ClienteForm() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [params] = useSearchParams()
  // pré-preenche nome/WhatsApp quando vem de um agendamento avulso
  const [c, setC] = useState(() => id ? VAZIO : { ...VAZIO, nome: params.get('nome') || '', whatsapp: params.get('whats') || '' })
  const [busy, setBusy] = useState(false)
  const [erro, setErro] = useState('')
  // Na edição o formulário só aparece com os dados carregados: salvar antes sobrescreveria o registro com campos vazios.
  const [carregado, setCarregado] = useState(!id)
  const [erroCarga, setErroCarga] = useState(false)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    if (!id) return
    let ativo = true
    getCliente(id).then((data) => {
      if (!ativo) return
      setC({ ...VAZIO, ...limpaNulls(data) })
      setCarregado(true)
    }).catch(() => { if (ativo) setErroCarga(true) })
    return () => { ativo = false }
  }, [id, tentativa])

  const tentarDeNovo = () => { setErroCarga(false); setTentativa((n) => n + 1) }

  const set = (k) => (e) => setC({ ...c, [k]: e.target.value })

  const submit = async (e) => {
    e.preventDefault()
    if (!c.nome.trim()) { setErro('Informe o nome.'); return }
    setBusy(true); setErro('')
    try {
      const payload = { ...c }
      if (!payload.nascimento) payload.nascimento = null
      const saved = await saveCliente(payload)
      toast(id ? 'Alterações salvas' : 'Cliente cadastrada')
      navigate(`/cliente/${saved.id}`, { replace: true })
    } catch (err) {
      setErro(err.message); setBusy(false)
    }
  }

  return (
    <div className="app">
      <TopBar title={id ? 'Editar cliente' : 'Nova cliente'} />
      <div className="content">
        {erroCarga && (
          <>
            <div className="notice">Não foi possível carregar. Verifique a conexão e tente de novo.</div>
            <button type="button" className="btn secondary" onClick={tentarDeNovo}>Tentar de novo</button>
          </>
        )}
        {!carregado && !erroCarga && <SkeletonDetail />}
        {carregado && (
          <form onSubmit={submit}>
            <div className="card">
              <div className="field">
                <label>Nome completo *</label>
                <input type="text" value={c.nome} onChange={set('nome')} required />
              </div>
              <div className="field">
                <label>Data de nascimento</label>
                <input type="date" value={c.nascimento || ''} onChange={set('nascimento')} />
              </div>
              <div className="field">
                <label>WhatsApp</label>
                <input type="tel" inputMode="tel" value={c.whatsapp} onChange={set('whatsapp')} placeholder="(00) 00000-0000" />
              </div>
              <div className="field">
                <label>E-mail</label>
                <input type="email" value={c.email} onChange={set('email')} />
              </div>
              <div className="field">
                <label>Como conheceu</label>
                <input type="text" value={c.como_conheceu} onChange={set('como_conheceu')} placeholder="Instagram, indicação…" />
              </div>
              <div className="field">
                <label>Observações</label>
                <textarea value={c.observacoes} onChange={set('observacoes')} />
              </div>
            </div>
            {erro && <div className="error-text">{erro}</div>}
            <div className="actionbar">
              <div className="actionbar-inner">
                <button className="btn" disabled={busy}>{busy ? 'Salvando…' : 'Salvar'}</button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

function limpaNulls(obj) {
  const out = {}
  for (const k in obj) out[k] = obj[k] ?? ''
  return out
}
