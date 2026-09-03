import TabelView from '../components/TabelView'

export default function ChartFrame({ judul, caption, tabel, ariaLabel, children }) {
  return (
    <figure style={{ margin: '0 0 1.5rem' }}>
      {judul && <figcaption className="eyebrow">{judul}</figcaption>}
      <div className="glass" style={{ padding: 16 }} role="img" aria-label={ariaLabel || judul || caption}>
        {children}
      </div>
      {caption && (
        <figcaption className="mono" style={{ fontSize: '.75rem', color: 'var(--ink-muted)', marginTop: 6 }}>{caption}</figcaption>
      )}
      {tabel && (
        <details style={{ marginTop: 6 }}>
          <summary className="mono" style={{ fontSize: '.75rem', color: 'var(--ink-muted)', cursor: 'pointer' }}>Lihat sebagai tabel</summary>
          <TabelView kolom={tabel.kolom} baris={tabel.baris} />
        </details>
      )}
    </figure>
  )
}
