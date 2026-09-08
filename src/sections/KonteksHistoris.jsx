import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useData } from '../store/DataContext'
import { useFilter } from '../store/FilterContext'
import { useTokens, usePrefersReducedMotion } from '../store/ThemeContext'
import { offsetToDate, formatTanggal } from '../store/dates'
import { buildEnvelope, sampel } from '../lib/series'
import ChartFrame from '../charts/ChartFrame'
import { TooltipKustom } from '../charts/tooltip'

const pct = (v) => (v == null ? '—' : `${v > 0 ? '+' : ''}${v}%`)

export default function KonteksHistoris() {
  const { data: harga } = useData('harga.json')
  const { data: band } = useData('band.json')
  const { komoditas } = useFilter()
  const t = useTokens()
  const reduced = usePrefersReducedMotion()
  if (!harga || !band) return null

  const avg = buildEnvelope(harga.komoditas[komoditas] || {}).map((e) => e.avg)
  const rows = avg
    .map((v, i) => ({ t: formatTanggal(offsetToDate(harga.tanggal_awal, i), { pendek: true }), harga: v }))
    .filter((r) => r.harga != null)
  const b = band.komoditas[komoditas]

  return (
    <>
      <h3>Konteks historis — {komoditas}</h3>
      <ChartFrame
        judul={`Harga rata-rata ${komoditas} · 2 tahun`}
        caption="Rata-rata 9 pasar. Untuk membandingkan pola antar komoditas."
        tabel={{ kolom: ['Tanggal', 'Harga'], baris: sampel(rows).map((r) => [r.t, Math.round(r.harga)]) }}
      >
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={rows} margin={{ top: 8, right: 12, bottom: 8, left: 4 }}>
            <CartesianGrid stroke={t.line} vertical={false} />
            <XAxis dataKey="t" tick={{ fill: t.inkMuted, fontSize: 11 }} minTickGap={48} />
            <YAxis tick={{ fill: t.inkMuted, fontSize: 11 }} width={72} tickFormatter={(v) => 'Rp ' + v.toLocaleString('id-ID')} />
            <Tooltip content={<TooltipKustom />} />
            <Line dataKey="harga" name="harga rata-rata" stroke={t.ink} strokeWidth={2} dot={false} isAnimationActive={!reduced} />
          </LineChart>
        </ResponsiveContainer>
      </ChartFrame>
      {b && (
        <div className="chip-grid">
          {[['normal', 'Kondisi normal'], ['dekat_lebaran', 'Menjelang Lebaran']].map(([key, judul]) => (
            <div key={key} className="panel" style={{ padding: 16 }}>
              <p className="eyebrow">{judul}</p>
              <div className="mono" style={{ fontSize: '.9rem', fontWeight: 500, color: 'var(--ink)', marginTop: 4 }}>
                Median {pct(b[key]?.median)} · p10 {pct(b[key]?.p10)} · p90 {pct(b[key]?.p90)}
              </div>
              <div className="mono" style={{ fontSize: '.75rem', color: 'var(--ink-muted)', marginTop: 4 }}>
                lebar band {b[key]?.lebar_band}% · n={b[key]?.n}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  )
}
