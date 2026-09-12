import { createContext, useContext, useEffect, useState } from 'react'
import { getTokens } from '../tokens'

const Ctx = createContext(null)

export function ThemeProvider({ children }) {
  const [theme] = useState('light')
  useEffect(() => { document.documentElement.dataset.theme = theme }, [theme])
  const toggle = () => {}
  return <Ctx.Provider value={{ theme, toggle }}>{children}</Ctx.Provider>
}

export const useTheme = () => useContext(Ctx)
export const useTokens = () => getTokens(useContext(Ctx).theme)

export function usePrefersReducedMotion() {
  const [r, setR] = useState(false)
  useEffect(() => {
    const mq = matchMedia('(prefers-reduced-motion: reduce)')
    const on = () => setR(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [])
  return r
}
