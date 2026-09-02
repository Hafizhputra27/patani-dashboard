import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useTokens, usePrefersReducedMotion } from '../store/ThemeContext'
import { maeDeret } from '../lib/stats'
import ChartFrame from './ChartFrame'
import { TooltipKustom } from './tooltip'
import { formatTanggal } from '../store/dates'

export default function BacktestChart({ seri, komoditas, pasar }) {
  const t = useTokens()
  const reduced = usePrefersReducedMotion()
  if (!seri) return <p className="mono">Tidak ada data backtest untuk {komoditas} @ {pasar}.</p>

  const rows = seri.tanggal.map((d, i) => ({
    t: formatTanggal(d, { pendek: true }),
    aktual: seri.aktual[i],
    model: seri.model[i],
    baseline: seri.baseline[i],
  }))
  const maeM = Math.round(maeDeret(seri.aktual, seri.model))
  const maeB = Math.round(maeDeret(seri.aktual, seri.baseline))

  return (
    <ChartFrame
      judul={`Backtest H+7 — ${komoditas} @ ${pasar}`}
      caption={`Periode uji ${rows.length} hari. MAE model Rp ${maeM.toLocaleString('id-ID')} · baseline Rp ${maeB.toLocaleString('id-ID')}.`}
      tabel={{ kolom: ['Tanggal', 'Aktual', 'Model', 'Baseline'], baris: rows.map((r) => [r.t, r.aktual, r.model, r.baseline]) }}
    >
      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 8, left: 4 }}>
          <CartesianGrid stroke={t.line} vertical={false} />
          <XAxis dataKey="t" tick={{ fill: t.inkMuted, fontSize: 11 }} minTickGap={40} />
          <YAxis tick={{ fill: t.inkMuted, fontSize: 11 }} width={72} tickFormatter={(v) => 'Rp ' + v.toLocaleString('id-ID')} />
          <Tooltip content={<TooltipKustom />} />
          <Legend />
          <Line dataKey="aktual" name="aktual" stroke={t.ink} strokeWidth={2.5} dot={false} isAnimationActive={!reduced} />
          <Line dataKey="model" name="model" stroke={t.cat3} strokeWidth={2} dot={false} isAnimationActive={!reduced} />
          <Line dataKey="baseline" name="baseline" stroke={t.inkMuted} strokeWidth={2} strokeDasharray="4 2" dot={false} isAnimationActive={!reduced} />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}
