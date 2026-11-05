import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { listClientes } from '../lib/db.js'
import { avatarColor, iniciais } from '../lib/ui.js'
import { SkeletonList } from '../components/Skeleton.jsx'
import TabBar from '../components/TabBar.jsx'
import ErroCarga from '../components/ErroCarga.jsx'
import { useAuth } from '../auth/AuthContext.jsx'

export default function Clientes() {
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const [clientes, setClientes] = useState(null)
  const [busca, setBusca] = useState('')
  const [erro, setErro] = useState(null)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    let ativo = true
    setErro(null); setClientes(null)
    listClientes().then((r) => ativo && setClientes(r)).catch((e) => ativo && setErro(e || new Error('erro')))
    return () => { ativo = false }
  }, [tentativa])

  const filtrados = (clientes || []).filter((c) =>
    c.nome.toLowerCase().includes(busca.toLowerCase().trim())
  )

  return (
    <div className="app">
      <div className="topbar">
        <span />
        <h1>Fichas</h1>
        <button className="action" onClick={() => navigate('/config')} aria-label={isAdmin ? 'Configurações' : 'Segurança'}>⚙️</button>
      </div>
      <div className="content has-tabs">
        <div className="hero">
          <div className="eyebrow">Suas clientes</div>
          <h2>{saudacao()} 👋</h2>
        </div>

        {clientes?.length > 0 && (
          <input className="search" placeholder="Buscar cliente…" value={busca} onChange={(e) => setBusca(e.target.value)} style={{ marginTop: 16 }} />
        )}

        {erro && <ErroCarga erro={erro} onRetry={() => setTentativa((t) => t + 1)} />}
        {!erro && clientes === null && <div style={{ marginTop: 16 }}><SkeletonList rows={4} /></div>}

        {!erro && clientes && filtrados.length === 0 && (
          <div className="empty">
            <div className="big">{busca ? '🔍' : '🌸'}</div>
            {busca ? (
              <>
                <h3>Nada encontrado</h3>
                <p>Nenhuma cliente com “{busca}”.</p>
              </>
            ) : (
              <>
                <h3>Comece por aqui</h3>
                <p>Toque no botão <strong>+</strong> para cadastrar sua primeira cliente.</p>
              </>
            )}
          </div>
        )}

        {filtrados.map((c) => {
          const cor = avatarColor(c.nome)
          return (
            <Link key={c.id} to={`/cliente/${c.id}`} className="card link">
              <div className="avatar" style={{ background: cor.bg, color: cor.fg }}>{iniciais(c.nome)}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.nome}</div>
                <div className="meta">{c.whatsapp || 'Sem telefone'}</div>
              </div>
              <span className="chevron">›</span>
            </Link>
          )
        })}
      </div>
      <button className="fab" onClick={() => navigate('/cliente/novo')} aria-label="Nova cliente">+</button>
      <TabBar />
    </div>
  )
}

function saudacao() {
  const h = new Date().getHours()
  if (h < 12) return 'Bom dia'
  if (h < 18) return 'Boa tarde'
  return 'Boa noite'
}
