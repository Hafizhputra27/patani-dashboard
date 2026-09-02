export default function StatTile({ label, value }) {
  return (
    <div className="panel" style={{ padding: '12px 14px' }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.3rem' }}>{value}</div>
      <div className="mono" style={{ fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.08em', color: 'var(--ink-muted)' }}>{label}</div>
    </div>
  )
}
