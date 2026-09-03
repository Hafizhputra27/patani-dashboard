import { useData } from '../store/DataContext'
import { useFilter } from '../store/FilterContext'

const RENTANG = [['3bln', '3 bulan'], ['1thn', '1 tahun'], ['2thn', '2 tahun']]

export default function Selector({ kind }) {
  const { data: meta } = useData('meta.json')
  const f = useFilter()
  if (!meta) return null

  let opts, value, onChange, label
  if (kind === 'komoditas') {
    opts = meta.komoditas.map((k) => [k.nama, k.nama + (k.caveat_data ? ' ⚠' : '')])
    value = f.komoditas; onChange = f.setKomoditas; label = 'Komoditas'
  } else if (kind === 'pasar') {
    opts = [['__semua__', 'Rentang 9 pasar'], ...meta.pasar.map((p) => [p, p])]
    value = f.pasar; onChange = f.setPasar; label = 'Pasar'
  } else {
    opts = RENTANG; value = f.rentang; onChange = f.setRentang; label = 'Rentang waktu'
  }

  return (
    <label className="mono" style={{ display: 'inline-flex', flexDirection: 'column', fontSize: '.7rem', color: 'var(--ink-muted)' }}>
      {label}
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={{ fontFamily: 'var(--font-body)', fontSize: '.9rem', color: 'var(--ink)', background: 'var(--glass)', border: '1px solid var(--glass-brd)', borderRadius: 8, padding: '6px 8px', marginTop: 2 }}
      >
        {opts.map(([v, t]) => <option key={v} value={v}>{t}</option>)}
      </select>
    </label>
  )
}
