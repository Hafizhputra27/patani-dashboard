import { useData } from '../store/DataContext'
import TabelView from '../components/TabelView'
import Timeline from '../components/Timeline'

export default function RingkasanRiset() {
  const { data: r } = useData('riset.json')
  if (!r) return <p className="mono">Memuat…</p>

  return (
    <>
      <p className="eyebrow">Ringkasan Riset</p>
      <h2>Delapan tahap menguji apakah model bisa memprediksi harga</h2>
      <Timeline items={r.tahapan} />
      <h3>MAE model vs baseline per horizon</h3>
      <TabelView
        kolom={['Horizon (direct)', 'MAE model', 'MAE baseline']}
        baris={r.horizon_direct.map((h) => [`H+${h.horizon}`, h.mae_model, h.mae_baseline])}
      />
      <TabelView
        kolom={['Horizon (recursive)', 'MAE model', 'MAE baseline']}
        baris={r.horizon_recursive.map((h) => [h.horizon, h.mae_model, h.mae_baseline])}
      />
      <h3>Kesimpulan</h3>
      <p style={{ maxWidth: '70ch' }}>{r.kesimpulan}</p>
    </>
  )
}
