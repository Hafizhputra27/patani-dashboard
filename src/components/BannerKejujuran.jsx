import { formatTanggal } from '../store/dates'

export default function BannerKejujuran({ tanggal }) {
  return (
    <div className="mono glass" style={{ borderLeft: '3px solid var(--accent)', padding: '10px 14px', fontSize: '.8rem', margin: '12px 0' }}>
      Prediksi dihitung dari data terakhir {formatTanggal(tanggal, { pendek: true })}, bukan hari ini.
      Model ML secara historis <strong>kurang akurat dari baseline</strong> "harga besok ≈ harga hari ini" —
      ditampilkan sebagai pembanding, bukan angka otoritatif.
    </div>
  )
}
