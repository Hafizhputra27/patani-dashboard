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
      <h2>Kondisi lingkungan</h2>
      <p style={{ color: 'var(--ink-muted)', maxWidth: '60ch' }}>
        {pasar === '__semua__' && `Menampilkan ${p} (pilih pasar spesifik di bilah atas). `}
        Fitur cuaca &amp; kurs <strong>tidak menambah akurasi prediksi harga</strong> di horizon yang diuji — lihat Ringkasan Riset.
      </p>
      <CurahHujanChart pasar={p} />
      <SuhuChart pasar={p} />
      <KursChart />
    </>
  )
}
