import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useData } from '../store/DataContext'
import { useTokens, usePrefersReducedMotion } from '../store/ThemeContext'
import { offsetToDate, formatTanggal } from '../store/dates'
import { sampel } from '../lib/series'
import ChartFrame from './ChartFrame'
import { TooltipKustom } from './tooltip'

export default function SuhuChart({ pasar }) {
  const { data } = useData('cuaca.json')
  const t = useTokens()
  const reduced = usePrefersReducedMotion()
  if (!data) return null
  const c = data.pasar[pasar]
  if (!c) return null

  const rows = c.suhu_avg.map((v, i) => ({
    t: formatTanggal(offsetToDate(data.tanggal_awal, i), { pendek: true }),
    avg: v,
    lo: c.suhu_min[i],
    span: (c.suhu_max[i] ?? 0) - (c.suhu_min[i] ?? 0),
    hi: c.suhu_max[i],
  }))

  return (
    <ChartFrame
      judul={`Suhu — ${pasar}`}
      caption="°C: garis = rata-rata, pita = min–max harian."
      tabel={{ kolom: ['Tanggal', 'Min', 'Rata-rata', 'Max'], baris: sampel(rows).map((r) => [r.t, r.lo, r.avg, r.hi]) }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <ComposedChart data={rows} margin={{ top: 8, right: 12, bottom: 8, left: 4 }}>
          <CartesianGrid stroke={t.line} vertical={false} />
          <XAxis dataKey="t" tick={{ fill: t.inkMuted, fontSize: 11 }} minTickGap={48} />
          <YAxis tick={{ fill: t.inkMuted, fontSize: 11 }} width={40} unit="°" />
          <Tooltip content={<TooltipKustom />} />
          <Legend />
          <Area dataKey="lo" stackId="s" stroke="none" fill="transparent" legendType="none" isAnimationActive={!reduced} />
          <Area dataKey="span" stackId="s" stroke="none" fill={t.temp} fillOpacity={0.12} name="rentang min–max" isAnimationActive={!reduced} />
          <Line dataKey="avg" name="suhu rata-rata" stroke={t.temp} strokeWidth={2} dot={false} isAnimationActive={!reduced} />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}
