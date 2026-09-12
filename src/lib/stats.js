export function ringkasHarga(vals) {
  const ada = vals.filter((v) => v != null)
  const sorted = [...ada].sort((a, b) => a - b)
  const median = sorted.length % 2
    ? sorted[(sorted.length - 1) / 2]
    : (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
  return {
    terakhir: ada.at(-1) ?? null,
    min: sorted[0] ?? null,
    max: sorted.at(-1) ?? null,
    median: median ?? null,
    kosongPct: vals.length ? Math.round(((vals.length - ada.length) / vals.length) * 100) : 0,
  }
}

export function maeDeret(aktual, prediksi) {
  const n = Math.min(aktual.length, prediksi.length)
  let s = 0
  for (let i = 0; i < n; i++) s += Math.abs(aktual[i] - prediksi[i])
  return s / n
}
