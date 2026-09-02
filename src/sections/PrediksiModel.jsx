import { useData } from '../store/DataContext'
import { useFilter } from '../store/FilterContext'
import BannerKejujuran from '../components/BannerKejujuran'
import PrediksiChip from '../components/PrediksiChip'
import BacktestChart from '../charts/BacktestChart'
import MaeHorizonChart from '../charts/MaeHorizonChart'

export default function PrediksiModel() {
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
    <>
      <p className="eyebrow">Prediksi Model</p>
      <h2>Apa yang model ML katakan — dan seberapa akurat</h2>
      <BannerKejujuran tanggal={meta.tanggal_data_terakhir} />

      <h3>Backtest (uji pada data yang sudah lewat)</h3>
      <BacktestChart seri={seri} komoditas={komoditas} pasar={pasarAktif} />

      <h3>Prediksi ke depan — {komoditas}</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12, margin: '12px 0' }}>
        {meta.pasar.map((p) => <PrediksiChip key={p} row={byPasar[p]} />)}
      </div>

      <h3>Ringkasan akurasi per horizon</h3>
      <MaeHorizonChart horizonDirect={riset.horizon_direct} />
    </>
  )
}
