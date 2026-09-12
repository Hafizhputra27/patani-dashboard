import { ComposedChart, Area, Line, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, ResponsiveContainer } from 'recharts'
import { useData } from '../store/DataContext'
import { useFilter } from '../store/FilterContext'
import { useTokens, usePrefersReducedMotion } from '../store/ThemeContext'
import { useToday, hariIniISO } from '../store/today'
import { offsetToDate, formatTanggal, indexOfDate } from '../store/dates'
import { buildEnvelope, sampel } from '../lib/series'
import { proyeksiBand, inLebaranWindow, LEBARAN_DATES } from '../lib/proyeksi'
import ChartFrame from './ChartFrame'
import { TooltipKustom } from './tooltip'

export default function ProyeksiChart() {
  const { data: harga } = useData('harga.json')
  const { data: band } = useData('band.json')
  const { data: meta } = useData('meta.json')
  const { komoditas, pasar } = useFilter()
  const t = useTokens()
  const reduced = usePrefersReducedMotion()
  const today = useToday()
  if (!harga || !band || !meta) return <p className="mono">Memuat…</p>

  const b = band.komoditas[komoditas]
  if (!b) return <p className="mono">Band tidak tersedia untuk {komoditas}.</p>

  const perPasar = harga.komoditas[komoditas] || {}
  const serie = pasar === '__semua__'
    ? buildEnvelope(perPasar).map((e) => e.avg)
    : (perPasar[pasar] || [])
  let anchor = null
  for (let i = serie.length - 1; i >= 0; i--) { if (serie[i] != null) { anchor = serie[i]; break } }
  if (anchor == null) return <p className="mono">Tidak ada harga untuk {komoditas}.</p>

  const d0 = meta.tanggal_data_terakhir
  const d0Label = formatTanggal(d0, { pendek: true })
  const awal = harga.tanggal_awal
  const hariIni = hariIniISO(today)
  const d0Off = indexOfDate(awal, d0)
  const todayOff = Math.max(d0Off, indexOfDate(awal, hariIni))
  const startOff = Math.max(0, d0Off - 90)
  const endOff = todayOff + 7
  const lbl = (off) => formatTanggal(offsetToDate(awal, off), { pendek: true })

  const rows = []
  for (let i = startOff; i <= endOff; i++) {
    if (i <= d0Off) {
      rows.push({ t: lbl(i), aktual: serie[i] ?? null })
    } else {
      const p = proyeksiBand(b, anchor, d0, offsetToDate(awal, i))
      rows.push({ t: lbl(i), aktual: null, base: p.p10, span: p.p90 - p.p10, median: p.median })
    }
  }
  const joinIdx = d0Off - startOff
  if (rows[joinIdx]) { rows[joinIdx].median = rows[joinIdx].aktual; rows[joinIdx].base = rows[joinIdx].aktual; rows[joinIdx].span = 0 }

  const hue = inLebaranWindow(hariIni) ? t.cat3 : t.cat2
  const todayLabel = lbl(todayOff)
  const lebaranLabels = LEBARAN_DATES
    .map((d) => { const off = indexOfDate(awal, d); return off >= startOff && off <= endOff ? lbl(off) : null })
    .filter(Boolean)

  return (
    <ChartFrame
      judul={`Proyeksi harga ${komoditas}`}
      caption={`Garis solid = harga aktual s/d ${d0Label}. Pita = proyeksi band empiris (p10–p90), melebar seiring waktu. Bukan prediksi model ML.`}
      tabel={{
        kolom: ['Tanggal', 'Aktual', 'Median proyeksi', 'p10', 'p90'],
        baris: sampel(rows).map((r) => [r.t, r.aktual, r.median ?? null, r.base ?? null, r.base != null ? r.base + r.span : null]),
      }}
    >
      <ResponsiveContainer key={`${komoditas}|${pasar}`} width="100%" height={340}>
        <ComposedChart data={rows} margin={{ top: 8, right: 12, bottom: 8, left: 4 }}>
          <defs>
            <linearGradient id="proy" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={hue} stopOpacity={0.22} />
              <stop offset="50%" stopColor={hue} stopOpacity={0.08} />
              <stop offset="100%" stopColor={hue} stopOpacity={0.22} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke={t.line} vertical={false} />
          <XAxis dataKey="t" tick={{ fill: t.inkMuted, fontSize: 11 }} minTickGap={40} />
          <YAxis tick={{ fill: t.inkMuted, fontSize: 11 }} width={72} tickFormatter={(v) => 'Rp ' + v.toLocaleString('id-ID')} />
          <Tooltip content={<TooltipKustom />} />
          <Area dataKey="base" stackId="p" stroke="none" fill="transparent" legendType="none" isAnimationActive={!reduced} />
          <Area dataKey="span" stackId="p" stroke={hue} strokeOpacity={0.4} fill="url(#proy)" name="proyeksi p10–p90" isAnimationActive={!reduced} />
          <Line dataKey="aktual" name="harga aktual" stroke={t.ink} strokeWidth={2} dot={false} connectNulls={false} isAnimationActive={!reduced} />
          <Line dataKey="median" name="median proyeksi" stroke={t.signature} strokeWidth={1.5} strokeDasharray="4 3" dot={false} isAnimationActive={!reduced} />
          <ReferenceLine key={todayLabel} x={todayLabel} stroke={t.signature} strokeWidth={1.5}
            label={{ value: 'HARI INI', position: 'top', fill: t.inkMuted, fontSize: 10, fontFamily: 'var(--font-mono)' }} />
          {lebaranLabels.map((l) => (
            <ReferenceLine key={l} x={l} stroke={t.line} strokeDasharray="2 4"
              label={{ value: 'Lebaran', position: 'top', fill: t.inkMuted, fontSize: 10 }} />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </ChartFrame>
  )
}
