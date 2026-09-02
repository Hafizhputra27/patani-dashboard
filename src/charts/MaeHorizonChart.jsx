import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LabelList, ResponsiveContainer } from 'recharts'
import { useTokens, usePrefersReducedMotion } from '../store/ThemeContext'
import ChartFrame from './ChartFrame'
import { TooltipKustom } from './tooltip'

export default function MaeHorizonChart({ horizonDirect }) {
  const t = useTokens()
  const reduced = usePrefersReducedMotion()
  const rows = horizonDirect.map((h) => ({ h: `H+${h.horizon}`, model: h.mae_model, baseline: h.mae_baseline, pct: h.selisih_pct }))

  return (
    <ChartFrame
      judul="MAE model vs baseline per horizon (direct)"
      caption="Model kalah di semua horizon."
      tabel={{ kolom: ['Horizon', 'MAE model', 'MAE baseline', 'Selisih %'], baris: rows.map((r) => [r.h, r.model, r.baseline, r.pct]) }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={rows} margin={{ top: 16, right: 12, bottom: 8, left: 4 }} barGap={6}>
          <CartesianGrid stroke={t.line} vertical={false} />
          <XAxis dataKey="h" tick={{ fill: t.inkMuted, fontSize: 12 }} />
          <YAxis tick={{ fill: t.inkMuted, fontSize: 11 }} width={64} tickFormatter={(v) => v.toLocaleString('id-ID')} />
          <Tooltip content={<TooltipKustom />} />
          <Legend />
          <Bar dataKey="model" name="model" fill={t.cat3} radius={[4, 4, 0, 0]} isAnimationActive={!reduced}>
            <LabelList dataKey="pct" position="top" formatter={(v) => `+${v}%`} style={{ fill: t.inkMuted, fontFamily: 'var(--font-mono)', fontSize: 11 }} />
          </Bar>
          <Bar dataKey="baseline" name="baseline persistence" fill={t.inkMuted} radius={[4, 4, 0, 0]} isAnimationActive={!reduced} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}
