import { formatTanggal } from '../store/dates'

export default function BannerKejujuran({ tanggal }) {
  return (
    <div className="mono panel" style={{ borderLeft: '3px solid var(--accent)', padding: '12px 16px', fontSize: '.82rem', margin: '14px 0', background: 'var(--surface)' }}>
      Prediksi dihitung dari data terakhir {formatTanggal(tanggal, { pendek: true })}, bukan hari ini. 
      Model ML secara historis <strong>kurang akurat dari baseline</strong> (harga hari ini) — ditampilkan sebagai pembanding objektif.
    </div>
  )
}
