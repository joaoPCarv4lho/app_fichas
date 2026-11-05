import { useRef, useState } from 'react'
import { compressImage } from '../lib/image.js'

// photos: array de { key, momento: 'antes'|'depois', preview, blob?, path? }
// onChange(novoArray). Fotos novas trazem "blob" (pra upload); as já salvas
// trazem "path" e "preview" (URL assinada; nulo se ela falhou).
export default function PhotoCapture({ photos, onChange }) {
  const inputRef = useRef(null)
  const [momento, setMomento] = useState('antes')
  const [busy, setBusy] = useState(false)

  const pick = (m) => { setMomento(m); inputRef.current?.click() }

  const onFiles = async (e) => {
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (!files.length) return
    setBusy(true)
    try {
      const novos = []
      for (const f of files) {
        const { blob, dataUrl } = await compressImage(f)
        novos.push({ key: crypto.randomUUID(), momento, preview: dataUrl, blob })
      }
      onChange([...photos, ...novos])
    } finally {
      setBusy(false)
    }
  }

  const remove = (key) => onChange(photos.filter((p) => p.key !== key))

  return (
    <div>
      <input ref={inputRef} type="file" accept="image/*" capture="environment" multiple hidden onChange={onFiles} />
      <div className="row" style={{ marginBottom: 10 }}>
        <button type="button" className="btn secondary sm" disabled={busy} onClick={() => pick('antes')}>📷 Antes</button>
        <button type="button" className="btn secondary sm" disabled={busy} onClick={() => pick('depois')}>📷 Depois</button>
        {busy && <span className="muted" style={{ fontSize: 13 }}>Processando…</span>}
      </div>
      {photos.length > 0 && (
        <div className="photo-grid">
          {photos.map((p) => (
            <div className="ph" key={p.key}>
              {p.preview
                ? <img src={p.preview} alt={p.momento} />
                : <div className="muted" style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', fontSize: 12, padding: 6 }}>Foto indisponível agora</div>}
              <span className="tag">{p.momento}</span>
              <button type="button" className="rm" onClick={() => remove(p.key)}>×</button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
