import { offsetToDate, formatTanggal, indexOfDate } from './dates'

test('offsetToDate adds days from tanggalAwal', () => {
  expect(offsetToDate('2024-08-22', 0).toISOString().slice(0, 10)).toBe('2024-08-22')
  expect(offsetToDate('2024-08-22', 10).toISOString().slice(0, 10)).toBe('2024-09-01')
})
test('formatTanggal Indonesian short & long', () => {
  expect(formatTanggal('2026-08-22', { pendek: true })).toBe('22 Agu 2026')
  expect(formatTanggal('2026-03-21')).toBe('21 Maret 2026')
})
test('indexOfDate returns day offset', () => {
  expect(indexOfDate('2024-08-22', '2024-08-22')).toBe(0)
  expect(indexOfDate('2024-08-22', '2026-08-22')).toBe(730)
})
