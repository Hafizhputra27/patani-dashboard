import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useData } from '../store/DataContext'
import { useTokens, usePrefersReducedMotion } from '../store/ThemeContext'
import { offsetToDate, formatTanggal } from '../store/dates'
import { sampel } from '../lib/series'
import ChartFrame from './ChartFrame'
import { TooltipKustom } from './tooltip'

export default function CurahHujanChart({ pasar }) {
  const { data } = useData('cuaca.json')
  const t = useTokens()
  const reduced = usePrefersReducedMotion()
  if (!data) return null
  const c = data.pasar[pasar]
  if (!c) return null

  const rows = c.curah_hujan_mm.map((v, i) => ({
    t: formatTanggal(offsetToDate(data.tanggal_awal, i), { pendek: true }),
    hujan: v,
  }))

  return (
    <ChartFrame
      judul={`Curah Hujan — ${pasar}`}
      caption="mm per hari (Open-Meteo, data aktual historis)."
      tabel={{ kolom: ['Tanggal', 'Curah hujan (mm)'], baris: sampel(rows).map((r) => [r.t, r.hujan]) }}
    >
      <ResponsiveContainer key={pasar} width="100%" height={300}>
        <BarChart data={rows} margin={{ top: 8, right: 12, bottom: 8, left: 4 }}>
          <CartesianGrid stroke={t.line} vertical={false} />
          <XAxis dataKey="t" tick={{ fill: t.inkMuted, fontSize: 11 }} minTickGap={48} />
          <YAxis tick={{ fill: t.inkMuted, fontSize: 11 }} width={48} />
          <Tooltip content={<TooltipKustom />} />
          <Bar dataKey="hujan" name="curah hujan" fill={t.rain} radius={[4, 4, 0, 0]} isAnimationActive={!reduced} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}
