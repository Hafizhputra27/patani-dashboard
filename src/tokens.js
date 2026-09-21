// Warna untuk props Recharts (hex solid, bukan var(--x)). Tema-aware.
// Seri chart (cat1/cat2/cat3, rain, temp, naik/turun/stabil, signature) colorblind-safe.
const LIGHT = {
  ink: '#0F172A', inkMuted: '#64748B', line: '#E2E8F0', surface: '#FFFFFF', bg: '#FFFFFF',
  brand: '#487848', signature: '#487848',
  cat1: '#0284C7', cat2: '#487848', cat3: '#F59E0B',
  naik: '#4F8B52', turun: '#DC2626', stabil: '#64748B',
  rain: '#0284C7', temp: '#EA580C',
}
const DARK = {
  ...LIGHT,
}

export const getTokens = (theme) => (theme === 'dark' ? DARK : LIGHT)
