import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import TopBar from '../components/TopBar.jsx'
import { getCliente, getAnamneses, listAtendimentos, deleteCliente } from '../lib/db.js'
import { FICHAS } from '../data/fichaSchemas.js'
import { gerarPdfAnamnese } from '../lib/pdf.js'
import { hojeISO, idadeDe } from '../lib/agenda.js'
import { avatarColor, iniciais } from '../lib/ui.js'
import { SkeletonDetail } from '../components/Skeleton.jsx'
import ErroCarga from '../components/ErroCarga.jsx'
import { mensagemDeErro } from '../lib/erros.js'
import { useToast } from '../components/Toast.jsx'
import { useConfirm } from '../components/ConfirmDialog.jsx'
import { useAuth } from '../auth/AuthContext.jsx'

export default function ClienteDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [cliente, setCliente] = useState(null)
  const [anamneses, setAnamneses] = useState([])
  const [atendimentos, setAtendimentos] = useState([])
  const toast = useToast()
  const confirmar = useConfirm()
  const [erro, setErro] = useState(null)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let ativo = true
    setErro(null); setCliente(null)
    Promise.all([getCliente(id), getAnamneses(id), listAtendimentos(id)])
      .then(([c, an, at]) => { if (ativo) { setCliente(c); setAnamneses(an); setAtendimentos(at) } })
      .catch((e) => ativo && setErro(e || new Error('erro')))
    return () => { ativo = false }
  }, [id, tentativa])

  const anamneseDe = (tipo) => anamneses.find((a) => a.tipo === tipo)

  const excluir = async () => {
    const ok = await confirmar({ titulo: `Excluir ${cliente.nome}?`, texto: 'Todos os seus registros serão excluídos. Esta ação não pode ser desfeita.', ok: 'Excluir', perigo: true })
    if (!ok) return
    try { await deleteCliente(id); navigate('/', { replace: true }) }
    catch (e) { toast(mensagemDeErro(e), false) }
  }

  if (erro) return <div className="app"><TopBar title="Cliente" /><div className="content"><ErroCarga erro={erro} onRetry={() => setTentativa((t) => t + 1)} /></div></div>
  if (!cliente) return <div className="app"><TopBar title="Cliente" /><div className="content"><SkeletonDetail /></div></div>

  const cor = avatarColor(cliente.nome)

  return (
    <div className="app">
      <TopBar title={cliente.nome} action={<button className="action" onClick={() => navigate(`/cliente/${id}/editar`)}>Editar</button>} />
      <div className="content">
        {/* Perfil */}
        <div className="card">
          <div className="row">
            <div className="avatar" style={{ background: cor.bg, color: cor.fg, width: 54, height: 54, fontSize: 20 }}>{iniciais(cliente.nome)}</div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 17 }}>{cliente.nome}</div>
              <div className="muted" style={{ fontSize: 14 }}>
                {idadeDe(cliente.nascimento, hojeISO()) && `${idadeDe(cliente.nascimento, hojeISO())} anos · `}
                {cliente.whatsapp || 'sem telefone'}
              </div>
            </div>
          </div>
          {cliente.whatsapp && (
            <a className="btn secondary sm" style={{ marginTop: 12, textDecoration: 'none' }}
               href={`https://wa.me/55${soNumeros(cliente.whatsapp)}`} target="_blank" rel="noreferrer">
              💬 Abrir no WhatsApp
            </a>
          )}
          {cliente.observacoes && <p className="muted" style={{ marginBottom: 0 }}>{cliente.observacoes}</p>}
        </div>

        {/* Anamneses */}
        <div className="section-title">Fichas de anamnese</div>
        {Object.values(FICHAS).map((f) => {
          const a = anamneseDe(f.key)
          return (
            <div className="card" key={f.key}>
              <div className="row">
                <span style={{ fontSize: 24 }}>{f.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>{f.titulo}</div>
                  <div className="meta">
                    {a ? `Atualizada em ${dataBR(a.updated_at)}` : 'Ainda não preenchida'}
                  </div>
                </div>
                {a && <span className="badge ok">✓ Preenchida</span>}
              </div>
              <div className="row" style={{ marginTop: 10 }}>
                <button className="btn secondary sm" onClick={() => navigate(`/cliente/${id}/anamnese/${f.key}`)}>
                  {a ? 'Ver / editar' : 'Preencher'}
                </button>
                {a && <button className="btn ghost sm" onClick={() => gerarPdfAnamnese(cliente, a, f)}>📄 PDF</button>}
              </div>
            </div>
          )
        })}

        {/* Atendimentos */}
        <div className="section-title">Histórico de atendimentos</div>
        {atendimentos.length === 0 && <div className="card muted center" style={{ padding: 20 }}>Nenhum atendimento registrado.</div>}
        {atendimentos.map((at) => (
          <Link key={at.id} to={`/cliente/${id}/atendimento/${at.id}`} className="card link">
            <div style={{ flex: 1 }}>
              <div className="row" style={{ gap: 8 }}>
                <strong>{dataBR(at.data)}</strong>
                <span className={`badge ${at.tipo}`}>{at.tipo === 'pele' ? 'Pele' : 'Manicure'}</span>
              </div>
              <div className="muted" style={{ fontSize: 14 }}>{at.servico || 'Atendimento'}{at.fotos?.length ? ` · ${at.fotos.length} foto(s)` : ''}</div>
            </div>
            <span className="muted">›</span>
          </Link>
        ))}
        <button className="btn secondary" style={{ marginTop: 8 }} onClick={() => navigate(`/cliente/${id}/atendimento/novo`)}>+ Novo atendimento</button>

        {isAdmin && <button className="btn danger" style={{ marginTop: 32 }} onClick={excluir}>Excluir cliente</button>}
      </div>
    </div>
  )
}

function soNumeros(s = '') { return s.replace(/\D/g, '') }
function dataBR(iso) { if (!iso) return ''; const d = new Date(iso.length <= 10 ? iso + 'T00:00:00' : iso); return d.toLocaleDateString('pt-BR') }
