import { createContext, useContext, useState } from 'react'

const Ctx = createContext(null)

export function FilterProvider({ children }) {
  const [komoditas, setKomoditas] = useState('CABE MERAH KERITING')
  const [pasar, setPasar] = useState('__semua__')
  const [rentang, setRentang] = useState('2thn')
  return (
    <Ctx.Provider value={{ komoditas, pasar, rentang, setKomoditas, setPasar, setRentang }}>
      {children}
    </Ctx.Provider>
  )
}

export const useFilter = () => useContext(Ctx)
