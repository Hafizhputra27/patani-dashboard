// Rekomendasi berbasis rentang risiko pergerakan harga 7 hari
export function rekomendasiBand(b, hargaSekarang, kondisi) {
  const abs = (pct) => Math.round(hargaSekarang * (1 + pct / 100))
  const rentang = [abs(b.p10), abs(b.p90)]
  const median = abs(b.median)
  const lebar = b.lebar_band

  const arah = b.median > 3 ? 'Tren median cenderung NAIK'
    : b.median < -3 ? 'Tren median cenderung TURUN'
      : 'Tren median relatif stabil'

  let ketidakpastian, saran
  if (lebar > 30) {
    ketidakpastian = 'Ketidakpastian TINGGI (rentang fluktuasi sangat lebar).'
    saran = 'Waktu jual sulit dioptimalkan dari data historis saja — pertimbangkan kebutuhan modal atau daya simpan komoditas.'
  } else if (lebar > 15) {
    ketidakpastian = 'Ketidakpastian sedang (fluktuasi cukup terasa).'
    saran = b.median > 3 ? 'Pertimbangkan Tahan / TUNGGU penjualan (dengan waspada).'
      : b.median < -3 ? 'Pertimbangkan JUAL SEKARANG (dengan waspada).'
        : 'Harga relatif stabil — waktu penjualan cukup fleksibel.'
  } else {
    ketidakpastian = 'Ketidakpastian rendah (pergerakan harga teratur).'
    saran = b.median > 3 ? 'Pertimbangkan Tahan / TUNGGU penjualan.'
      : b.median < -3 ? 'Pertimbangkan JUAL SEKARANG.'
        : 'Harga stabil — waktu penjualan tidak banyak berpengaruh.'
  }

  const peringatanSampel = kondisi === 'dekat_lebaran'
    ? 'Catatan Lebaran: Estimasi ini didasarkan pada 2 kejadian dalam data historis (Lebaran 2025 & 2026) sebagai indikasi awal.'
    : null

  return { rentang, median, arah, ketidakpastian, saran, peringatanSampel }
}
