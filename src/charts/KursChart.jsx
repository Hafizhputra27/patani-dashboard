import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useData } from '../store/DataContext'
import { useTokens, usePrefersReducedMotion } from '../store/ThemeContext'
import { offsetToDate, formatTanggal } from '../store/dates'
import { sampel } from '../lib/series'
import ChartFrame from './ChartFrame'
import { TooltipKustom } from './tooltip'

export default function KursChart() {
  const { data, loading } = useData('kurs.json')
  const t = useTokens()
  const reduced = usePrefersReducedMotion()
  if (loading || !data) return <p className="mono">Memuat kurs…</p>

  const rows = data.kurs_usd_idr
    .map((v, i) => ({
      t: formatTanggal(offsetToDate(data.tanggal_awal, i), { pendek: true }),
      kurs: v,
    }))
    .filter((r) => r.kurs != null)

  return (
    <ChartFrame
      judul="Kurs USD/IDR"
      caption="Sumber: data kurs harian, weekend/libur di-forward-fill."
      tabel={{ kolom: ['Tanggal', 'Kurs'], baris: sampel(rows).map((r) => [r.t, r.kurs]) }}
    >
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 8, left: 4 }}>
          <CartesianGrid stroke={t.line} vertical={false} />
          <XAxis dataKey="t" tick={{ fill: t.inkMuted, fontFamily: 'var(--font-mono)', fontSize: 11 }} minTickGap={48} />
          <YAxis tick={{ fill: t.inkMuted, fontFamily: 'var(--font-mono)', fontSize: 11 }} width={64} tickFormatter={(v) => v.toLocaleString('id-ID')} />
          <Tooltip content={<TooltipKustom />} />
          <Line type="monotone" dataKey="kurs" name="Kurs USD/IDR" stroke={t.brand} strokeWidth={2} dot={false} isAnimationActive={!reduced} />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}
