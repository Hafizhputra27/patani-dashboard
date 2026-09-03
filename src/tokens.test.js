import { getTokens } from './tokens'

test('getTokens: seri colorblind-safe tak berubah', () => {
  expect(getTokens('dark').cat3).toBe('#B27B27')
  expect(getTokens('light').cat3).toBe('#E69F00')
  expect(getTokens('dark').cat1).toBe('#3C97D4')
  expect(getTokens('light').signature).toBe('#8AB84F')
})
test('getTokens: default light, bg + ink baru', () => {
  expect(getTokens(undefined).bg).toBe('#EEF3E9')
  expect(getTokens('dark').bg).toBe('#0B1410')
  expect(getTokens('dark').ink).toBe('#F2F6F0')
})
test('kontras ink-muted vs bg >= 4.5:1 kedua tema', () => {
  const lum = (hex) => {
    const c = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
  }
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m)
    return (x + 0.05) / (y + 0.05)
  }
  for (const th of ['light', 'dark']) {
    const t = getTokens(th)
    expect(ratio(t.inkMuted, t.bg)).toBeGreaterThanOrEqual(4.5)
  }
})
