export const LEBARAN_DATES = ['2025-03-31', '2026-03-20', '2027-03-10']
const MS_HARI = 86400000
const toUTC = (v) => (v instanceof Date ? v : new Date(v + 'T00:00:00Z'))

export function inLebaranWindow(date, lebaran = LEBARAN_DATES) {
  const t = toUTC(date).getTime()
  return lebaran.some((l) => {
    const c = toUTC(l).getTime()
    return t >= c - 21 * MS_HARI && t <= c + 7 * MS_HARI
  })
}

// Proyeksi band empiris: dari harga aktual terakhir (d0), pola pergerakan historis
// 7-hari (band.json). Drift median linear ×(n/7); sebaran melebar ~√(n/7) (random walk).
export function proyeksiBand(bandKomoditas, hargaAnchor, d0, targetDate) {
  const n = Math.max(0, Math.floor((toUTC(targetDate) - toUTC(d0)) / MS_HARI))
  if (n === 0) {
    return { median: hargaAnchor, p10: hargaAnchor, p90: hargaAnchor, n: 0, kondisi: 'normal', kadaluarsa: false }
  }
  const kondisi = inLebaranWindow(targetDate) ? 'dekat_lebaran' : 'normal'
  const b = bandKomoditas[kondisi] || bandKomoditas.normal
  const t = n / 7
  let p10 = hargaAnchor * (1 + (b.p10 / 100) * Math.sqrt(t))
  p10 = Math.max(p10, hargaAnchor * 0.1)
  return {
    median: Math.round(hargaAnchor * (1 + (b.median / 100) * t)),
    p10: Math.round(p10),
    p90: Math.round(hargaAnchor * (1 + (b.p90 / 100) * Math.sqrt(t))),
    n,
    kondisi,
    kadaluarsa: n > 30,
  }
}
