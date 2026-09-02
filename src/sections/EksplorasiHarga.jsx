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
      <h2>Harga {komoditas} di 9 pasar</h2>
      <p style={{ color: 'var(--ink-muted)', maxWidth: '60ch' }}>
        Data harian pasar tradisional (tingkat eceran). Pilih komoditas, pasar, dan rentang di bilah atas.
      </p>
      {CAVEAT.includes(komoditas) && (
        <p><BadgeCaveat>komoditas ini jarang dilaporkan di 1–3 pasar; sebagian data kosong</BadgeCaveat></p>
      )}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12, margin: '16px 0' }}>
        <StatTile label="Harga terakhir" value={rp(s.terakhir)} />
        <StatTile label="Terendah (periode)" value={rp(s.min)} />
        <StatTile label="Tertinggi (periode)" value={rp(s.max)} />
        <StatTile label="Median (periode)" value={rp(s.median)} />
        <StatTile label="Data kosong" value={s.kosongPct + '%'} />
      </div>
      <HargaChart />
    </>
  )
}
