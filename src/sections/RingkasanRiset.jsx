import { useData } from '../store/DataContext'
import TabelView from '../components/TabelView'
import Timeline from '../components/Timeline'

export default function RingkasanRiset() {
  const { data: r } = useData('riset.json')
  if (!r) return <p className="mono">Memuat…</p>

  return (
    <>
      <p className="eyebrow">Ringkasan Riset</p>
      <h2>8 Tahap Evaluasi Model Prediksi Harga</h2>
      <p style={{ color: 'var(--ink-muted)', maxWidth: '65ch', margin: '0 0 1rem' }}>
        Perjalanan metodologi pengujian model Machine Learning terhadap baseline persistensi harga di lapangan.
      </p>
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
      <h3>Kesimpulan Riset</h3>
      <div className="panel" style={{ padding: 16, margin: '12px 0' }}>
        <p style={{ maxWidth: '75ch', margin: 0, color: 'var(--ink)' }}>{r.kesimpulan}</p>
      </div>
    </>
  )
}
