const HARI = { '3bln': 90, '1thn': 365, '2thn': Infinity }

export function buildEnvelope(perPasar) {
  const pasars = Object.values(perPasar)
  const n = pasars.reduce((m, p) => Math.max(m, p?.length ?? 0), 0)
  const out = []
  for (let i = 0; i < n; i++) {
    const vals = pasars.map((p) => p[i]).filter((v) => v != null)
    if (!vals.length) { out.push({ min: null, max: null, avg: null }); continue }
    out.push({
      min: Math.min(...vals),
      max: Math.max(...vals),
      avg: vals.reduce((a, b) => a + b, 0) / vals.length,
    })
  }
  return out
}

// Sample an array down to <= max evenly-spaced items (for table views).
export function sampel(arr, max = 60) {
  if (arr.length <= max) return arr
  const step = Math.ceil(arr.length / max)
  return arr.filter((_, i) => i % step === 0)
}

export function sliceRange(arr, tanggalAwal, rentang) {
  const want = HARI[rentang] ?? Infinity
  if (want >= arr.length) return { arr, offset: 0 }
  return { arr: arr.slice(arr.length - want), offset: arr.length - want }
}
