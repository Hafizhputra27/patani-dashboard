export function TooltipKustom({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="mono panel" style={{ padding: '8px 10px', fontSize: '.8rem' }}>
      <div style={{ color: 'var(--ink-muted)' }}>{label}</div>
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color }} />
          <span>{p.name}: {typeof p.value === 'number' ? p.value.toLocaleString('id-ID') : p.value}</span>
        </div>
      ))}
    </div>
  )
}
