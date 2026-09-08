import { formatTanggal } from '../store/dates'

const rp = (v) => 'Rp ' + Math.round(v).toLocaleString('id-ID')

function Horizon({ label, tgl, model, baseline, worse }) {
  return (
    <div style={{ borderTop: '1px solid var(--line)', padding: '8px 0' }}>
      <div className="mono" style={{ fontSize: '.72rem', color: 'var(--ink-muted)' }}>
        {label} · {formatTanggal(tgl, { pendek: true })}
      </div>
      <div style={{ display: 'flex', gap: 12, alignItems: 'baseline', marginTop: 2 }}>
        <span style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
          <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent)' }} />
          <strong className="mono" style={{ color: 'var(--ink)' }}>{rp(model)}</strong>
        </span>
        <span className="mono" style={{ color: 'var(--ink-muted)', fontSize: '.85rem' }}>
          baseline {rp(baseline)}
        </span>
      </div>
      <div className="mono" style={{ fontSize: '.68rem', color: 'var(--ink-muted)', marginTop: 2 }}>
        model historis +{worse}% MAE
      </div>
    </div>
  )
}

export default function PrediksiChip({ row }) {
  if (!row) {
    return (
      <div className="panel" style={{ padding: 14 }}>
        <div className="mono" style={{ fontSize: '.85rem', fontWeight: 500, color: 'var(--ink)' }}>Data tidak tersedia</div>
        <div className="mono" style={{ fontSize: '.72rem', color: 'var(--ink-muted)', marginTop: 2 }}>Pasar ini jarang melaporkan komoditas ini</div>
      </div>
    )
  }
  return (
    <div className="panel" style={{ padding: 14 }}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '.95rem', color: 'var(--ink)' }}>
        {row.pasar}
      </div>
      <div className="mono" style={{ fontSize: '.72rem', color: 'var(--ink-muted)', marginBottom: 4 }}>
        Terakhir {rp(row.harga_terakhir)} ({formatTanggal(row.tanggal_anchor, { pendek: true })})
      </div>
      <Horizon label="H+1" tgl={row.tanggal_target_h1} model={row.pred_model_h1} baseline={row.pred_baseline_h1} worse={row.model_lebih_buruk_pct_h1} />
      <Horizon label="H+3" tgl={row.tanggal_target_h3} model={row.pred_model_h3} baseline={row.pred_baseline_h3} worse={row.model_lebih_buruk_pct_h3} />
      <Horizon label="H+7" tgl={row.tanggal_target_h7} model={row.pred_model_h7} baseline={row.pred_baseline_h7} worse={row.model_lebih_buruk_pct_h7} />
    </div>
  )
}
