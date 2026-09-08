export default function BadgeCaveat({ children }) {
  return (
    <span className="mono panel" style={{ display: 'inline-flex', gap: 6, alignItems: 'center', fontSize: '.72rem', color: '#B45309', background: '#FEF3C7', borderColor: '#FDE68A', borderRadius: 6, padding: '3px 8px' }}>
      ⚠ {children}
    </span>
  )
}
