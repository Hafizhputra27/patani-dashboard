// Port of scripts/rekomendasi_band_h7.py::rekomendasi()
// median > 3 → NAIK, < -3 → TURUN, else stabil
// lebar_band > 30 → "TINGGI" + "sulit dioptimalkan"; > 15 → "sedang"; else "rendah"
// kondisi === 'dekat_lebaran' → selalu tambah peringatan sampel kecil (2 kejadian)
export function rekomendasiBand(b, hargaSekarang, kondisi) {
  const abs = (pct) => Math.round(hargaSekarang * (1 + pct / 100))
  const rentang = [abs(b.p10), abs(b.p90)]
  const median = abs(b.median)
  const lebar = b.lebar_band

  const arah = b.median > 3 ? 'median historis cenderung NAIK'
    : b.median < -3 ? 'median historis cenderung TURUN'
      : 'median historis relatif stabil'

  let ketidakpastian, saran
  if (lebar > 30) {
    ketidakpastian = 'Ketidakpastian TINGGI — rentang sangat lebar, median saja tidak cukup mewakili.'
    saran = 'Waktu jual sulit dioptimalkan dari data historis saja di kondisi ini — pertimbangkan faktor lain (kebutuhan modal, kapasitas simpan hasil panen).'
  } else if (lebar > 15) {
    ketidakpastian = 'Ketidakpastian sedang — perhatikan rentangnya, jangan cuma patokan ke median.'
    saran = b.median > 3 ? 'Pertimbangkan TUNGGU (dengan waspada).'
      : b.median < -3 ? 'Pertimbangkan JUAL SEKARANG (dengan waspada).'
        : 'Harga cenderung stabil, tapi tetap ada variasi — waktu jual tidak terlalu krusial.'
  } else {
    ketidakpastian = 'Ketidakpastian relatif rendah — median cukup representatif.'
    saran = b.median > 3 ? 'Pertimbangkan TUNGGU.'
      : b.median < -3 ? 'Pertimbangkan JUAL SEKARANG.'
        : 'Harga stabil — waktu jual tidak banyak berpengaruh.'
  }

  const peringatanSampel = kondisi === 'dekat_lebaran'
    ? 'PERINGATAN: estimasi kondisi Lebaran ini cuma didasarkan pada 2 kejadian dalam data (Lebaran 2025 & 2026) — sampel sangat kecil untuk pola musiman, dan beberapa komoditas menunjukkan pola berbeda antara kedua tahun itu. Anggap sebagai indikasi awal, bukan pola pasti.'
    : null

  return { rentang, median, arah, ketidakpastian, saran, peringatanSampel }
}
