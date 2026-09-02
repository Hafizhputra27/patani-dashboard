// Design doc §12 — warna untuk props Recharts (hex string, bukan var(--x)).
const LIGHT = {
  ink: '#1A241A', inkMuted: '#57634F', line: '#D7DFC9', surface: '#FFFFFF', bg: '#F4F7EF',
  brand: '#2C6E49', signature: '#8AB84F',
  cat1: '#0072B2', cat2: '#009E73', cat3: '#E69F00',
  naik: '#2C7A4B', turun: '#B5502F', stabil: '#7B8470',
  rain: '#3C7A9E', temp: '#C46A3C',
}
const DARK = {
  ink: '#E9EEE0', inkMuted: '#9AA88C', line: '#2E3826', surface: '#181E13', bg: '#10140D',
  brand: '#69B487', signature: '#A6D26A',
  cat1: '#3C97D4', cat2: '#12A97F', cat3: '#B27B27',
  naik: '#69B487', turun: '#D9805E', stabil: '#8C9580',
  rain: '#5FA0C4', temp: '#D98C5E',
}

export const getTokens = (theme) => (theme === 'dark' ? DARK : LIGHT)
