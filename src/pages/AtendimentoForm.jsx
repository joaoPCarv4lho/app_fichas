import { useEffect, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import TopBar from '../components/TopBar.jsx'
import PhotoCapture from '../components/PhotoCapture.jsx'
import { getAtendimento, saveAtendimento, deleteAtendimento, uploadFoto, signedUrl, removeFoto, patchAgendamento } from '../lib/db.js'
import { useToast } from '../components/Toast.jsx'
import { useAuth } from '../auth/AuthContext.jsx'

const hoje = () => new Date().toISOString().slice(0, 10)

export default function AtendimentoForm() {
  const { id, atId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const { isAdmin } = useAuth()
  const [params] = useSearchParams()
  const editando = Boolean(atId)

  const [tipo, setTipo] = useState(params.get('tipo') === 'manicure' ? 'manicure' : 'pele')
  const [data, setData] = useState(hoje())
  const [servico, setServico] = useState('')
  const [obs, setObs] = useState('')
  const [fotos, setFotos] = useState([]) // { key, momento, preview, blob?, path? }
  const [busy, setBusy] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    if (!editando) return
    getAtendimento(atId).then(async (at) => {
      setTipo(at.tipo); setData(at.data); setServico(at.servico || ''); setObs(at.observacoes || '')
      const carregadas = await Promise.all((at.fotos || []).map(async (f) => ({
        key: crypto.randomUUID(), momento: f.momento, path: f.path, preview: await signedUrl(f.path),
      })))
      setFotos(carregadas.filter((f) => f.preview))
    }).catch((e) => setErro(e.message))
  }, [atId])

  const salvar = async () => {
    setBusy(true); setErro('')
    try {
      // sobe fotos novas (as que têm blob); mantém as já salvas (path)
      const fotosFinais = []
      for (const f of fotos) {
        if (f.path) fotosFinais.push({ path: f.path, momento: f.momento })
        else if (f.blob) fotosFinais.push(await uploadFoto(f.blob, f.momento))
      }
      const saved = await saveAtendimento({
        id: editando ? atId : undefined,
        cliente_id: id, tipo, data,
        servico: servico.trim(),
        observacoes: obs.trim(),
        fotos: fotosFinais,
      })
      // veio de um agendamento? fecha o ciclo: vincula + marca realizado
      const agId = params.get('agendamento')
      if (agId && !editando) {
        await patchAgendamento(agId, { status: 'realizado', atendimento_id: saved.id })
        toast('Atendimento registrado')
        navigate('/', { replace: true })
      } else {
        toast('Atendimento salvo')
        navigate(`/cliente/${id}`, { replace: true })
      }
    } catch (err) { setErro(err.message); setBusy(false) }
  }

  const excluir = async () => {
    if (!confirm('Excluir este atendimento?')) return
    try {
      for (const f of fotos) if (f.path) await removeFoto(f.path)
      await deleteAtendimento(atId)
      navigate(`/cliente/${id}`, { replace: true })
    } catch (e) { alert('Erro: ' + e.message) }
  }

  return (
    <div className="app">
      <TopBar title={editando ? 'Atendimento' : 'Novo atendimento'} />
      <div className="content">
        <div className="card">
          <div className="field">
            <label>Tipo de serviço</label>
            <div className="simnao">
              <button type="button" className={tipo === 'pele' ? 'on-sim' : ''} onClick={() => setTipo('pele')}>🧖 Pele</button>
              <button type="button" className={tipo === 'manicure' ? 'on-sim' : ''} onClick={() => setTipo('manicure')}>💅 Manicure</button>
            </div>
          </div>
          <div className="field">
            <label>Data</label>
            <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
          </div>
          <div className="field">
            <label>Serviço realizado</label>
            <input type="text" value={servico} onChange={(e) => setServico(e.target.value)} placeholder="Ex.: Esmaltação em gel, Limpeza profunda…" />
          </div>
          <div className="field">
            <label>Observações do dia</label>
            <textarea value={obs} onChange={(e) => setObs(e.target.value)} placeholder="Produtos usados, reações, recomendações…" />
          </div>
        </div>

        <div className="section-title">Fotos (antes / depois)</div>
        <div className="card">
          <PhotoCapture photos={fotos} onChange={setFotos} />
        </div>

        {erro && <div className="error-text">{erro}</div>}
        {editando && isAdmin && <button className="btn danger" style={{ marginTop: 12 }} onClick={excluir}>Excluir atendimento</button>}
        <div className="actionbar">
          <div className="actionbar-inner">
            <button className="btn" disabled={busy} onClick={salvar}>{busy ? 'Salvando…' : 'Salvar atendimento'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
