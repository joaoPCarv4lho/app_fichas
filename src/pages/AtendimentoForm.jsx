import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import TopBar from '../components/TopBar.jsx'
import PhotoCapture from '../components/PhotoCapture.jsx'
import { getAtendimento, saveAtendimento, deleteAtendimento, uploadFoto, signedUrl, removerFotos, patchAgendamento } from '../lib/db.js'
import { SkeletonDetail } from '../components/Skeleton.jsx'
import ErroCarga from '../components/ErroCarga.jsx'
import { mensagemDeErro } from '../lib/erros.js'
import { useConfirm } from '../components/ConfirmDialog.jsx'
import { useToast } from '../components/Toast.jsx'
import { hojeISO } from '../lib/agenda.js'
import { useAuth } from '../auth/AuthContext.jsx'


export default function AtendimentoForm() {
  const { id, atId } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const confirmar = useConfirm()
  const { isAdmin } = useAuth()
  const [params] = useSearchParams()
  const editando = Boolean(atId)
  // id gerado no cliente: se um passo depois do insert falhar, tocar Salvar de novo vira update (não duplica)
  const [novoId] = useState(() => crypto.randomUUID())
  // fotos já enviadas nesta tela (key -> {path,momento}): o retry não sobe a mesma foto de novo
  const enviadas = useRef(new Map())
  // paths salvos ao abrir: os que a usuária removeu do formulário são apagados do Storage após salvar
  const originais = useRef([])

  const [tipo, setTipo] = useState(params.get('tipo') === 'manicure' ? 'manicure' : 'pele')
  const [data, setData] = useState(hojeISO())
  const [servico, setServico] = useState('')
  const [obs, setObs] = useState('')
  const [fotos, setFotos] = useState([]) // { key, momento, preview, blob?, path? }
  const [busy, setBusy] = useState(false)
  const [erro, setErro] = useState('')
  // Na edição o formulário só aparece com o atendimento carregado: salvar antes sobrescreveria o registro com campos vazios.
  const [carregado, setCarregado] = useState(!editando)
  const [erroCarga, setErroCarga] = useState(null)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    if (!atId) return
    let ativo = true
    getAtendimento(atId).then(async (at) => {
      // foto com URL assinada que falhou continua na lista (preview nulo), senão seria apagada do registro ao salvar
      const carregadas = await Promise.all((at.fotos || []).map(async (f) => ({
        key: crypto.randomUUID(), momento: f.momento, path: f.path,
        preview: await signedUrl(f.path).catch(() => null),
      })))
      if (!ativo) return
      setTipo(at.tipo); setData(at.data); setServico(at.servico || ''); setObs(at.observacoes || '')
      setFotos(carregadas)
      originais.current = (at.fotos || []).map((f) => f.path)
      setCarregado(true)
    }).catch((e) => { if (ativo) setErroCarga(e || new Error('falha')) })
    return () => { ativo = false }
  }, [atId, tentativa])

  const tentarDeNovo = () => { setErroCarga(null); setTentativa((n) => n + 1) }

  const salvar = async () => {
    setBusy(true); setErro('')
    try {
      // sobe fotos novas (as que têm blob); mantém as já salvas (path)
      const fotosFinais = []
      for (const f of fotos) {
        if (f.path) fotosFinais.push({ path: f.path, momento: f.momento })
        else if (f.blob) {
          if (!enviadas.current.has(f.key)) enviadas.current.set(f.key, await uploadFoto(f.blob, f.momento))
          fotosFinais.push(enviadas.current.get(f.key))
        }
      }
      const saved = await saveAtendimento({
        id: editando ? atId : novoId,
        cliente_id: id, tipo, data,
        servico: servico.trim(),
        observacoes: obs.trim(),
        fotos: fotosFinais,
      })
      await removerFotos(originais.current.filter((p) => !fotosFinais.some((f) => f.path === p)))
      // veio de um agendamento? fecha o ciclo: vincula + marca realizado
      const agId = params.get('agendamento')
      if (agId && !editando) {
        try {
          await patchAgendamento(agId, { status: 'realizado', atendimento_id: saved.id })
        } catch (e) {
          if (e.code !== 'SEM_LINHAS') throw e
          toast('Atendimento salvo, mas o agendamento não existe mais.')
          navigate(`/cliente/${id}`, { replace: true })
          return
        }
        toast('Atendimento registrado')
        navigate('/', { replace: true })
      } else {
        toast('Atendimento salvo')
        navigate(`/cliente/${id}`, { replace: true })
      }
    } catch (err) { setErro(mensagemDeErro(err)); setBusy(false) }
  }

  const excluir = async () => {
    const ok = await confirmar({ titulo: 'Excluir este atendimento?', texto: 'Esta ação não pode ser desfeita.', ok: 'Excluir', perigo: true })
    if (!ok) return
    try {
      await deleteAtendimento(atId) // linha primeiro: se falhar, as fotos continuam valendo
      await removerFotos(fotos.filter((f) => f.path).map((f) => f.path))
      navigate(`/cliente/${id}`, { replace: true })
    } catch (e) { toast(mensagemDeErro(e), false) }
  }

  return (
    <div className="app">
      <TopBar title={editando ? 'Atendimento' : 'Novo atendimento'} />
      <div className="content">
        {erroCarga && <ErroCarga erro={erroCarga} onRetry={tentarDeNovo} />}
        {!carregado && !erroCarga && <SkeletonDetail />}
        {carregado && (<>
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

          {editando && isAdmin && <button className="btn danger" style={{ marginTop: 12 }} onClick={excluir}>Excluir atendimento</button>}
          <div className="actionbar">
            {erro && <div className="error-text" role="alert">{erro}</div>}
            <div className="actionbar-inner">
              <button className="btn" disabled={busy} onClick={salvar}>{busy ? 'Salvando…' : 'Salvar atendimento'}</button>
            </div>
          </div>
        </>)}
      </div>
    </div>
  )
}
