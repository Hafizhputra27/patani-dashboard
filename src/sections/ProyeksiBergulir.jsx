import { useData } from '../store/DataContext'
import { useFilter } from '../store/FilterContext'
import { useToday } from '../store/today'
import { buildEnvelope } from '../lib/series'
import { proyeksiBand, inLebaranWindow } from '../lib/proyeksi'
import Glass from '../components/Glass'
import ProyeksiChart from '../charts/ProyeksiChart'

const rp = (v) => 'Rp ' + Math.round(v).toLocaleString('id-ID')
const CAPTION = 'Proyeksi dari distribusi historis pergerakan harga 7-hari, bukan prediksi bergulir model ML. Data harga aktual berakhir 22 Agu 2026 — makin jauh dari tanggal itu, rentang makin lebar.'

export default function ProyeksiBergulir() {
  const { data: harga } = useData('harga.json')
  const { data: band } = useData('band.json')
  const { data: meta } = useData('meta.json')
  const { komoditas, pasar } = useFilter()
  const today = useToday()
  if (!harga || !band || !meta) return <p className="mono">Memuat…</p>

  const b = band.komoditas[komoditas]
  const perPasar = harga.komoditas[komoditas] || {}
  const serie = pasar === '__semua__' ? buildEnvelope(perPasar).map((e) => e.avg) : (perPasar[pasar] || [])
  let anchor = null
  for (let i = serie.length - 1; i >= 0; i--) { if (serie[i] != null) { anchor = serie[i]; break } }
  const d0 = meta.tanggal_data_terakhir
  const r = b && anchor != null ? proyeksiBand(b, anchor, d0, today) : null
  const kondisi = inLebaranWindow(today) ? 'menjelang Lebaran' : 'normal'

  return (
    <>
      <h3>Estimasi hari ini — proyeksi band empiris</h3>
      {r && (
        <Glass tone={r.kadaluarsa ? 'dark' : 'lime'} style={{ padding: 20, margin: '12px 0' }}>
          {r.kadaluarsa && (
            <p style={{ fontWeight: 600, margin: '0 0 8px' }}>
              Data harga sudah {r.n} hari — jalankan ulang pipeline scraping untuk proyeksi yang berarti.
            </p>
          )}
          <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 600, opacity: r.kadaluarsa ? 0.55 : 1 }}>{rp(r.median)}</div>
          <div className="mono" style={{ opacity: r.kadaluarsa ? 0.55 : 1 }}>rentang {rp(r.p10)} – {rp(r.p90)}</div>
          <div className="mono" style={{ fontSize: '.8rem', marginTop: 6 }}>
            +{r.n} hari sejak data terakhir 22 Agu 2026 · kondisi {kondisi}
          </div>
          <p style={{ fontSize: '.8rem', marginTop: 8 }}>{CAPTION}</p>
        </Glass>
      )}
      {!b && <p className="mono">Band tidak tersedia untuk {komoditas}.</p>}
      <ProyeksiChart />
    </>
  )
}
