import { useData } from '../store/DataContext'
import TabelView from '../components/TabelView'

export default function RingkasanRiset() {
  const { data: r } = useData('riset.json')
  if (!r) return <p className="mono">Memuat…</p>

  return (
    <>
      <p className="eyebrow">Ringkasan Riset</p>
      <h2>Delapan tahap menguji apakah model bisa memprediksi harga</h2>
      <ol style={{ paddingLeft: '1.2rem' }}>
        {r.tahapan.map((s) => (
          <li key={s.n} style={{ marginBottom: 12 }}>
            <strong>{s.judul}</strong>
            <p style={{ color: 'var(--ink-muted)', margin: '2px 0 0' }}>{s.isi}</p>
          </li>
        ))}
      </ol>
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
