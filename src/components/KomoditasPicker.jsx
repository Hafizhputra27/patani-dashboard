import { useEffect, useRef, useState } from 'react'
import { useData } from '../store/DataContext'
import { useFilter } from '../store/FilterContext'

const KATEGORI = ['bawang', 'cabai', 'sayuran', 'umbi', 'kacang', 'buah']
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '')

export default function KomoditasPicker() {
  const { data: meta } = useData('meta.json')
  const { komoditas, setKomoditas } = useFilter()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const btnRef = useRef(null)

  useEffect(() => {
    if (!open) return
    const onDoc = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); btnRef.current?.focus() } }
    document.addEventListener('mousedown', onDoc)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDoc); document.removeEventListener('keydown', onKey) }
  }, [open])

  if (!meta) return null

  const cocok = meta.komoditas.filter((k) => norm(k.nama).includes(norm(q)))
  const grup = KATEGORI
    .map((kat) => [kat, cocok.filter((k) => k.kategori === kat)])
    .filter(([, arr]) => arr.length)

  const pilih = (nama) => { setKomoditas(nama); setOpen(false); setQ(''); btnRef.current?.focus() }

  return (
    <div className="komoditas-picker" ref={ref}>
      <span className="mono ctrl-label">Komoditas</span>
      <button
        ref={btnRef}
        type="button"
        className="picker-toggle"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`Komoditas: ${komoditas}`}
        onClick={() => setOpen((o) => !o)}
      >
        <span>{komoditas}</span>
        <span aria-hidden="true">▾</span>
      </button>

      {open && (
        <div className="picker-body" role="dialog" aria-label="Pemilih komoditas">
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari komoditas…"
            aria-label="Cari komoditas"
            autoFocus
          />
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
                      onClick={() => pilih(k.nama)}
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
      )}
    </div>
  )
}
