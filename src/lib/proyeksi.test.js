import { proyeksiBand, inLebaranWindow } from './proyeksi'

const band = { normal: { p10: -20, median: 0, p90: 20 }, dekat_lebaran: { p10: -35, median: 10, p90: 40 } }

test('n=0 → semua = anchor', () => {
  const r = proyeksiBand(band, 1000, '2026-08-22', '2026-08-22')
  expect(r).toMatchObject({ median: 1000, p10: 1000, p90: 1000, n: 0, kondisi: 'normal', kadaluarsa: false })
})
test('median=0 → median flat, pita melebar ~√t', () => {
  const r = proyeksiBand(band, 1000, '2026-08-22', '2026-08-29') // n=7, t=1
  expect(r.median).toBe(1000)
  expect(r.p90).toBe(1200)
  expect(r.p10).toBe(800)
  const r4 = proyeksiBand(band, 1000, '2026-08-22', '2026-09-19') // n=28, t=4, √t=2
  expect(r4.p90).toBe(1400)
})
test('drift median linear', () => {
  const r = proyeksiBand({ normal: { p10: -10, median: 14, p90: 10 } }, 1000, '2026-08-01', '2026-08-15') // n=14, t=2
  expect(r.median).toBe(1280)
})
test('clamp p10 >= 10% anchor', () => {
  const r = proyeksiBand({ normal: { p10: -95, median: 0, p90: 5 } }, 1000, '2026-08-01', '2026-08-29') // n=28, √t=2 → -0.9
  expect(r.p10).toBe(100)
})
test('kadaluarsa saat n > 30', () => {
  expect(proyeksiBand(band, 1000, '2026-08-01', '2026-08-31').kadaluarsa).toBe(false) // n=30
  expect(proyeksiBand(band, 1000, '2026-08-01', '2026-09-01').kadaluarsa).toBe(true) // n=31
})
test('kondisi dekat_lebaran saat target di window', () => {
  const r = proyeksiBand(band, 1000, '2026-02-20', '2026-03-10')
  expect(r.kondisi).toBe('dekat_lebaran')
})
test('inLebaranWindow batas ±', () => {
  expect(inLebaranWindow('2026-02-27')).toBe(true) // −21
  expect(inLebaranWindow('2026-02-26')).toBe(false) // −22
  expect(inLebaranWindow('2026-03-27')).toBe(true) // +7
  expect(inLebaranWindow('2026-03-28')).toBe(false) // +8
})
