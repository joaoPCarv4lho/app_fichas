export function SkeletonList({ rows = 4 }) {
  return (
    <div aria-hidden="true">
      {Array.from({ length: rows }).map((_, i) => <div key={i} className="sk sk-card" />)}
    </div>
  )
}

export function SkeletonDetail() {
  return (
    <div aria-hidden="true">
      <div className="sk sk-card" style={{ height: 96 }} />
      <div className="sk sk-line" style={{ width: '40%', margin: '24px 6px 12px' }} />
      <div className="sk sk-card" style={{ height: 92 }} />
      <div className="sk sk-card" style={{ height: 92 }} />
    </div>
  )
}
