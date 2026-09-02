const BULAN_PENDEK = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']
const BULAN_PANJANG = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember']
const MS_HARI = 86400000

const toDate = (v) => (v instanceof Date ? v : new Date(v + 'T00:00:00Z'))

export function offsetToDate(tanggalAwal, offset) {
  return new Date(toDate(tanggalAwal).getTime() + offset * MS_HARI)
}
export function formatTanggal(d, { pendek = false } = {}) {
  const dt = toDate(d)
  const tbl = pendek ? BULAN_PENDEK : BULAN_PANJANG
  return `${dt.getUTCDate()} ${tbl[dt.getUTCMonth()]} ${dt.getUTCFullYear()}`
}
export function indexOfDate(tanggalAwal, target) {
  return Math.floor((toDate(target) - toDate(tanggalAwal)) / MS_HARI)
}
