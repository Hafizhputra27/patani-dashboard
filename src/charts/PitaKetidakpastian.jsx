import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { useTokens, usePrefersReducedMotion } from '../store/ThemeContext'
import { TooltipKustom } from './tooltip'

export default function PitaKetidakpastian({ data, kondisi = 'normal', tinggi = 360, lebaranX = [] }) {
  const t = useTokens()
  const reduced = usePrefersReducedMotion()
  const hue = kondisi === 'lebaran' || kondisi === 'dekat_lebaran' ? t.cat3 : t.cat2
  const id = `pita-${kondisi}`

  // stack the band as base (p10) + span (p90-p10) so Area draws a ribbon between p10 and p90
  const rows = data.map((d) => ({ ...d, base: d.p10, span: d.p90 - d.p10 }))

  return (
    <ResponsiveContainer width="100%" height={tinggi}>
      <ComposedChart data={rows} margin={{ top: 8, right: 12, bottom: 8, left: 4 }} stackOffset="none">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={hue} stopOpacity={0.22} />
            <stop offset="50%" stopColor={hue} stopOpacity={0.08} />
            <stop offset="100%" stopColor={hue} stopOpacity={0.22} />
          </linearGradient>
          {(kondisi === 'lebaran' || kondisi === 'dekat_lebaran') && (
            <pattern id="hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke={t.inkMuted} strokeOpacity="0.3" strokeWidth="1" />
            </pattern>
          )}
        </defs>
        <CartesianGrid stroke={t.line} vertical={false} />
        <XAxis dataKey="t" tick={{ fill: t.inkMuted, fontSize: 11 }} minTickGap={48} />
        <YAxis tick={{ fill: t.inkMuted, fontSize: 11 }} width={64} tickFormatter={(v) => v.toLocaleString('id-ID')} />
        <Tooltip content={<TooltipKustom />} />
        <Area dataKey="base" stackId="pita" stroke="none" fill="transparent" legendType="none" isAnimationActive={!reduced} />
        <Area dataKey="span" stackId="pita" stroke={hue} strokeOpacity={0.5} strokeWidth={1} fill={`url(#${id})`} name="rentang p10–p90" isAnimationActive={!reduced} />
        {(kondisi === 'lebaran' || kondisi === 'dekat_lebaran') && (
          <Area dataKey="span" stackId="pita2" stroke="none" fill="url(#hatch)" legendType="none" tooltipType="none" isAnimationActive={false} />
        )}
        <Line dataKey="median" name="median" stroke={t.signature} strokeWidth={1.5} dot={false} strokeLinecap="round" isAnimationActive={!reduced} />
        {lebaranX.map((x) => (
          <ReferenceLine key={x} x={x} stroke={t.line} strokeDasharray="2 4" label={{ value: 'Lebaran', position: 'top', fill: t.inkMuted, fontSize: 10, fontFamily: 'var(--font-mono)' }} />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  )
}
