import { useEffect, useState } from 'react'
import { canInstall, isIOS, isStandalone, onChange, promptInstall } from '../lib/install.js'

export default function InstallCard() {
  const [instalavel, setInstalavel] = useState(canInstall())
  useEffect(() => onChange(() => setInstalavel(canInstall())), [])

  if (isStandalone) {
    return (
      <div className="card">
        <div className="row">
          <span style={{ fontSize: 24 }}>✅</span>
          <div>
            <strong>App instalado</strong>
            <div className="meta">Você já está usando o app instalado neste aparelho.</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <p style={{ marginTop: 0, fontWeight: 600 }}>📲 Instalar como app</p>
      {instalavel ? (
        <>
          <p className="meta" style={{ marginTop: 0 }}>Coloca o ícone na tela inicial e abre em tela cheia, igual a um app.</p>
          <button className="btn" onClick={promptInstall}>Instalar aplicativo</button>
        </>
      ) : isIOS ? (
        <p className="meta" style={{ marginTop: 0 }}>
          No iPhone (Safari): toque em <strong>Compartilhar</strong> (o quadrado com a seta ⬆️) na barra de baixo → role e toque em <strong>Adicionar à Tela de Início</strong>.
        </p>
      ) : (
        <p className="meta" style={{ marginTop: 0 }}>
          No celular: <strong>Android</strong> → menu <strong>⋮</strong> do Chrome → <strong>Adicionar à tela de início</strong>. <strong>iPhone</strong> → Safari → <strong>Compartilhar</strong> → <strong>Adicionar à Tela de Início</strong>.
        </p>
      )}
    </div>
  )
}
