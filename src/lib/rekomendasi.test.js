import { rekomendasiBand } from './rekomendasi'

test('band lebar → ketidakpastian TINGGI, tidak bilang stabil polos', () => {
  const r = rekomendasiBand({ p10: -30, median: 0, p90: 37.1, lebar_band: 67.1, n: 395 }, 35000, 'dekat_lebaran')
  expect(r.rentang).toEqual([24500, 47985]) // 35000*(1-0.3), 35000*(1+0.371) rounded
  expect(r.ketidakpastian).toMatch(/TINGGI/)
  expect(r.saran).toMatch(/sulit dioptimalkan/i)
  expect(r.peringatanSampel).toMatch(/2 kejadian/)
})
test('median > 3 → arah NAIK', () => {
  const r = rekomendasiBand({ p10: -33.3, median: 7.7, p90: 50, lebar_band: 83.3, n: 396 }, 80000, 'dekat_lebaran')
  expect(r.arah).toMatch(/NAIK/)
})
test('kondisi normal → tidak ada peringatan sampel', () => {
  const r = rekomendasiBand({ p10: -6, median: 0, p90: 6, lebar_band: 12, n: 5000 }, 18000, 'normal')
  expect(r.peringatanSampel).toBeNull()
  expect(r.ketidakpastian).toMatch(/rendah/)
})
