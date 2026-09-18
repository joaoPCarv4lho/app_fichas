import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './auth/AuthContext.jsx'
import Login from './pages/Login.jsx'
import PinLock from './pages/PinLock.jsx'
import Agenda from './pages/Agenda.jsx'
import AgendamentoForm from './pages/AgendamentoForm.jsx'
import AgendamentoDetail from './pages/AgendamentoDetail.jsx'
import Clientes from './pages/Clientes.jsx'
import ClienteForm from './pages/ClienteForm.jsx'
import ClienteDetail from './pages/ClienteDetail.jsx'
import AnamneseForm from './pages/AnamneseForm.jsx'
import AtendimentoForm from './pages/AtendimentoForm.jsx'
import Configuracoes from './pages/Configuracoes.jsx'
import NotConfigured from './pages/NotConfigured.jsx'

export default function App() {
  const { session, loading, locked, isSupabaseConfigured } = useAuth()

  if (!isSupabaseConfigured) return <NotConfigured />
  if (loading) return <div className="center-screen"><div className="muted">Carregando…</div></div>
  if (!session) return <Login />
  if (locked) return <PinLock />

  return (
    <Routes>
      <Route path="/" element={<Agenda />} />
      <Route path="/agendamento/novo" element={<AgendamentoForm />} />
      <Route path="/agendamento/:id" element={<AgendamentoDetail />} />
      <Route path="/agendamento/:id/editar" element={<AgendamentoForm />} />
      <Route path="/clientes" element={<Clientes />} />
      <Route path="/cliente/novo" element={<ClienteForm />} />
      <Route path="/cliente/:id" element={<ClienteDetail />} />
      <Route path="/cliente/:id/editar" element={<ClienteForm />} />
      <Route path="/cliente/:id/anamnese/:tipo" element={<AnamneseForm />} />
      <Route path="/cliente/:id/atendimento/novo" element={<AtendimentoForm />} />
      <Route path="/cliente/:id/atendimento/:atId" element={<AtendimentoForm />} />
      <Route path="/config" element={<Configuracoes />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
