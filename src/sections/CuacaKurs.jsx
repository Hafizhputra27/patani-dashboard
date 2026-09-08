import { useData } from '../store/DataContext'
import { useFilter } from '../store/FilterContext'
import CurahHujanChart from '../charts/CurahHujanChart'
import SuhuChart from '../charts/SuhuChart'
import KursChart from '../charts/KursChart'

export default function CuacaKurs() {
  const { data: meta } = useData('meta.json')
  const { pasar } = useFilter()
  if (!meta) return <p className="mono">Memuat…</p>
  const p = pasar === '__semua__' ? meta.pasar[0] : pasar

  return (
    <>
      <p className="eyebrow">Cuaca &amp; Kurs</p>
      <h2>Kondisi Lingkungan &amp; Ekonomi</h2>
      <p style={{ color: 'var(--ink-muted)', maxWidth: '65ch', margin: '0 0 1rem' }}>
        {pasar === '__semua__' && `Menampilkan data untuk ${p}. `}
        Informasi curah hujan, temperatur pasar, dan kurs USD/IDR sebagai faktor pelengkap.
      </p>
      <CurahHujanChart pasar={p} />
      <SuhuChart pasar={p} />
      <KursChart />
    </>
  )
}
