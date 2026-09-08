import { useState } from 'react'
import { useData } from '../store/DataContext'
import { useFilter } from '../store/FilterContext'
import { rekomendasiBand } from '../lib/rekomendasi'
import BandKomoditasChart from '../charts/BandKomoditasChart'

const rp = (v) => 'Rp ' + Math.round(v).toLocaleString('id-ID')

export default function RekomendasiBand() {
  const { data: band } = useData('band.json')
  const { komoditas } = useFilter()
  const [harga, setHarga] = useState(35000)
  const [lebaran, setLebaran] = useState(false)
  if (!band) return <p className="mono">Memuat…</p>

  const kondisi = lebaran ? 'dekat_lebaran' : 'normal'
  const b = band.komoditas[komoditas]?.[kondisi]
  const r = b && harga ? rekomendasiBand(b, Number(harga), kondisi) : null

  return (
    <>
      <p className="eyebrow">Rekomendasi &amp; Risiko</p>
      <h2>Estimasi Rentang Harga 7 Hari</h2>
      <p style={{ color: 'var(--ink-muted)', maxWidth: '65ch', margin: '0 0 1rem' }}>
        Kalkulator estimasi pergerakan harga 7 hari berdasarkan distribusi data historis (kondisi normal vs menjelang Lebaran).
      </p>

      <div className="panel" style={{ padding: 18, margin: '16px 0', maxWidth: 480 }}>
        <label className="mono" style={{ display: 'block', fontSize: '.82rem', fontWeight: 500, color: 'var(--ink)' }}>
          Harga {komoditas} saat ini (Rp)
          <input
            type="number"
            value={harga}
            onChange={(e) => setHarga(e.target.value)}
            aria-label={`harga ${komoditas} sekarang`}
            style={{
              display: 'block',
              marginTop: 6,
              fontFamily: 'var(--font-mono)',
              fontSize: '1.05rem',
              padding: '8px 12px',
              width: 200,
              background: 'var(--surface-2)',
              color: 'var(--ink)',
              border: '1px solid var(--line)',
              borderRadius: 8,
              outline: 'none',
            }}
          />
        </label>
        <label className="mono" style={{ display: 'flex', gap: 8, alignItems: 'center', marginTop: 12, fontSize: '.85rem', color: 'var(--ink-muted)', cursor: 'pointer' }}>
          <input type="checkbox" checked={lebaran} onChange={(e) => setLebaran(e.target.checked)} aria-label="kondisi menjelang Lebaran" />
          Kondisi Menjelang Lebaran (H-21 s/d H+7)
        </label>
        {r && (
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.25rem', color: 'var(--ink)' }}>
              {rp(r.rentang[0])} – {rp(r.rentang[1])}
            </div>
            <div className="mono" style={{ fontSize: '.82rem', color: 'var(--ink-muted)', marginTop: 2 }}>
              Median {rp(r.median)} · {r.arah}
            </div>
            <p style={{ fontSize: '.88rem', margin: '8px 0 4px', color: 'var(--ink)' }}>
              <strong>Karakteristik:</strong> {r.ketidakpastian}
            </p>
            <p style={{ fontSize: '.88rem', margin: '0 0 6px', color: 'var(--ink)' }}>
              <strong>Saran:</strong> {r.saran}
            </p>
            {r.peringatanSampel && (
              <p className="mono" style={{ fontSize: '.75rem', color: '#B45309', background: '#FEF3C7', padding: '6px 10px', borderRadius: 6, marginTop: 8 }}>
                {r.peringatanSampel}
              </p>
            )}
          </div>
        )}
        {!b && <p className="mono" style={{ fontSize: '.8rem', color: 'var(--ink-muted)' }}>Band untuk komoditas ini tidak tersedia.</p>}
      </div>

      <BandKomoditasChart band={band} />
    </>
  )
}
