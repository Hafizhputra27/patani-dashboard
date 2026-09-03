import { formatTanggal } from '../store/dates'

const rp = (v) => 'Rp ' + Math.round(v).toLocaleString('id-ID')

function Horizon({ label, tgl, model, baseline, worse }) {
  return (
    <div style={{ borderTop: '1px solid var(--line)', padding: '8px 0' }}>
      <div className="mono" style={{ fontSize: '.7rem', color: 'var(--ink-muted)' }}>{label} · {formatTanggal(tgl, { pendek: true })}</div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', marginTop: 2 }}>
        <span style={{ display: 'inline-flex', gap: 5, alignItems: 'baseline' }}>
          <span style={{ width: 7, height: 7, borderRadius: 2, background: 'var(--accent)' }} />
          <strong className="mono">{rp(model)}</strong>
        </span>
        <span className="mono" style={{ color: 'var(--ink-muted)', fontSize: '.85rem' }}>
          baseline {rp(baseline)}
        </span>
      </div>
      <div className="mono" style={{ fontSize: '.68rem', color: 'var(--ink-muted)' }}>model historis +{worse}% MAE</div>
    </div>
  )
}

export default function PrediksiChip({ row }) {
  if (!row) {
    return (
      <div className="glass" style={{ padding: 14 }}>
        <div className="mono" style={{ fontSize: '.8rem' }}>Data tidak tersedia</div>
        <div className="mono" style={{ fontSize: '.7rem', color: 'var(--ink-muted)' }}>pasar ini jarang melaporkan komoditas ini</div>
      </div>
    )
  }
  return (
    <div className="glass" style={{ padding: 14 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600 }}>{row.pasar}</div>
      <div className="mono" style={{ fontSize: '.7rem', color: 'var(--ink-muted)' }}>terakhir {rp(row.harga_terakhir)} ({formatTanggal(row.tanggal_anchor, { pendek: true })})</div>
      <Horizon label="H+1" tgl={row.tanggal_target_h1} model={row.pred_model_h1} baseline={row.pred_baseline_h1} worse={row.model_lebih_buruk_pct_h1} />
      <Horizon label="H+3" tgl={row.tanggal_target_h3} model={row.pred_model_h3} baseline={row.pred_baseline_h3} worse={row.model_lebih_buruk_pct_h3} />
      <Horizon label="H+7" tgl={row.tanggal_target_h7} model={row.pred_model_h7} baseline={row.pred_baseline_h7} worse={row.model_lebih_buruk_pct_h7} />
    </div>
  )
}
