import { useEffect, useState } from 'react'
import { useRoute, Route, RouteLink } from '../router'
import { useData } from '../store/DataContext'
import { formatTanggal } from '../store/dates'
import { useToday } from '../store/today'
import Selector from './Selector'
import KomoditasPicker from './KomoditasPicker'
import Ringkasan from '../pages/Ringkasan'
import Eksplorasi from '../pages/Eksplorasi'
import Prediksi from '../pages/Prediksi'
import CuacaKurs from '../sections/CuacaKurs'
import RekomendasiBand from '../sections/RekomendasiBand'
import RingkasanRiset from '../sections/RingkasanRiset'
import { LogoIcon, DashboardIcon, StoreIcon, PredictionIcon, WeatherIcon, RecommendationIcon, BookOpenIcon } from './Icons'

const ROUTES = ['/', '/eksplorasi', '/prediksi', '/cuaca', '/rekomendasi', '/riset']
const SECTION_CLASS = { '/cuaca': 'card', '/rekomendasi': 'card', '/riset': 'card' }

export default function Shell() {
  const { data: meta } = useData('meta.json')
  const { path, navigate } = useRoute()
  const today = useToday()
  const [sideOpen, setSideOpen] = useState(true)
  useEffect(() => { if (!ROUTES.includes(path)) navigate('/') }, [path, navigate])
  useEffect(() => {
    const reduced = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.querySelector('.main-workspace')?.scrollTo?.({ top: 0, behavior: reduced ? 'auto' : 'smooth' })
  }, [path])

  return (
    <div className="app-wrapper">
      <div className={sideOpen ? 'app-shell' : 'app-shell nav-closed'}>
        {/* Left Sidebar Navigation (EdgesPay SaaS Style) */}
        <aside className="sidebar" id="sidebar-nav" aria-label="Navigasi utama">
          <div className="sidebar__brand">
            <div className="sidebar__logo-icon">
              <LogoIcon size={18} />
            </div>
            <span className="sidebar__brand-name">Patani</span>
          </div>

          <nav className="sidebar__nav mono">
            <RouteLink to="/" className={({ isActive }) => 'sidebar__link' + (isActive ? ' sidebar__link--active' : '')}>
              <DashboardIcon size={17} />
              <span>Ringkasan</span>
            </RouteLink>
            <RouteLink to="/eksplorasi" className={({ isActive }) => 'sidebar__link' + (isActive ? ' sidebar__link--active' : '')}>
              <StoreIcon size={17} />
              <span>Eksplorasi Pasar</span>
            </RouteLink>
            <RouteLink to="/prediksi" className={({ isActive }) => 'sidebar__link' + (isActive ? ' sidebar__link--active' : '')}>
              <PredictionIcon size={17} />
              <span>Prediksi Model</span>
            </RouteLink>
            <RouteLink to="/cuaca" className={({ isActive }) => 'sidebar__link' + (isActive ? ' sidebar__link--active' : '')}>
              <WeatherIcon size={17} />
              <span>Cuaca & Kurs</span>
            </RouteLink>
            <RouteLink to="/rekomendasi" className={({ isActive }) => 'sidebar__link' + (isActive ? ' sidebar__link--active' : '')}>
              <RecommendationIcon size={17} />
              <span>Rekomendasi</span>
            </RouteLink>
            <RouteLink to="/riset" className={({ isActive }) => 'sidebar__link' + (isActive ? ' sidebar__link--active' : '')}>
              <BookOpenIcon size={17} />
              <span>Riset Metodologi</span>
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
            </div>
          </div>
        </aside>

        {/* Main Content Workspace */}
        <div className="main-workspace">
          {/* Top Bar Header */}
          <header className="topbar">
            <div className="topbar__left">
              <button
                type="button"
                className="nav-toggle"
                aria-label={sideOpen ? 'Sembunyikan menu navigasi' : 'Tampilkan menu navigasi'}
                aria-expanded={sideOpen}
                aria-controls="sidebar-nav"
                onClick={() => setSideOpen((s) => !s)}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  {sideOpen
                    ? <><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></>
                    : <><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" /></>}
                </svg>
              </button>
              <div>
                <h1 className="topbar__greeting">Harga Pangan · Kab. Bandung</h1>
                <p className="topbar__subtext">Pusat informasi harga harian, analisis tren, dan prediksi panen.</p>
              </div>
            </div>
            <div className="topbar__right">
              <KomoditasPicker />
              <Selector kind="pasar" />
              <Selector kind="rentang" />
            </div>
          </header>

          {/* Body Section Content */}
          <main className="content-body">
            <Route path="/"><Ringkasan /></Route>
            <Route path="/eksplorasi"><Eksplorasi /></Route>
            <Route path="/prediksi"><Prediksi /></Route>
            <Route path="/cuaca"><div className={SECTION_CLASS['/cuaca']}><CuacaKurs /></div></Route>
            <Route path="/rekomendasi"><div className={SECTION_CLASS['/rekomendasi']}><RekomendasiBand /></div></Route>
            <Route path="/riset"><div className={SECTION_CLASS['/riset']}><RingkasanRiset /></div></Route>
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
