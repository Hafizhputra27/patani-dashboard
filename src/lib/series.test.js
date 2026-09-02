import { buildEnvelope, sliceRange } from './series'

test('buildEnvelope skips nulls, all-null → nulls', () => {
  const env = buildEnvelope({ A: [10, null, 30], B: [20, null, null], C: [null, null, 10] })
  expect(env[0]).toEqual({ min: 10, max: 20, avg: 15 })
  expect(env[1]).toEqual({ min: null, max: null, avg: null })
  expect(env[2]).toEqual({ min: 10, max: 30, avg: 20 })
})
test('sliceRange returns tail + offset', () => {
  const a = Array.from({ length: 731 }, (_, i) => i)
  const { arr, offset } = sliceRange(a, '2024-08-22', '3bln')
  expect(arr.length).toBe(90)
  expect(offset).toBe(641)
  expect(sliceRange(a, '2024-08-22', '2thn').arr.length).toBe(731)
})
