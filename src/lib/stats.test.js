import { ringkasHarga, maeDeret } from './stats'

test('ringkasHarga', () => {
  const r = ringkasHarga([10, null, 30, 20, null])
  expect(r).toEqual({ terakhir: 20, min: 10, max: 30, median: 20, kosongPct: 40 })
})
test('maeDeret', () => {
  expect(maeDeret([10, 20, 30], [12, 18, 33])).toBeCloseTo(2.333, 2)
})
