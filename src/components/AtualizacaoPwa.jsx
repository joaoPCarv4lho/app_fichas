import { useEffect, useState } from 'react'
import { precisaAtualizar, onChange, dispensar, atualizarAgora } from '../lib/pwa.js'

// Aviso fixo no TOPO: a .actionbar e a .tabbar ficam no rodapé, então nunca são cobertas.
export default function AtualizacaoPwa() {
  const [, forcar] = useState(0)
  useEffect(() => onChange(() => forcar((n) => n + 1)), [])
  if (!precisaAtualizar()) return null
  return (
    <div className="pwa-update" role="status">
      <span>Nova versão disponível. Salve o que estiver aberto antes de atualizar.</span>
      <button type="button" className="btn sm" onClick={atualizarAgora}>Atualizar agora</button>
      <button type="button" className="btn ghost sm" onClick={dispensar}>Depois</button>
    </div>
  )
}
