import { ComposedChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer, ErrorBar } from 'recharts'
import { useTokens, usePrefersReducedMotion } from '../store/ThemeContext'
import ChartFrame from './ChartFrame'
import { TooltipKustom } from './tooltip'

export default function BandKomoditasChart({ band }) {
  const t = useTokens()
  const reduced = usePrefersReducedMotion()
  const names = Object.keys(band.komoditas).sort()

  const mk = (kondisi) => names.map((n) => {
    const b = band.komoditas[n]?.[kondisi]
    if (!b) return null
    return { nama: n, median: b.median, err: [b.median - b.p10, b.p90 - b.median] }
  }).filter(Boolean)
  const normal = mk('normal')
  const lebaran = mk('dekat_lebaran')

  return (
    <ChartFrame
      judul="Lebar sebaran pergerakan harga 7-hari per komoditas"
      caption="Titik = median %, garis = p10–p90. Biru = normal, amber = menjelang Lebaran."
      tabel={{
        kolom: ['Komoditas', 'Median normal %', 'Median Lebaran %'],
        baris: names.map((n) => [n, band.komoditas[n]?.normal?.median ?? '—', band.komoditas[n]?.dekat_lebaran?.median ?? '—']),
      }}
    >
      <ResponsiveContainer width="100%" height={Math.max(360, names.length * 22)}>
        <ComposedChart layout="vertical" data={normal} margin={{ top: 8, right: 16, bottom: 8, left: 120 }}>
          <CartesianGrid stroke={t.line} horizontal={false} />
          <XAxis type="number" tick={{ fill: t.inkMuted, fontSize: 11 }} unit="%" />
          <YAxis type="category" dataKey="nama" width={116} tick={{ fill: t.inkMuted, fontSize: 10 }} />
          <ReferenceLine x={0} stroke={t.inkMuted} strokeDasharray="2 4" />
          <Tooltip content={<TooltipKustom />} />
          <Legend />
          <Scatter name="normal" data={normal} fill={t.cat1} isAnimationActive={!reduced}>
            <ErrorBar dataKey="err" width={4} strokeWidth={3} stroke={t.cat1} direction="x" />
          </Scatter>
          <Scatter name="menjelang Lebaran" data={lebaran} fill={t.cat3} isAnimationActive={!reduced}>
            <ErrorBar dataKey="err" width={4} strokeWidth={3} stroke={t.cat3} direction="x" />
          </Scatter>
        </ComposedChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}
