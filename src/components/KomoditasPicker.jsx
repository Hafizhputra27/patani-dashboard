import { useState } from 'react'
import { useData } from '../store/DataContext'
import { useFilter } from '../store/FilterContext'
import Glass from './Glass'

const KATEGORI = ['bawang', 'cabai', 'sayuran', 'umbi', 'kacang', 'buah']
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function KomoditasPicker() {
  const { data: meta } = useData('meta.json')
  const { komoditas, setKomoditas } = useFilter()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  if (!meta) return null

  const cocok = meta.komoditas.filter((k) => norm(k.nama).includes(norm(q)))
  const grup = KATEGORI
    .map((kat) => [kat, cocok.filter((k) => k.kategori === kat)])
    .filter(([, arr]) => arr.length)

  return (
    <Glass className="komoditas-picker" role="group" aria-label="Pemilih komoditas">
      <button type="button" className="picker-toggle mono" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        Komoditas: {komoditas} ▾
      </button>
      <div className={open ? 'picker-body is-open' : 'picker-body'}>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari komoditas…" aria-label="Cari komoditas" />
        <div role="radiogroup" aria-label="Komoditas">
          {grup.map(([kat, arr]) => (
            <div key={kat}>
              <p className="eyebrow">{kat}</p>
              <div className="chip-row">
                {arr.map((k) => (
                  <button
                    key={k.nama}
                    type="button"
                    role="radio"
                    aria-checked={k.nama === komoditas}
                    className={k.nama === komoditas ? 'chip chip--on' : 'chip'}
                    title={k.caveat_data ? 'data 1–3 pasar jarang lapor' : undefined}
                    onClick={() => { setKomoditas(k.nama); setOpen(false) }}
                  >
                    {k.nama}{k.caveat_data ? ' ⚠' : ''}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {!cocok.length && <p className="mono">Tidak ada komoditas cocok.</p>}
        </div>
      </div>
    </Glass>
  )
}
