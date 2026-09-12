import { useData } from '../store/DataContext'
import { useFilter } from '../store/FilterContext'
import BannerKejujuran from '../components/BannerKejujuran'
import PrediksiChip from '../components/PrediksiChip'
import PrediksiHorizonWidget from '../components/PrediksiHorizonWidget'
import BacktestChart from '../charts/BacktestChart'
import MaeHorizonChart from '../charts/MaeHorizonChart'
import ProyeksiBergulir from '../sections/ProyeksiBergulir'
import KonteksHistoris from '../sections/KonteksHistoris'

export default function Prediksi() {
  const { data: pred } = useData('prediksi.json')
  const { data: backtest } = useData('backtest.json')
  const { data: riset } = useData('riset.json')
  const { data: meta } = useData('meta.json')
  const { komoditas, pasar } = useFilter()
  if (!pred || !backtest || !riset || !meta) return <p className="mono">Memuat…</p>

  const barisKom = pred.baris.filter((r) => r.komoditas === komoditas)
  const byPasar = Object.fromEntries(barisKom.map((r) => [r.pasar, r]))
  const pasarAktif = pasar === '__semua__' ? meta.pasar[0] : pasar
  const seri = backtest.komoditas[komoditas]?.[pasarAktif]

  return (
    <div id="prediksi" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div>
        <p className="eyebrow">Evaluasi Model ML</p>
        <h2>Akurasi Prediksi Machine Learning</h2>
        <BannerKejujuran tanggal={meta.tanggal_data_terakhir} />
      </div>

      {/* Interactive 3-Day & 7-Day Forecast Feature */}
      <PrediksiHorizonWidget />

      <ProyeksiBergulir />

      <div className="card">
        <h3>Backtest (uji pada data yang sudah lewat)</h3>
        <p className="card__subtitle" style={{ marginBottom: 12 }}>Evaluasi performa model vs baseline naif pada 60 hari data uji</p>
        <BacktestChart seri={seri} komoditas={komoditas} pasar={pasarAktif} />
      </div>

      <div className="card">
        <h3>Prediksi ke depan — {komoditas}</h3>
        <p className="card__subtitle" style={{ marginBottom: 12 }}>Kartu prediksi H+1, H+3, dan H+7 per pasar tradisional</p>
        <div className="chip-grid">
          {meta.pasar.map((p) => <PrediksiChip key={p} row={byPasar[p]} />)}
        </div>
      </div>

      <div className="card">
        <h3>Ringkasan akurasi per horizon</h3>
        <MaeHorizonChart horizonDirect={riset.horizon_direct} />
      </div>

      <KonteksHistoris />
    </div>
  )
}
