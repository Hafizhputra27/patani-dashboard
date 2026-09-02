export default function BadgeCaveat({ children }) {
  return (
    <span className="mono" style={{ display: 'inline-flex', gap: 4, alignItems: 'center', fontSize: '.7rem', color: 'var(--ink-muted)', background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: 999, padding: '2px 8px' }}>
      ⚠ {children}
    </span>
  )
}
