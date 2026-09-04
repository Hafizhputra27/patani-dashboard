import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useData } from '../store/DataContext'
import { useFilter } from '../store/FilterContext'
import { useTokens, usePrefersReducedMotion } from '../store/ThemeContext'
import { offsetToDate, formatTanggal } from '../store/dates'
import { buildEnvelope, sliceRange, sampel } from '../lib/series'
import ChartFrame from './ChartFrame'
import { TooltipKustom } from './tooltip'

export default function HargaChart() {
  const { data } = useData('harga.json')
  const { komoditas, pasar, rentang } = useFilter()
  const t = useTokens()
  const reduced = usePrefersReducedMotion()
  if (!data) return <p className="mono">Memuat harga…</p>

  const perPasar = data.komoditas[komoditas] || {}
  const env = buildEnvelope(perPasar)
  const spotlight = pasar !== '__semua__' ? (perPasar[pasar] || []) : null

  const full = env.map((e, i) => ({
    t: formatTanggal(offsetToDate(data.tanggal_awal, i), { pendek: true }),
    lo: e.min, hi: e.max, avg: e.avg,
    span: e.min != null && e.max != null ? e.max - e.min : null,
    spot: spotlight ? spotlight[i] : undefined,
  }))
  const { arr: rows } = sliceRange(full, data.tanggal_awal, rentang)

  return (
    <ChartFrame
      judul={`Harga ${komoditas}`}
      caption={pasar === '__semua__' ? 'Area = rentang 9 pasar, garis = rata-rata.' : `Garis tebal = ${pasar}; area = rentang 9 pasar.`}
      tabel={{
        kolom: ['Tanggal', 'Min', 'Rata-rata', 'Max'],
        baris: sampel(rows).map((r) => [r.t, r.lo, r.avg != null ? Math.round(r.avg) : null, r.hi]),
      }}
    >
      <ResponsiveContainer width="100%" height={360}>
        <ComposedChart data={rows} margin={{ top: 8, right: 12, bottom: 8, left: 4 }}>
          <CartesianGrid stroke={t.line} vertical={false} />
          <XAxis dataKey="t" tick={{ fill: t.inkMuted, fontSize: 11 }} minTickGap={48} />
          <YAxis tick={{ fill: t.inkMuted, fontSize: 11 }} width={72} tickFormatter={(v) => 'Rp ' + v.toLocaleString('id-ID')} />
          <Tooltip content={<TooltipKustom />} />
          <Legend />
          <Area dataKey="lo" stackId="env" stroke="none" fill="transparent" legendType="none" tooltipType="none" isAnimationActive={!reduced} />
          <Area dataKey="span" stackId="env" name="rentang 9 pasar" stroke="none" fill={t.line} fillOpacity={0.7} isAnimationActive={!reduced} />
          <Line dataKey="avg" name="rata-rata" stroke={t.ink} strokeWidth={2} dot={false} isAnimationActive={!reduced} />
          {spotlight && <Line dataKey="spot" name={pasar} stroke={t.cat1} strokeWidth={2.5} dot={false} isAnimationActive={!reduced} />}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}
