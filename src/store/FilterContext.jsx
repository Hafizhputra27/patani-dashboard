import { createContext, useContext, useEffect, useState } from 'react'
import { parseHash } from '../router'

const Ctx = createContext(null)
const VALID_RENTANG = ['3bln', '1thn', '2thn']
const q = (key) => (typeof window === 'undefined' ? null : parseHash(window.location.hash).query.get(key))

export function FilterProvider({ children }) {
  const [komoditas, setKomoditas] = useState(() => q('k') || 'CABE MERAH KERITING')
  const [pasar, setPasar] = useState(() => q('p') || '__semua__')
  const [rentang, setRentang] = useState(() => (VALID_RENTANG.includes(q('r')) ? q('r') : '2thn'))

  useEffect(() => {
    if (typeof window === 'undefined') return
    const { path } = parseHash(window.location.hash)
    const p = new URLSearchParams()
    if (komoditas !== 'CABE MERAH KERITING') p.set('k', komoditas)
    if (pasar !== '__semua__') p.set('p', pasar)
    if (rentang !== '2thn') p.set('r', rentang)
    const qs = p.toString()
    const next = '#' + path + (qs ? '?' + qs : '')
    if (next !== window.location.hash) window.history.replaceState(null, '', next)
  }, [komoditas, pasar, rentang])

  return (
    <Ctx.Provider value={{ komoditas, pasar, rentang, setKomoditas, setPasar, setRentang }}>
      {children}
    </Ctx.Provider>
  )
}

export const useFilter = () => useContext(Ctx)
