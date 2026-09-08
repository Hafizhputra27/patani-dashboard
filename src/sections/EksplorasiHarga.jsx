import { useData } from '../store/DataContext'
import { useFilter } from '../store/FilterContext'
import { buildEnvelope, sliceRange } from '../lib/series'
import { ringkasHarga } from '../lib/stats'
import HargaChart from '../charts/HargaChart'
import StatTile from '../components/StatTile'
import BadgeCaveat from '../components/BadgeCaveat'

const CAVEAT = ['BAWANG MERAH BATU', 'SAYURAN KENTANG LOKAL', 'KACANG TANAH KUPAS']

export default function EksplorasiHarga() {
  const { data: harga } = useData('harga.json')
  const { komoditas, pasar, rentang } = useFilter()
  if (!harga) return <p className="mono">Memuat…</p>

  const perPasar = harga.komoditas[komoditas] || {}
  const serie = pasar === '__semua__'
    ? buildEnvelope(perPasar).map((e) => e.avg)
    : (perPasar[pasar] || [])
  const { arr } = sliceRange(serie, harga.tanggal_awal, rentang)
  const s = ringkasHarga(arr)
  const rp = (v) => (v == null ? '—' : 'Rp ' + Math.round(v).toLocaleString('id-ID'))

  return (
    <>
      <p className="eyebrow">Eksplorasi Harga</p>
      <h2>Perbandingan Harga {komoditas} di 9 Pasar</h2>
      <p style={{ color: 'var(--ink-muted)', maxWidth: '65ch', margin: '0 0 1rem' }}>
        Pantau fluktuasi harga eceran harian antar pasar tradisional. Gunakan bilah atas untuk memilih komoditas, pasar, dan rentang waktu.
      </p>
      {CAVEAT.includes(komoditas) && (
        <p><BadgeCaveat>Sebagian pasar jarang melaporkan komoditas ini sehingga terdapat data kosong</BadgeCaveat></p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, margin: '14px 0' }}>
        <StatTile label="Harga Terakhir" value={rp(s.terakhir)} />
        <StatTile label="Terendah" value={rp(s.min)} />
        <StatTile label="Tertinggi" value={rp(s.max)} />
        <StatTile label="Median" value={rp(s.median)} />
        <StatTile label="Data Kosong" value={s.kosongPct + '%'} />
      </div>
      <HargaChart />
    </>
  )
}
