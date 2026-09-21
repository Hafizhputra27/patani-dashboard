import { getTokens } from './tokens'

test('getTokens: seri colorblind-safe', () => {
  expect(getTokens('dark').cat3).toBe('#F59E0B')
  expect(getTokens('light').cat3).toBe('#F59E0B')
  expect(getTokens('dark').cat1).toBe('#0284C7')
  expect(getTokens('light').signature).toBe('#487848')
})
test('getTokens: default light, bg + ink', () => {
  expect(getTokens(undefined).bg).toBe('#FFFFFF')
  expect(getTokens('dark').bg).toBe('#FFFFFF')
  expect(getTokens('dark').ink).toBe('#0F172A')
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
