import { useState } from 'react'
import { useData } from '../store/DataContext'
import { useFilter } from '../store/FilterContext'
import { formatTanggal } from '../store/dates'

const rp = (v) => (v == null ? '—' : 'Rp ' + Math.round(v).toLocaleString('id-ID'))

const CABAI_LIST = [
  'CABE MERAH KERITING',
  'CABE RAWIT MERAH',
  'CABE RAWIT HIJAU',
  'CABE MERAH TANJUNG',
  'CABE HIJAU BIASA',
]

export default function PrediksiHorizonWidget() {
  const { data: pred } = useData('prediksi.json')
  const { data: meta } = useData('meta.json')
  const { data: band } = useData('band.json')
  const { komoditas, setKomoditas, pasar } = useFilter()
  const [horizon, setHorizon] = useState('h3') // 'h1', 'h3', 'h7'

  if (!pred || !meta || !band) return null

  const pasarAktif = pasar === '__semua__' ? meta.pasar[0] : pasar
  const row = pred.baris.find((r) => r.komoditas === komoditas && r.pasar === pasarAktif)
  const b = band.komoditas[komoditas]?.normal

  const targetDate = row ? (horizon === 'h1' ? row.tanggal_target_h1 : horizon === 'h3' ? row.tanggal_target_h3 : row.tanggal_target_h7) : null
  const predModel = row ? (horizon === 'h1' ? row.pred_model_h1 : horizon === 'h3' ? row.pred_model_h3 : row.pred_model_h7) : null
  const predBaseline = row ? (horizon === 'h1' ? row.pred_baseline_h1 : horizon === 'h3' ? row.pred_baseline_h3 : row.pred_baseline_h7) : null
  const hargaSekarang = row?.harga_terakhir

  // Hitung persentase kenaikan/penurunan estimasi vs harga sekarang
  const deltaPct = predModel && hargaSekarang ? (((predModel - hargaSekarang) / hargaSekarang) * 100).toFixed(1) : 0
  const isNaik = Number(deltaPct) > 1.5
  const isTurun = Number(deltaPct) < -1.5

  // Rentang kemungkinan p10 - p90
  const p10Val = hargaSekarang && b ? Math.round(hargaSekarang * (1 + b.p10 / 100)) : null
  const p90Val = hargaSekarang && b ? Math.round(hargaSekarang * (1 + b.p90 / 100)) : null

  return (
    <div className="card forecast-widget">
      <div className="card__header">
        <div>
          <div className="eyebrow" style={{ color: '#7C3AED' }}>Kalkulator &amp; Estimasi Cepat</div>
          <h3 className="card__title">Prediksi Harga {horizon === 'h3' ? '3 Hari' : horizon === 'h7' ? '7 Hari' : 'Besok'}</h3>
          <p className="card__subtitle">{komoditas} di {pasarAktif}</p>
        </div>

        {/* Horizon Pill Switcher */}
        <div className="horizon-pills">
          <button
            type="button"
            className={`horizon-pill ${horizon === 'h1' ? 'horizon-pill--active' : ''}`}
            onClick={() => setHorizon('h1')}
          >
            Besok (H+1)
          </button>
          <button
            type="button"
            className={`horizon-pill ${horizon === 'h3' ? 'horizon-pill--active' : ''}`}
            onClick={() => setHorizon('h3')}
          >
            3 Hari (H+3)
          </button>
          <button
            type="button"
            className={`horizon-pill ${horizon === 'h7' ? 'horizon-pill--active' : ''}`}
            onClick={() => setHorizon('h7')}
          >
            7 Hari (H+7)
          </button>
        </div>
      </div>

      {/* Quick Cabai Switcher Pills */}
      <div className="quick-commodity-row">
        <span className="mono" style={{ fontSize: '.75rem', color: 'var(--ink-muted)', alignSelf: 'center' }}>Pilih Cabai:</span>
        {CABAI_LIST.map((c) => (
          <button
            key={c}
            type="button"
            className={`quick-pill ${komoditas === c ? 'quick-pill--active' : ''}`}
            onClick={() => setKomoditas(c)}
          >
            {c.replace('CABE ', '')}
          </button>
        ))}
      </div>

      {/* Main Forecast Result Card */}
      {row ? (
        <div className="forecast-result-card">
          <div className="forecast-result-card__top">
            <div>
              <div className="mono" style={{ fontSize: '.8rem', color: 'var(--ink-muted)' }}>
                Target Tanggal: <strong>{targetDate ? formatTanggal(targetDate) : '—'}</strong>
              </div>
              <div className="forecast-price mono">
                {rp(predModel)}
                <span className={`forecast-badge ${isNaik ? 'forecast-badge--up' : isTurun ? 'forecast-badge--down' : 'forecast-badge--flat'}`}>
                  {Number(deltaPct) > 0 ? `+${deltaPct}%` : `${deltaPct}%`}
                </span>
              </div>
            </div>
            <div className="forecast-baseline mono">
              <div style={{ fontSize: '.75rem', color: 'var(--ink-muted)' }}>Harga Saat Ini (Baseline):</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 600 }}>{rp(hargaSekarang)}</div>
            </div>
          </div>

          <div className="forecast-range-box mono">
            <span>Estimasi Rentang Risiko (p10 – p90):</span>
            <strong>{p10Val && p90Val ? `${rp(p10Val)} – ${rp(p90Val)}` : '—'}</strong>
          </div>

          <div className={`forecast-advice ${isNaik ? 'forecast-advice--up' : isTurun ? 'forecast-advice--down' : 'forecast-advice--flat'}`}>
            <span style={{ fontSize: '1.2rem' }}>{isNaik ? '💡' : isTurun ? '⚡' : '📌'}</span>
            <div>
              <strong>
                {isNaik
                  ? `Harga diperkirakan berpotensi NAIK dalam ${horizon === 'h3' ? '3 hari' : horizon === 'h7' ? '7 hari' : '1 hari'}.`
                  : isTurun
                    ? `Harga diperkirakan berpotensi TURUN dalam ${horizon === 'h3' ? '3 hari' : horizon === 'h7' ? '7 hari' : '1 hari'}.`
                    : 'Harga diperkirakan RELATIF STABIL dalam rentang normal.'}
              </strong>
              <div style={{ fontSize: '.8rem', marginTop: 2, opacity: 0.9 }}>
                {isNaik
                  ? 'Pertimbangkan menahan stok / menunggu waktu jual yang optimal.'
                  : isTurun
                    ? 'Pertimbangkan menjual stok sekarang untuk menghindari potensi penurunan harga.'
                    : 'Waktu penjualan cukup fleksibel sesuai ketersediaan panen.'}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="forecast-empty-box">
          <p className="mono">Data prediksi tidak tersedia untuk kombinasi komoditas dan pasar ini.</p>
        </div>
      )}
    </div>
  )
}
