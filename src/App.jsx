import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './auth/AuthContext.jsx'
import Login from './pages/Login.jsx'
import PinLock from './pages/PinLock.jsx'
import Agenda from './pages/Agenda.jsx'
import Clientes from './pages/Clientes.jsx'
import NotConfigured from './pages/NotConfigured.jsx'
import { SkeletonDetail } from './components/Skeleton.jsx'

// Telas pesadas/raras viram chunks separados (entram no precache do SW, então funcionam offline).
// Falha ao baixar um chunk rejeita o import, o React lança no render e o ErrorBoundary mostra "Recarregar".
const AgendamentoForm = lazy(() => import('./pages/AgendamentoForm.jsx'))
const AgendamentoDetail = lazy(() => import('./pages/AgendamentoDetail.jsx'))
const ClienteForm = lazy(() => import('./pages/ClienteForm.jsx'))
const ClienteDetail = lazy(() => import('./pages/ClienteDetail.jsx'))
const AnamneseForm = lazy(() => import('./pages/AnamneseForm.jsx'))
const AtendimentoForm = lazy(() => import('./pages/AtendimentoForm.jsx'))
const Configuracoes = lazy(() => import('./pages/Configuracoes.jsx'))

export default function App() {
  const { session, loading, locked, isSupabaseConfigured } = useAuth()

  if (!isSupabaseConfigured) return <NotConfigured />
  if (loading) return <div className="center-screen"><div className="muted">Carregando…</div></div>
  if (!session) return <Login />
  if (locked) return <PinLock />

  return (
    <Suspense fallback={<div className="app"><div className="content"><SkeletonDetail /></div></div>}>
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
    </Suspense>
  )
}
