import { useState } from 'react'
import Glass from './Glass'
import { usePrefersReducedMotion } from '../store/ThemeContext'

export default function Timeline({ items }) {
  const [aktif, setAktif] = useState(0)
  const reduced = usePrefersReducedMotion()
  if (!items?.length) return null
  const go = (i) => setAktif(Math.max(0, Math.min(items.length - 1, i)))
  const slots = [[aktif - 1, 'pale'], [aktif, 'lime'], [aktif + 1, 'dark']]

  return (
    <div className={reduced ? 'timeline no-motion' : 'timeline'}>
      <div className="timeline-rail">
        {items.map((it, i) => (
          <button
            key={it.n ?? i}
            type="button"
            className={i === aktif ? 'timeline-node is-active' : 'timeline-node'}
            aria-label={`Tahap ${it.n ?? i + 1}: ${it.judul}`}
            aria-current={i === aktif ? 'step' : undefined}
            onClick={() => go(i)}
          />
        ))}
      </div>
      <div className="timeline-cards">
        {slots.map(([idx, tone]) => (
          items[idx]
            ? (
              <Glass key={tone} tone={tone} className="timeline-card" style={{ padding: 16 }}>
                <p className="eyebrow">Tahap {items[idx].n ?? idx + 1}</p>
                <strong>{items[idx].judul}</strong>
                <p style={{ margin: '4px 0 0' }}>{items[idx].isi}</p>
              </Glass>
            )
            : <div key={tone} className="timeline-card timeline-card--empty" aria-hidden="true" />
        ))}
      </div>
      <Glass tone="lime" className="timeline-scrubber">
        <button type="button" aria-label="Tahap sebelumnya" onClick={() => go(aktif - 1)} disabled={aktif === 0}>←</button>
        <div className="timeline-ticks" aria-hidden="true">
          {items.map((_, i) => <span key={i} className={i === aktif ? 'is-active' : undefined} />)}
        </div>
        <button type="button" aria-label="Tahap berikutnya" onClick={() => go(aktif + 1)} disabled={aktif === items.length - 1}>→</button>
      </Glass>
    </div>
  )
}
