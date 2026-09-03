import { useData } from '../store/DataContext'
import { useFilter } from '../store/FilterContext'
import BannerKejujuran from '../components/BannerKejujuran'
import PrediksiChip from '../components/PrediksiChip'
import BacktestChart from '../charts/BacktestChart'
import MaeHorizonChart from '../charts/MaeHorizonChart'
import ProyeksiBergulir from '../sections/ProyeksiBergulir'

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
    <div id="prediksi">
      <p className="eyebrow">Prediksi Model</p>
      <h2>Apa yang model ML katakan — dan seberapa akurat</h2>
      <BannerKejujuran tanggal={meta.tanggal_data_terakhir} />

      <ProyeksiBergulir />

      <h3>Backtest (uji pada data yang sudah lewat)</h3>
      <BacktestChart seri={seri} komoditas={komoditas} pasar={pasarAktif} />

      <h3>Prediksi ke depan — {komoditas}</h3>
      <div className="chip-grid">
        {meta.pasar.map((p) => <PrediksiChip key={p} row={byPasar[p]} />)}
      </div>

      <h3>Ringkasan akurasi per horizon</h3>
      <MaeHorizonChart horizonDirect={riset.horizon_direct} />

      {/* Task 11 menyisipkan <KonteksHistoris /> di sini */}
    </div>
  )
}
