import { useData } from '../store/DataContext'
import { useFilter } from '../store/FilterContext'
import { buildEnvelope, sliceRange } from '../lib/series'
import { ringkasHarga } from '../lib/stats'
import { inLebaranWindow } from '../lib/proyeksi'
import { useToday, hariIniISO } from '../store/today'
import { WalletIcon, BarChartIcon, ShieldIcon, CalendarIcon } from './Icons'

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
    if (avgEnvelope[i] != null) {
      latestAvg = avgEnvelope[i]
      break
    }
  }

  const hariIni = hariIniISO(today)
  const isLebaran = inLebaranWindow(hariIni)
  const bandAktif = band.komoditas[komoditas]?.[isLebaran ? 'dekat_lebaran' : 'normal']
    || band.komoditas[komoditas]?.normal
  const p10Val = s.terakhir && bandAktif ? Math.round(s.terakhir * (1 + bandAktif.p10 / 100)) : null
  const p90Val = s.terakhir && bandAktif ? Math.round(s.terakhir * (1 + bandAktif.p90 / 100)) : null

  return (
    <div className="overview-cards-grid">
      <div className="metric-card metric-card--purple">
        <div className="metric-card__header">
          <div className="metric-card__icon-box">
            <WalletIcon size={16} />
          </div>
          <span className="metric-card__label">Harga Terkini</span>
        </div>
        <div className="metric-card__value mono">{rp(s.terakhir)}</div>
        <div className="metric-card__meta">
          {pasar === '__semua__' ? 'Rata-rata 9 Pasar' : pasar}
        </div>
      </div>

      <div className="metric-card metric-card--blue">
        <div className="metric-card__header">
          <div className="metric-card__icon-box">
            <BarChartIcon size={16} />
          </div>
          <span className="metric-card__label">Rata-rata Kab. Bandung</span>
        </div>
        <div className="metric-card__value mono">{rp(latestAvg)}</div>
        <div className="metric-card__meta">
          {komoditas} di 9 pasar
        </div>
      </div>

      <div className="metric-card metric-card--green">
        <div className="metric-card__header">
          <div className="metric-card__icon-box">
            <ShieldIcon size={16} />
          </div>
          <span className="metric-card__label">Rentang Risiko 7 Hari</span>
        </div>
        <div className="metric-card__value metric-card__value--range mono">
          {p10Val && p90Val ? `${rp(p10Val)} – ${rp(p90Val)}` : '—'}
        </div>
        <div className="metric-card__meta">
          Estimasi batas p10 s/d p90
        </div>
      </div>

      <div className="metric-card metric-card--amber">
        <div className="metric-card__header">
          <div className="metric-card__icon-box">
            <CalendarIcon size={16} />
          </div>
          <span className="metric-card__label">Status Musiman</span>
        </div>
        <div className="metric-card__value mono" style={{ fontSize: '1.2rem', fontWeight: 600 }}>
          {isLebaran ? 'Menjelang Lebaran' : 'Kondisi Normal'}
        </div>
        <div className="metric-card__meta">
          {isLebaran ? 'Fluktuasi diperkirakan tinggi' : 'Volatilitas terpantau stabil'} · {s.kosongPct}% data kosong
        </div>
      </div>
    </div>
  )
}
