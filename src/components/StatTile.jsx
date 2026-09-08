export default function StatTile({ label, value, tone }) {
  return (
    <div className={tone === 'lime' ? 'panel stat stat--lime' : 'panel stat'}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.35rem', color: 'var(--ink)' }}>
        {value}
      </div>
      <div className="mono" style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--ink-muted)', marginTop: 2 }}>
        {label}
      </div>
    </div>
  )
}
