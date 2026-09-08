import { useEffect } from 'react'
import { useRoute, Route, RouteLink } from '../router'
import { useData } from '../store/DataContext'
import { formatTanggal } from '../store/dates'
import { useToday } from '../store/today'
import Selector from './Selector'
import KomoditasPicker from './KomoditasPicker'
import ThemeToggle from './ThemeToggle'
import Eksplorasi from '../pages/Eksplorasi'
import Prediksi from '../pages/Prediksi'

const ROUTES = ['/', '/prediksi']

export default function Shell() {
  const { data: meta } = useData('meta.json')
  const { path, navigate } = useRoute()
  const today = useToday()
  useEffect(() => { if (!ROUTES.includes(path)) navigate('/') }, [path, navigate])

  return (
    <>
      <header className="site-header">
        <div className="wrap" style={{ display: 'flex', alignItems: 'center', gap: 16, height: 60 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--accent)' }} />
            <strong style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', color: 'var(--ink)' }}>
              Harga Pangan · Kab. Bandung
            </strong>
          </div>
          <span className="mono jam-hidup" style={{ color: 'var(--ink-muted)', fontSize: '.75rem' }}>
            {formatTanggal(today, { pendek: true, lokal: true })} · {String(today.getHours()).padStart(2, '0')}:{String(today.getMinutes()).padStart(2, '0')}
          </span>
          <nav style={{ display: 'flex', gap: 8, marginLeft: 'auto' }} className="mono">
            <RouteLink to="/">Eksplorasi</RouteLink>
            <RouteLink to="/prediksi">Prediksi Model</RouteLink>
          </nav>
          <ThemeToggle />
        </div>
      </header>
      <div className="subbar">
        <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: 14, alignItems: 'flex-end', padding: '12px 0' }}>
          <span className="mono" style={{ color: 'var(--ink-muted)', fontSize: '.8rem', paddingBottom: 4 }}>
            Data s/d {meta ? formatTanggal(meta.tanggal_data_terakhir, { pendek: true }) : '…'}
          </span>
          <KomoditasPicker />
          <Selector kind="pasar" />
          <Selector kind="rentang" />
        </div>
      </div>
      <main className="wrap">
        <Route path="/"><Eksplorasi /></Route>
        <Route path="/prediksi"><Prediksi /></Route>
      </main>
      <footer className="wrap mono" style={{ color: 'var(--ink-muted)', fontSize: '.75rem', padding: '3rem 0', borderTop: '1px solid var(--line)', marginTop: '4rem' }}>
        {meta?.catatan?.map((c, i) => <p key={i} style={{ margin: '4px 0' }}>• {c}</p>)}
      </footer>
    </>
  )
}
