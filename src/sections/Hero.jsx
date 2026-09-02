import { useData } from '../store/DataContext'
import { useFilter } from '../store/FilterContext'
import { buildEnvelope, sampel } from '../lib/series'
import { offsetToDate, formatTanggal, indexOfDate } from '../store/dates'
import ChartFrame from '../charts/ChartFrame'
import PitaKetidakpastian from '../charts/PitaKetidakpastian'
import StatTile from '../components/StatTile'

const LEBARAN = ['2025-03-31', '2026-03-21']

export default function Hero() {
  const { data: harga } = useData('harga.json')
  const { data: band } = useData('band.json')
  const { data: meta } = useData('meta.json')
  const { komoditas } = useFilter()
  if (!harga || !band || !meta) return <div style={{ minHeight: 420 }} />

  const b = band.komoditas[komoditas]?.normal
  const avg = buildEnvelope(harga.komoditas[komoditas] || {}).map((e) => e.avg)
  const rows = avg.map((v, i) => {
    if (v == null || !b) return null
    return {
      t: formatTanggal(offsetToDate(harga.tanggal_awal, i), { pendek: true }),
      p10: Math.round(v * (1 + b.p10 / 100)),
      median: Math.round(v),
      p90: Math.round(v * (1 + b.p90 / 100)),
    }
  }).filter(Boolean)
  const lebaranX = LEBARAN
    .map((d) => rows[indexOfDate(harga.tanggal_awal, d)]?.t)
    .filter(Boolean)

  return (
    <div style={{ padding: '2.5rem 0 1rem' }}>
      <p className="eyebrow">Rentang, bukan titik</p>
      <h1 style={{ fontSize: 'clamp(1.75rem, 4vw, 2.75rem)', lineHeight: 1.15, maxWidth: '20ch' }}>
        Yang bisa diprediksi dari harga sayur bukan angka pastinya, tapi seberapa lebar kemungkinannya bergerak.
      </h1>
      <ChartFrame
        caption={`Ilustrasi: garis = harga rata-rata ${komoditas}; pita = ±rentang historis 7-hari (p10–p90). Bukan prediksi bergulir.`}
        tabel={{ kolom: ['Tanggal', 'p10', 'Median', 'p90'], baris: sampel(rows, 40).map((r) => [r.t, r.p10, r.median, r.p90]) }}
      >
        <PitaKetidakpastian data={rows} kondisi="normal" tinggi={360} lebaranX={lebaranX} />
      </ChartFrame>
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <StatTile label="Komoditas" value={meta.komoditas.length} />
        <StatTile label="Pasar" value={meta.pasar.length} />
        <StatTile label="Bulan data" value={Math.round(indexOfDate(meta.tanggal_data_awal, meta.tanggal_data_terakhir) / 30)} />
      </div>
    </div>
  )
}
