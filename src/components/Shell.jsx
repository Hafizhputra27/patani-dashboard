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
    <div className="app-wrapper">
      <div className="app-shell">
        {/* Left Sidebar Navigation (EdgesPay SaaS Style) */}
        <aside className="sidebar">
          <div className="sidebar__brand">
            <div className="sidebar__logo-icon">🌱</div>
            <span className="sidebar__brand-name">Patani</span>
          </div>

          <nav className="sidebar__nav mono">
            <RouteLink to="/" className="sidebar__link">
              <span className="sidebar__icon">📊</span>
              <span>Eksplorasi</span>
            </RouteLink>
            <RouteLink to="/prediksi" className="sidebar__link">
              <span className="sidebar__icon">🤖</span>
              <span>Prediksi Model</span>
            </RouteLink>
          </nav>

          <div className="sidebar__footer mono">
            <div className="sidebar__data-badge">
              <div style={{ fontSize: '.7rem', color: 'var(--ink-muted)' }}>Status Data:</div>
              <strong style={{ fontSize: '.78rem', color: 'var(--ink)' }}>
                s/d {meta ? formatTanggal(meta.tanggal_data_terakhir, { pendek: true }) : '…'}
              </strong>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
              <span className="jam-hidup" style={{ fontSize: '.72rem', color: 'var(--ink-muted)' }}>
                {formatTanggal(today, { pendek: true, lokal: true })} · {String(today.getHours()).padStart(2, '0')}:{String(today.getMinutes()).padStart(2, '0')}
              </span>
              <ThemeToggle />
            </div>
          </div>
        </aside>

        {/* Main Content Workspace */}
        <div className="main-workspace">
          {/* Top Bar Header */}
          <header className="topbar">
            <div className="topbar__left">
              <h1 className="topbar__greeting">Harga Pangan · Kab. Bandung</h1>
              <p className="topbar__subtext">Pusat informasi harga harian, analisis tren, dan prediksi panen.</p>
            </div>
            <div className="topbar__right">
              <KomoditasPicker />
              <Selector kind="pasar" />
              <Selector kind="rentang" />
            </div>
          </header>

          {/* Body Section Content */}
          <main className="content-body">
            <Route path="/"><Eksplorasi /></Route>
            <Route path="/prediksi"><Prediksi /></Route>
          </main>

          {/* Footer Notes */}
          <footer className="mono" style={{ color: 'var(--ink-muted)', fontSize: '.75rem', padding: '1.5rem 28px', borderTop: '1px solid var(--line)' }}>
            {meta?.catatan?.map((c, i) => <p key={i} style={{ margin: '3px 0' }}>• {c}</p>)}
          </footer>
        </div>
      </div>
    </div>
  )
}
