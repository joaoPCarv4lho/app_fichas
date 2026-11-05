import { useRef, useEffect, useState } from 'react'

// Assinatura por toque/mouse. Ao terminar um traço, chama onChange(dataURL).
export default function SignaturePad({ value, onChange }) {
  const canvasRef = useRef(null)
  const drawing = useRef(false)
  const last = useRef(null)
  const moved = useRef(false)
  const emitido = useRef(null) // último dataURL enviado ao pai
  const [hasInk, setHasInk] = useState(Boolean(value))

  useEffect(() => {
    const canvas = canvasRef.current
    const ratio = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * ratio
    canvas.height = rect.height * ratio
    const ctx = canvas.getContext('2d')
    ctx.scale(ratio, ratio)
    ctx.lineWidth = 2.5
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.strokeStyle = '#2e2a2b'
  }, [])

  // value vindo de fora (ficha carregada depois da montagem): redesenha. O que o próprio pad emitiu não redesenha.
  useEffect(() => {
    setHasInk(Boolean(value))
    if (value === emitido.current) return
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    const rect = canvas.getBoundingClientRect()
    ctx.clearRect(0, 0, rect.width, rect.height)
    if (value) {
      const img = new Image()
      img.onload = () => ctx.drawImage(img, 0, 0, rect.width, rect.height)
      img.src = value
    }
  }, [value])

  const pos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const p = e.touches ? e.touches[0] : e
    return { x: p.clientX - rect.left, y: p.clientY - rect.top }
  }

  const start = (e) => {
    e.preventDefault()
    drawing.current = true
    moved.current = false
    last.current = pos(e)
  }
  const move = (e) => {
    if (!drawing.current) return
    e.preventDefault()
    const ctx = canvasRef.current.getContext('2d')
    const p = pos(e)
    ctx.beginPath()
    ctx.moveTo(last.current.x, last.current.y)
    ctx.lineTo(p.x, p.y)
    ctx.stroke()
    last.current = p
    moved.current = true
    setHasInk(true)
  }
  const end = () => {
    if (!drawing.current) return
    drawing.current = false
    if (!moved.current) return // toque sem traço não conta como assinatura
    emitido.current = canvasRef.current.toDataURL('image/png')
    onChange(emitido.current)
  }

  const clear = () => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setHasInk(false)
    emitido.current = null
    onChange(null)
  }

  return (
    <div>
      <div className="signature-wrap">
        <canvas
          ref={canvasRef}
          onMouseDown={start} onMouseMove={move} onMouseUp={end} onMouseLeave={end}
          onTouchStart={start} onTouchMove={move} onTouchEnd={end}
        />
      </div>
      <div className="row" style={{ marginTop: 8 }}>
        <span className="muted" style={{ fontSize: 13 }}>{hasInk ? '✓ Assinado' : 'Assine no quadro acima'}</span>
        <div className="spacer" />
        <button type="button" className="btn ghost sm" onClick={clear}>Limpar</button>
      </div>
    </div>
  )
}
