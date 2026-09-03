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
      <p className="eyebrow">Rekomendasi</p>
      <h2>Rentang harga 7 hari ke depan — bukan prediksi titik</h2>
      <p style={{ color: 'var(--ink-muted)', maxWidth: '60ch' }}>
        Dari distribusi historis pergerakan harga (bukan model ML). Yang berubah menjelang Lebaran
        adalah <em>lebar rentang</em>, bukan titik tengahnya.
      </p>

      <div className="glass" style={{ padding: 16, margin: '16px 0', maxWidth: 460 }}>
        <label className="mono" style={{ display: 'block', fontSize: '.8rem' }}>
          Harga {komoditas} sekarang (Rp)
          <input
            type="number"
            value={harga}
            onChange={(e) => setHarga(e.target.value)}
            aria-label={`harga ${komoditas} sekarang`}
            style={{ display: 'block', marginTop: 4, fontFamily: 'var(--font-mono)', fontSize: '1rem', padding: '6px 8px', width: 180, background: 'var(--glass)', color: 'var(--ink)', border: '1px solid var(--glass-brd)', borderRadius: 8 }}
          />
        </label>
        <label className="mono" style={{ display: 'flex', gap: 6, alignItems: 'center', marginTop: 10, fontSize: '.85rem' }}>
          <input type="checkbox" checked={lebaran} onChange={(e) => setLebaran(e.target.checked)} aria-label="kondisi menjelang Lebaran" />
          Menjelang Lebaran (H-21 s/d H+7)
        </label>
        {r && (
          <div style={{ marginTop: 12 }}>
            <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.1rem' }}>
              {rp(r.rentang[0])} – {rp(r.rentang[1])}
            </div>
            <div className="mono" style={{ fontSize: '.8rem', color: 'var(--ink-muted)' }}>median {rp(r.median)} · {r.arah}</div>
            <p style={{ fontSize: '.9rem', marginTop: 6 }}>{r.ketidakpastian}</p>
            <p style={{ fontSize: '.9rem' }}>{r.saran}</p>
            {r.peringatanSampel && <p className="mono" style={{ fontSize: '.75rem', color: 'var(--ink-muted)' }}>{r.peringatanSampel}</p>}
          </div>
        )}
        {!b && <p className="mono" style={{ fontSize: '.8rem', color: 'var(--ink-muted)' }}>Band untuk komoditas ini tidak tersedia.</p>}
      </div>

      <BandKomoditasChart band={band} />
    </>
  )
}
