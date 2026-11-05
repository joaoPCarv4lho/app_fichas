import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import TopBar from '../components/TopBar.jsx'
import { useToast } from '../components/Toast.jsx'
import {
  listClientes, listAgendamentos, getAgendamento, saveAgendamento,
} from '../lib/db.js'
import { DURACOES, hojeISO, hhmm, conflita } from '../lib/agenda.js'

const pad = (n) => String(n).padStart(2, '0')
const HORAS = Array.from({ length: 24 }, (_, i) => pad(i))
const MINUTOS = Array.from({ length: 12 }, (_, i) => pad(i * 5))

export default function AgendamentoForm() {
  const { id } = useParams()
  const editando = Boolean(id)
  const navigate = useNavigate()
  const toast = useToast()
  const [params] = useSearchParams()

  const [clientes, setClientes] = useState([])
  const [modo, setModo] = useState('cadastrada') // 'cadastrada' | 'avulso'
  const [clienteId, setClienteId] = useState('')
  const [nomeAvulso, setNomeAvulso] = useState('')
  const [telAvulso, setTelAvulso] = useState('')
  const [tipo, setTipo] = useState('')
  const [servico, setServico] = useState('')
  const [data, setData] = useState(params.get('data') || hojeISO())
  const [hora, setHora] = useState('09:00')
  const [duracao, setDuracao] = useState(60)
  const [status, setStatus] = useState('agendado')
  const [obs, setObs] = useState('')
  const [doDia, setDoDia] = useState([]) // outros agendamentos do dia (p/ conflito)
  const [busy, setBusy] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => { listClientes().then(setClientes).catch(() => {}) }, [])

  useEffect(() => {
    if (!editando) return
    getAgendamento(id).then((a) => {
      setModo(a.cliente_id ? 'cadastrada' : 'avulso')
      setClienteId(a.cliente_id || '')
      setNomeAvulso(a.nome_avulso || ''); setTelAvulso(a.telefone_avulso || '')
      setTipo(a.tipo || ''); setServico(a.servico || '')
      setData(a.data); setHora(hhmm(a.hora)); setDuracao(a.duracao_min); setStatus(a.status)
      setObs(a.observacoes || '')
    }).catch((e) => setErro(e.message))
  }, [id])

  // carrega outros agendamentos do dia para checar conflito
  useEffect(() => {
    if (!data) return
    listAgendamentos({ dia: data }).then((l) => setDoDia(l.filter((x) => x.id !== id))).catch(() => {})
  }, [data, id])

  const conflito = useMemo(() => {
    const atual = { data, hora: hora + ':00', duracao_min: duracao }
    return doDia.some((o) => o.status !== 'cancelado' && conflita(atual, o))
  }, [data, hora, duracao, doDia])

  const [hh, mm] = hora.split(':')
  const minutos = MINUTOS.includes(mm) ? MINUTOS : [...MINUTOS, mm].sort()

  const setDur =(v) => setDuracao(Math.max(5, Math.min(600, Math.round((Number(v) || 0) / 5) * 5)))

  const salvar = async () => {
    setErro('')
    if (modo === 'cadastrada' && !clienteId) { setErro('Escolha a cliente ou use "avulsa".'); return }
    if (modo === 'avulso' && !nomeAvulso.trim()) { setErro('Informe o nome da cliente avulsa.'); return }
    setBusy(true)
    try {
      await saveAgendamento({
        id: editando ? id : undefined,
        cliente_id: modo === 'cadastrada' ? clienteId : null,
        nome_avulso: modo === 'avulso' ? nomeAvulso.trim() : null,
        telefone_avulso: modo === 'avulso' ? telAvulso.trim() : null,
        tipo: tipo || null,
        servico: servico.trim(),
        data, hora, duracao_min: Number(duracao), status,
        observacoes: obs.trim(),
      })
      toast(editando ? 'Agendamento atualizado' : 'Agendamento criado')
      navigate(-1)
    } catch (e) { setErro(e.message); setBusy(false) }
  }

  return (
    <div className="app">
      <TopBar title={editando ? 'Agendamento' : 'Novo agendamento'} />
      <div className="content">
        {/* Cliente */}
        <div className="section-title">Cliente</div>
        <div className="card">
          <div className="simnao" style={{ marginBottom: 14 }}>
            <button type="button" className={modo === 'cadastrada' ? 'on-sim' : ''} onClick={() => setModo('cadastrada')}>Cadastrada</button>
            <button type="button" className={modo === 'avulso' ? 'on-sim' : ''} onClick={() => setModo('avulso')}>Avulsa</button>
          </div>
          {modo === 'cadastrada' ? (
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Escolha a cliente</label>
              <select value={clienteId} onChange={(e) => setClienteId(e.target.value)}>
                <option value="">Selecione…</option>
                {clientes.map((c) => <option key={c.id} value={c.id}>{c.nome}</option>)}
              </select>
              {clientes.length === 0 && <div className="hint">Nenhuma cliente cadastrada ainda — use "Avulsa" ou cadastre em Clientes.</div>}
            </div>
          ) : (
            <>
              <div className="field">
                <label>Nome</label>
                <input type="text" value={nomeAvulso} onChange={(e) => setNomeAvulso(e.target.value)} placeholder="Nome da cliente" />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label>WhatsApp (opcional)</label>
                <input type="tel" inputMode="tel" value={telAvulso} onChange={(e) => setTelAvulso(e.target.value)} placeholder="(00) 00000-0000" />
              </div>
            </>
          )}
        </div>

        {/* Serviço */}
        <div className="section-title">Serviço</div>
        <div className="card">
          <div className="field">
            <label>Tipo</label>
            <div className="simnao">
              <button type="button" className={tipo === 'pele' ? 'on-sim' : ''} onClick={() => setTipo(tipo === 'pele' ? '' : 'pele')}>🧖 Pele</button>
              <button type="button" className={tipo === 'manicure' ? 'on-sim' : ''} onClick={() => setTipo(tipo === 'manicure' ? '' : 'manicure')}>💅 Manicure</button>
            </div>
          </div>
          <div className="field" style={{ marginBottom: 0 }}>
            <label>Descrição (opcional)</label>
            <input type="text" value={servico} onChange={(e) => setServico(e.target.value)} placeholder="Ex.: Esmaltação em gel" />
          </div>
        </div>

        {/* Horário */}
        <div className="section-title">Horário</div>
        <div className="card">
          <div className="timegrid">
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Data</label>
              <input type="date" value={data} onChange={(e) => setData(e.target.value)} />
            </div>
            <div className="field" style={{ marginBottom: 0 }}>
              <label>Início</label>
              <div className="timesel">
                <select aria-label="Hora" value={hh} onChange={(e) => setHora(`${e.target.value}:${mm}`)}>
                  {HORAS.map((h) => <option key={h} value={h}>{h}</option>)}
                </select>
                <span>:</span>
                <select aria-label="Minuto" value={mm} onChange={(e) => setHora(`${hh}:${e.target.value}`)}>
                  {minutos.map((m) => <option key={m} value={m}>{m}</option>)}
                </select>
              </div>
            </div>
          </div>

          <div className="field" style={{ marginBottom: 0 }}>
            <label>Duração</label>
            <div className="chips" style={{ marginBottom: 10 }}>
              {DURACOES.map((d) => (
                <button type="button" key={d} className={'chip' + (Number(duracao) === d ? ' on' : '')} onClick={() => setDuracao(d)}>{d} min</button>
              ))}
            </div>
            <div className="stepper">
              <button type="button" onClick={() => setDur(Number(duracao) - 5)} aria-label="Diminuir 5 min">−</button>
              <div className="val">{duracao}<span>min</span></div>
              <button type="button" onClick={() => setDur(Number(duracao) + 5)} aria-label="Aumentar 5 min">+</button>
            </div>
          </div>
          {conflito && <div className="notice" style={{ marginTop: 14 }}>⚠️ Já existe outro horário nesse intervalo. Você pode salvar mesmo assim.</div>}
        </div>

        {/* Observações */}
        <div className="section-title">Observações</div>
        <div className="card">
          <textarea className="notes" value={obs} onChange={(e) => setObs(e.target.value)}
            placeholder="Anotações do agendamento — produtos, preferências, alertas…" />
        </div>

        {erro && <div className="error-text">{erro}</div>}
        <div className="actionbar">
          <div className="actionbar-inner">
            <button className="btn" disabled={busy} onClick={salvar}>{busy ? 'Salvando…' : 'Salvar'}</button>
          </div>
        </div>
      </div>
    </div>
  )
}
