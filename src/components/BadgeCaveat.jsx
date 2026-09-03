export default function BadgeCaveat({ children }) {
  return (
    <span className="mono glass" style={{ display: 'inline-flex', gap: 4, alignItems: 'center', fontSize: '.7rem', color: 'var(--ink-muted)', borderRadius: 999, padding: '2px 10px' }}>
      ⚠ {children}
    </span>
  )
}
