// Warna untuk props Recharts (hex solid, bukan var(--x)). Tema-aware.
// Seri chart (cat1/cat2/cat3, rain, temp, naik/turun/stabil, signature) colorblind-safe
// per design-doc §3 — TIDAK berubah. Aksen lime UI bukan warna seri.
const LIGHT = {
  ink: '#12201A', inkMuted: '#46564C', line: '#B9C6B0', surface: '#F8FAF5', bg: '#EEF3E9',
  brand: '#3C8E1C', signature: '#8AB84F',
  cat1: '#0072B2', cat2: '#009E73', cat3: '#E69F00',
  naik: '#2C7A4B', turun: '#B5502F', stabil: '#7B8470',
  rain: '#3C7A9E', temp: '#C46A3C',
}
const DARK = {
  ink: '#F2F6F0', inkMuted: '#9FB098', line: '#2E3A30', surface: '#141E19', bg: '#0B1410',
  brand: '#93E84D', signature: '#A6D26A',
  cat1: '#3C97D4', cat2: '#12A97F', cat3: '#B27B27',
  naik: '#69B487', turun: '#D9805E', stabil: '#8C9580',
  rain: '#5FA0C4', temp: '#D98C5E',
}

export const getTokens = (theme) => (theme === 'dark' ? DARK : LIGHT)
