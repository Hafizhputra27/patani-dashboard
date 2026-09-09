import { useData } from '../store/DataContext'
import { useFilter } from '../store/FilterContext'
import { buildEnvelope, sliceRange } from '../lib/series'
import { ringkasHarga } from '../lib/stats'
import { inLebaranWindow } from '../lib/proyeksi'
import { useToday, hariIniISO } from '../store/today'

const rp = (v) => (v == null ? '—' : 'Rp ' + Math.round(v).toLocaleString('id-ID'))

export default function OverviewMetricCards() {
  const { data: harga } = useData('harga.json')
  const { data: band } = useData('band.json')
  const { komoditas, pasar, rentang } = useFilter()
  const today = useToday()

  if (!harga || !band) return null

  const perPasar = harga.komoditas[komoditas] || {}
  const serie = pasar === '__semua__'
    ? buildEnvelope(perPasar).map((e) => e.avg)
    : (perPasar[pasar] || [])
  const { arr } = sliceRange(serie, harga.tanggal_awal, rentang)
  const s = ringkasHarga(arr)

  const avgEnvelope = buildEnvelope(perPasar).map((e) => e.avg)
  let latestAvg = null
  for (let i = avgEnvelope.length - 1; i >= 0; i--) {
    if (avgEnvelope[i] != null) { latestAvg = avgEnvelope[i]; break }
  }

  const hariIni = hariIniISO(today)
  const isLebaran = inLebaranWindow(hariIni)
  const b = band.komoditas[komoditas]?.[isLebaran ? 'dekat_lebaran' : 'normal'] || band.komoditas[komoditas]?.normal

  const p10Val = s.terakhir && b ? Math.round(s.terakhir * (1 + b.p10 / 100)) : null
  const p90Val = s.terakhir && b ? Math.round(s.terakhir * (1 + b.p90 / 100)) : null

  return (
    <div className="overview-cards-grid">
      {/* Card 1: Harga Terkini (Pastel Purple) */}
      <div className="metric-card metric-card--purple">
        <div className="metric-card__header">
          <div className="metric-card__icon">💰</div>
          <span className="metric-card__label">Harga Terkini</span>
        </div>
        <div className="metric-card__value mono">{rp(s.terakhir)}</div>
        <div className="metric-card__meta">
          <span>{pasar === '__semua__' ? 'Rata-rata 9 Pasar' : pasar}</span>
        </div>
      </div>

      {/* Card 2: Rata-rata 9 Pasar (Pastel Blue) */}
      <div className="metric-card metric-card--blue">
        <div className="metric-card__header">
          <div className="metric-card__icon">📊</div>
          <span className="metric-card__label">Rata-Rata Kab. Bandung</span>
        </div>
        <div className="metric-card__value mono">{rp(latestAvg)}</div>
        <div className="metric-card__meta">
          <span>{komoditas} di 9 Pasar</span>
        </div>
      </div>

      {/* Card 3: Rentang Risiko 7 Hari (Pastel Green) */}
      <div className="metric-card metric-card--green">
        <div className="metric-card__header">
          <div className="metric-card__icon">🛡️</div>
          <span className="metric-card__label">Rentang Risiko 7 Hari</span>
        </div>
        <div className="metric-card__value metric-card__value--range mono">
          {p10Val && p90Val ? `${rp(p10Val)} – ${rp(p90Val)}` : '—'}
        </div>
        <div className="metric-card__meta">
          <span>Estimasi batas p10 s/d p90</span>
        </div>
      </div>

      {/* Card 4: Status Musiman (Pastel Amber) */}
      <div className="metric-card metric-card--amber">
        <div className="metric-card__header">
          <div className="metric-card__icon">🗓️</div>
          <span className="metric-card__label">Status Musiman</span>
        </div>
        <div className="metric-card__value mono" style={{ fontSize: '1.2rem', fontWeight: 600 }}>
          {isLebaran ? 'Menjelang Lebaran' : 'Kondisi Normal'}
        </div>
        <div className="metric-card__meta">
          <span>{isLebaran ? 'Fluktuasi diperkirakan tinggi' : 'Volatilitas terpantau stabil'}</span>
        </div>
      </div>
    </div>
  )
}
