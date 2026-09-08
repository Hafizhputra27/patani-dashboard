// Warna untuk props Recharts (hex solid, bukan var(--x)). Tema-aware.
// Seri chart (cat1/cat2/cat3, rain, temp, naik/turun/stabil, signature) colorblind-safe.
const LIGHT = {
  ink: '#0F172A', inkMuted: '#64748B', line: '#E2E8F0', surface: '#FFFFFF', bg: '#FFFFFF',
  brand: '#10B981', signature: '#10B981',
  cat1: '#0284C7', cat2: '#10B981', cat3: '#F59E0B',
  naik: '#16A34A', turun: '#DC2626', stabil: '#64748B',
  rain: '#0284C7', temp: '#EA580C',
}
const DARK = {
  ink: '#F8FAFC', inkMuted: '#94A3B8', line: '#334155', surface: '#1E293B', bg: '#0F172A',
  brand: '#34D399', signature: '#34D399',
  cat1: '#38BDF8', cat2: '#34D399', cat3: '#FBBF24',
  naik: '#4ADE80', turun: '#F87171', stabil: '#94A3B8',
  rain: '#38BDF8', temp: '#FB923C',
}

export const getTokens = (theme) => (theme === 'dark' ? DARK : LIGHT)
