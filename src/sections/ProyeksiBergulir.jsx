import { useData } from '../store/DataContext'
import { useFilter } from '../store/FilterContext'
import { useToday, hariIniISO } from '../store/today'
import { buildEnvelope } from '../lib/series'
import { proyeksiBand, inLebaranWindow } from '../lib/proyeksi'
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
  const hariIni = hariIniISO(today)
  const r = b && anchor != null ? proyeksiBand(b, anchor, d0, hariIni) : null
  const kondisi = inLebaranWindow(hariIni) ? 'menjelang Lebaran' : 'normal'

  return (
    <>
      <h3>Estimasi hari ini — proyeksi band empiris</h3>
      {r && (
        <div className={r.kadaluarsa ? 'panel' : 'panel stat--lime'} style={{ padding: 18, margin: '12px 0' }}>
          {r.kadaluarsa && (
            <p style={{ fontWeight: 600, color: '#DC2626', margin: '0 0 8px' }}>
              Data harga sudah {r.n} hari — jalankan ulang pipeline scraping untuk proyeksi yang berarti.
            </p>
          )}
          <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 600, opacity: r.kadaluarsa ? 0.55 : 1 }}>
            {rp(r.median)}
          </div>
          <div className="mono" style={{ fontSize: '.95rem', opacity: r.kadaluarsa ? 0.55 : 1 }}>
            rentang {rp(r.p10)} – {rp(r.p90)}
          </div>
          <div className="mono" style={{ fontSize: '.8rem', color: 'var(--ink-muted)', marginTop: 6 }}>
            +{r.n} hari sejak data terakhir 22 Agu 2026 · kondisi {kondisi}
          </div>
          <p style={{ fontSize: '.8rem', color: 'var(--ink-muted)', marginTop: 8, marginBottom: 0 }}>{CAPTION}</p>
        </div>
      )}
      {!b && <p className="mono">Band tidak tersedia untuk {komoditas}.</p>}
      <ProyeksiChart />
    </>
  )
}
