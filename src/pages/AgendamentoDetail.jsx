import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopBar from '../components/TopBar.jsx'
import { useToast } from '../components/Toast.jsx'
import { getAgendamento, patchAgendamento, deleteAgendamento } from '../lib/db.js'
import { STATUS, hhmm, fimDe, rotuloDia } from '../lib/agenda.js'

export default function AgendamentoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const toast = useToast()
  const [ag, setAg] = useState(null)
  const [erro, setErro] = useState('')
  const [busy, setBusy] = useState(false)

  const carregar = () => getAgendamento(id).then(setAg).catch((e) => setErro(e.message))
  useEffect(() => { carregar() }, [id])

  if (erro) return <div className="app"><TopBar title="Agendamento" /><div className="content"><div className="notice">{erro}</div></div></div>
  if (!ag) return <div className="app"><TopBar title="Agendamento" /><div className="content"><div className="sk sk-card" style={{ height: 120 }} /></div></div>

  const nome = ag.cliente?.nome || ag.nome_avulso || 'Sem nome'
  const fone = ag.cliente?.whatsapp || ag.telefone_avulso || ''
  const st = STATUS[ag.status] || STATUS.agendado
  const aberto = ag.status === 'agendado' || ag.status === 'confirmado'

  const mudar = async (novo, sair) => {
    setBusy(true)
    try {
      await patchAgendamento(id, { status: novo })
      if (sair) { toast(`Marcado como ${STATUS[novo].label.toLowerCase()}`); navigate('/', { replace: true }) }
      else { toast(`Marcado como ${STATUS[novo].label.toLowerCase()}`); await carregar(); setBusy(false) }
    } catch (e) { alert('Erro: ' + e.message); setBusy(false) }
  }

  const excluir = async () => {
    if (!confirm('Excluir este agendamento?')) return
    try { await deleteAgendamento(id); toast('Agendamento excluído'); navigate('/', { replace: true }) }
    catch (e) { alert('Erro: ' + e.message) }
  }

  const abrirWhats = () => {
    const num = fone.replace(/\D/g, '')
    const [a, m, d] = ag.data.split('-')
    const msg = encodeURIComponent(`Oi, ${nome.split(' ')[0]}! Passando para confirmar seu horário no dia ${d}/${m} às ${hhmm(ag.hora)} 💅`)
    window.open(`https://wa.me/55${num}?text=${msg}`, '_blank')
  }

  const registrar = () => navigate(`/cliente/${ag.cliente_id}/atendimento/novo?agendamento=${id}${ag.tipo ? `&tipo=${ag.tipo}` : ''}`)
  const verAtendimento = () => navigate(`/cliente/${ag.cliente_id}/atendimento/${ag.atendimento_id}`)
  const editar = () => navigate(`/agendamento/${id}/editar`)
  const cadastrarCliente = () =>
    navigate(`/cliente/novo?nome=${encodeURIComponent(ag.nome_avulso || '')}&whats=${encodeURIComponent(ag.telefone_avulso || '')}`)

  return (
    <div className="app">
      <TopBar title="Agendamento" />
      <div className="content">
        {/* Cabeçalho */}
        <div className="card">
          <div className="row" style={{ alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 19 }}>{nome}</div>
              <div className="meta">{rotuloDia(ag.data)} · {hhmm(ag.hora)}–{fimDe(ag.hora, ag.duracao_min)}</div>
            </div>
            <span className={`badge ${st.cls}`}>{st.label}</span>
          </div>
          <div className="row" style={{ marginTop: 10, gap: 6 }}>
            {ag.tipo && <span className={`badge ${ag.tipo}`}>{ag.tipo === 'pele' ? '🧖 Pele' : '💅 Manicure'}</span>}
            {ag.servico && <span className="meta">{ag.servico}</span>}
          </div>
          {!ag.cliente_id && <div className="hint" style={{ marginTop: 8 }}>Cliente avulsa (sem ficha cadastrada)</div>}
          {ag.observacoes && <p className="muted" style={{ marginBottom: 0, marginTop: 12, whiteSpace: 'pre-line' }}>{ag.observacoes}</p>}
        </div>

        {/* Ações principais */}
        {aberto && (
          <>
            {ag.atendimento_id ? (
              <>
                <button className="btn secondary" onClick={verAtendimento}>📋 Ver atendimento</button>
                <div className="hint" style={{ marginTop: 8 }}>Atendimento já registrado — reabrir não apaga o registro.</div>
              </>
            ) : ag.cliente_id ? (
              <button className="btn" disabled={busy} onClick={registrar}>📋 Registrar atendimento</button>
            ) : (
              <>
                <button className="btn" disabled={busy} onClick={() => mudar('realizado', true)}>✅ Marcar como realizado</button>
                <button className="btn secondary" style={{ marginTop: 10 }} onClick={cadastrarCliente}>➕ Cadastrar cliente</button>
              </>
            )}

            <div className="row" style={{ marginTop: 10, gap: 10 }}>
              {ag.status === 'agendado' && <button className="btn secondary sm" disabled={busy} onClick={() => mudar('confirmado', false)}>✓ Confirmar</button>}
              {fone && <button className="btn secondary sm" onClick={abrirWhats}>💬 WhatsApp</button>}
            </div>

            <div className="row" style={{ marginTop: 10, gap: 10 }}>
              <button className="btn ghost sm" disabled={busy} onClick={() => mudar('cancelado', true)}>Cancelar</button>
              <button className="btn ghost sm" disabled={busy} onClick={() => mudar('faltou', true)}>Faltou</button>
              <button className="btn ghost sm" onClick={editar}>Editar</button>
            </div>
          </>
        )}

        {/* Realizado */}
        {ag.status === 'realizado' && (
          <>
            {ag.atendimento_id
              ? <button className="btn" onClick={verAtendimento}>📋 Ver atendimento</button>
              : <div className="notice">Marcado como realizado (sem ficha de atendimento).</div>}
            <button className="btn ghost" style={{ marginTop: 10 }} disabled={busy} onClick={() => mudar('agendado', false)}>↩︎ Reabrir</button>
          </>
        )}

        {/* Cancelado / Faltou */}
        {(ag.status === 'cancelado' || ag.status === 'faltou') && (
          <button className="btn ghost" disabled={busy} onClick={() => mudar('agendado', false)}>↩︎ Reabrir</button>
        )}

        <button className="btn danger" style={{ marginTop: 28 }} onClick={excluir}>Excluir agendamento</button>
      </div>
    </div>
  )
}
