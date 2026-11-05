import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopBar from '../components/TopBar.jsx'
import DynamicForm from '../components/DynamicForm.jsx'
import SignaturePad from '../components/SignaturePad.jsx'
import { FICHAS, TERMO_CONSENTIMENTO } from '../data/fichaSchemas.js'
import { getCliente, getAnamnese, saveAnamnese } from '../lib/db.js'
import { useToast } from '../components/Toast.jsx'
import { SkeletonDetail } from '../components/Skeleton.jsx'

export default function AnamneseForm() {
  const { id, tipo } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const schema = FICHAS[tipo]

  const [cliente, setCliente] = useState(null)
  const [existente, setExistente] = useState(null)
  const [respostas, setRespostas] = useState({})
  const [assinatura, setAssinatura] = useState(null)
  const [busy, setBusy] = useState(false)
  const [erro, setErro] = useState('')
  // O formulário só aparece com cliente e ficha existente carregados: salvar antes sobrescreveria a ficha real com respostas vazias.
  const [carregado, setCarregado] = useState(false)
  const [erroCarga, setErroCarga] = useState(false)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    if (!FICHAS[tipo]) return
    let ativo = true
    Promise.all([getCliente(id), getAnamnese(id, tipo)]).then(([c, a]) => {
      if (!ativo) return
      setCliente(c)
      if (a) {
        setExistente(a)
        setRespostas(a.respostas || {})
        setAssinatura(a.consent_assinatura || null)
      }
      setCarregado(true)
    }).catch(() => { if (ativo) setErroCarga(true) })
    return () => { ativo = false }
  }, [id, tipo, tentativa])

  const tentarDeNovo = () => { setErroCarga(false); setTentativa((n) => n + 1) }

  if (!schema) return <div className="app"><TopBar title="Ficha" /><div className="content"><div className="notice">Tipo de ficha inválido.</div></div></div>

  const termo = cliente ? TERMO_CONSENTIMENTO.replace('{NOME}', cliente.nome) : TERMO_CONSENTIMENTO

  const salvar = async () => {
    if (!assinatura) { setErro('A cliente precisa assinar o termo de consentimento.'); window.scrollTo(0, document.body.scrollHeight); return }
    setBusy(true); setErro('')
    try {
      await saveAnamnese({
        id: existente?.id,
        cliente_id: id,
        tipo,
        respostas,
        consent_texto: termo,
        consent_assinatura: assinatura,
        consent_data: existente?.consent_data || new Date().toISOString(),
      })
      toast('Ficha salva')
      navigate(`/cliente/${id}`, { replace: true })
    } catch (err) { setErro(err.message); setBusy(false) }
  }

  return (
    <div className="app">
      <TopBar title={`${schema.emoji} ${schema.titulo}`} />
      <div className="content">
        {erroCarga && (
          <>
            <div className="notice">Não foi possível carregar a ficha. Verifique a conexão e tente de novo.</div>
            <button type="button" className="btn secondary" onClick={tentarDeNovo}>Tentar de novo</button>
          </>
        )}
        {!carregado && !erroCarga && <SkeletonDetail />}
        {carregado && (<>
        {cliente && <p className="muted" style={{ marginTop: 0 }}>Cliente: <strong>{cliente.nome}</strong></p>}

        <DynamicForm schema={schema} value={respostas} onChange={setRespostas} />

        <div className="section-title">Consentimento (LGPD)</div>
        <div className="card">
          <p style={{ fontSize: 14, whiteSpace: 'pre-line', marginTop: 0 }}>{termo}</p>
          <label style={{ fontWeight: 600, fontSize: 14, display: 'block', marginBottom: 8 }}>Assinatura da cliente</label>
          <SignaturePad value={assinatura} onChange={setAssinatura} />
        </div>

        {erro && <div className="error-text">{erro}</div>}
        <div className="actionbar">
          <div className="actionbar-inner">
            <button className="btn" disabled={busy} onClick={salvar}>{busy ? 'Salvando…' : 'Salvar ficha'}</button>
          </div>
        </div>
        </>)}
      </div>
    </div>
  )
}
