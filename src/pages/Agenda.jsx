import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TabBar from '../components/TabBar.jsx'
import { SkeletonList } from '../components/Skeleton.jsx'
import ErroCarga from '../components/ErroCarga.jsx'
import { useToast } from '../components/Toast.jsx'
import { mensagemDeErro } from '../lib/erros.js'
import { listAgendamentos } from '../lib/db.js'
import { STATUS, hojeISO, addDias, rotuloDia, hhmm, fimDe } from '../lib/agenda.js'

const ABERTOS = ['agendado', 'confirmado']
const FECHADOS = ['realizado', 'cancelado', 'faltou']

export default function Agenda() {
  const navigate = useNavigate()
  const toast = useToast()
  const [aba, setAba] = useState('dia') // 'dia' | 'proximos'
  const [dia, setDia] = useState(hojeISO())
  const [items, setItems] = useState(null)
  const [concluidos, setConcluidos] = useState(null) // null = escondido
  const [carregandoConc, setCarregandoConc] = useState(false)
  const [erro, setErro] = useState(null)
  const [tentativa, setTentativa] = useState(0)
  const reqConc = useRef(0) // invalida resposta de "Ver concluídos" ao trocar dia/aba

  useEffect(() => {
    let ativo = true
    reqConc.current++
    setItems(null); setErro(null); setConcluidos(null); setCarregandoConc(false)
    const q = aba === 'dia' ? { dia, status: ABERTOS } : { de: hojeISO(), status: ABERTOS }
    listAgendamentos(q).then((r) => ativo && setItems(r)).catch((e) => ativo && setErro(e || new Error('erro')))
    return () => { ativo = false }
  }, [aba, dia, tentativa])

  const verConcluidos = () => {
    const req = ++reqConc.current
    setCarregandoConc(true)
    listAgendamentos({ dia, status: FECHADOS })
      .then((r) => { if (req === reqConc.current) setConcluidos(r) })
      .catch((e) => { if (req === reqConc.current) toast(mensagemDeErro(e), false) })
      .finally(() => { if (req === reqConc.current) setCarregandoConc(false) })
  }

  return (
    <div className="app">
      <div className="topbar">
        <span />
        <h1>Agenda</h1>
        <button className="action" onClick={() => navigate('/config')} aria-label="Configurações">⚙️</button>
      </div>

      <div className="content has-tabs">
        <div className="segmented big">
          <button className={aba === 'dia' ? 'on' : ''} onClick={() => setAba('dia')}>Dia</button>
          <button className={aba === 'proximos' ? 'on' : ''} onClick={() => setAba('proximos')}>Próximos</button>
        </div>

        {aba === 'dia' && (
          <div className="daynav">
            <button className="nav" onClick={() => setDia(addDias(dia, -1))} aria-label="Dia anterior">‹</button>
            <label className="daylabel">
              {rotuloDia(dia)}
              <input type="date" value={dia} onChange={(e) => e.target.value && setDia(e.target.value)} />
            </label>
            <button className="nav" onClick={() => setDia(addDias(dia, 1))} aria-label="Próximo dia">›</button>
          </div>
        )}
        {aba === 'dia' && dia !== hojeISO() && (
          <button className="btn ghost sm" style={{ margin: '0 auto 12px', display: 'block' }} onClick={() => setDia(hojeISO())}>Voltar para hoje</button>
        )}

        {erro && <ErroCarga erro={erro} onRetry={() => setTentativa((t) => t + 1)} />}
        {!erro && items === null && <SkeletonList rows={3} />}

        {items && items.length === 0 && (
          <div className="empty">
            <div className="big">🗓️</div>
            <h3>{aba === 'dia' ? 'Nada agendado' : 'Sem próximos horários'}</h3>
            <p>Toque no + para criar um agendamento.</p>
          </div>
        )}

        {aba === 'dia' && (items || []).map((a) => <AgItem key={a.id} a={a} onClick={() => navigate(`/agendamento/${a.id}`)} />)}

        {aba === 'dia' && items && (
          concluidos === null ? (
            <button className="btn ghost sm" style={{ margin: '8px auto 0', display: 'block' }} disabled={carregandoConc} onClick={verConcluidos}>{carregandoConc ? 'Carregando…' : 'Ver concluídos do dia'}</button>
          ) : (
            <>
              <div className="section-title">Concluídos</div>
              {concluidos.length === 0
                ? <div className="card muted center" style={{ padding: 16 }}>Nada concluído neste dia.</div>
                : concluidos.map((a) => <AgItem key={a.id} a={a} onClick={() => navigate(`/agendamento/${a.id}`)} />)}
            </>
          )
        )}

        {aba === 'proximos' && grupos(items || []).map(([data, lista]) => (
          <div key={data}>
            <div className="section-title">{rotuloDia(data)}</div>
            {lista.map((a) => <AgItem key={a.id} a={a} onClick={() => navigate(`/agendamento/${a.id}`)} />)}
          </div>
        ))}
      </div>

      <button className="fab" onClick={() => navigate(`/agendamento/novo?data=${dia}`)} aria-label="Novo agendamento">+</button>
      <TabBar />
    </div>
  )
}

function AgItem({ a, onClick }) {
  const nome = a.cliente?.nome || a.nome_avulso || 'Sem nome'
  const st = STATUS[a.status] || STATUS.agendado
  const cancelado = a.status === 'cancelado'
  return (
    <button className="card link agitem" onClick={onClick} style={cancelado ? { opacity: 0.6 } : undefined}>
      <div className="agtime">
        <strong>{hhmm(a.hora)}</strong>
        <span className="meta">{fimDe(a.hora, a.duracao_min)}</span>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{nome}</div>
        <div className="meta" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {a.tipo && <span className={`badge ${a.tipo}`} style={{ marginRight: 6 }}>{a.tipo === 'pele' ? 'Pele' : 'Manicure'}</span>}
          {a.servico || 'Atendimento'}
        </div>
      </div>
      <span className={`badge ${st.cls}`}>{st.label}</span>
    </button>
  )
}

function grupos(items) {
  const map = new Map()
  for (const a of items) { if (!map.has(a.data)) map.set(a.data, []); map.get(a.data).push(a) }
  return [...map.entries()]
}
