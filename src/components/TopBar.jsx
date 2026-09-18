import { useNavigate } from 'react-router-dom'

export default function TopBar({ title, back = true, action }) {
  const navigate = useNavigate()
  return (
    <div className="topbar">
      {back && (
        <button className="back" onClick={() => navigate(-1)} aria-label="Voltar">‹</button>
      )}
      <h1>{title}</h1>
      {action}
    </div>
  )
}
