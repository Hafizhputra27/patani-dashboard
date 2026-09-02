const fmt = (v) => (typeof v === 'number' ? v.toLocaleString('id-ID') : v)

export default function TabelView({ kolom, baris }) {
  return (
    <div style={{ overflowX: 'auto' }}>
      <table className="mono" style={{ borderCollapse: 'collapse', fontSize: '.8rem', width: '100%' }}>
        <thead>
          <tr>
            {kolom.map((k) => (
              <th key={k} style={{ textAlign: 'right', padding: '4px 8px', background: 'var(--surface-2)', borderBottom: '1px solid var(--line)' }}>{k}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {baris.map((r, i) => (
            <tr key={i} style={{ background: i % 2 ? 'var(--surface-2)' : 'transparent' }}>
              {r.map((c, j) => (
                <td key={j} style={{ textAlign: 'right', padding: '4px 8px' }}>{fmt(c)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
