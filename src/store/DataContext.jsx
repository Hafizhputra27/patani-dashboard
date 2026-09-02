import { createContext, useContext, useEffect, useRef, useState } from 'react'

const Ctx = createContext(null)
const BASE = import.meta.env.BASE_URL || '/'

export function DataProvider({ children }) {
  const cache = useRef(new Map()) // file -> {data} | {error} | Promise
  const [, force] = useState(0)

  const get = (file) => {
    const c = cache.current.get(file)
    if (c && !(c instanceof Promise)) return c
    if (!c) {
      const p = fetch(`${BASE}data/${file}`.replace('//data', '/data'))
        .then((r) => {
          if (!r.ok) throw new Error(`${file} ${r.status}`)
          return r.json()
        })
        .then((data) => {
          cache.current.set(file, { data })
          force((n) => n + 1)
        })
        .catch((error) => {
          cache.current.set(file, { error })
          force((n) => n + 1)
        })
      cache.current.set(file, p)
    }
    return null
  }

  return <Ctx.Provider value={get}>{children}</Ctx.Provider>
}

export function useData(file) {
  const get = useContext(Ctx)
  const [, setTick] = useState(0)
  useEffect(() => { setTick((n) => n + 1) }, [file])
  const c = get(file)
  return { data: c?.data ?? null, loading: !c, error: c?.error ?? null }
}
