export default function StatTile({ label, value, tone }) {
  return (
    <div className={tone === 'lime' ? 'glass stat stat--lime' : 'glass stat'}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.3rem' }}>{value}</div>
      <div className="mono" style={{ fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.08em', opacity: .8 }}>{label}</div>
    </div>
  )
}
