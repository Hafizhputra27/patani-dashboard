import { DataProvider, useData } from './store/DataContext'
import { FilterProvider } from './store/FilterContext'
import { ThemeProvider } from './store/ThemeContext'
import ThemeToggle from './components/ThemeToggle'
import Selector from './components/Selector'
import { formatTanggal } from './store/dates'
import Hero from './sections/Hero'
import EksplorasiHarga from './sections/EksplorasiHarga'
import CuacaKurs from './sections/CuacaKurs'
import PrediksiModel from './sections/PrediksiModel'
import RekomendasiBand from './sections/RekomendasiBand'
import RingkasanRiset from './sections/RingkasanRiset'

const NAV = [
  ['eksplorasi', 'Eksplorasi Harga'],
  ['cuaca', 'Cuaca & Kurs'],
  ['prediksi', 'Prediksi Model'],
  ['band', 'Rekomendasi'],
  ['riset', 'Ringkasan Riset'],
]

function Shell() {
  const { data: meta } = useData('meta.json')
  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap" style={{ display: 'flex', alignItems: 'center', gap: 16, height: 56 }}>
          <strong style={{ fontFamily: 'var(--font-display)' }}>● Harga Hasil Bumi · Kab. Bandung</strong>
          <nav style={{ display: 'flex', gap: 14, marginLeft: 'auto' }} className="mono">
            {NAV.map(([id, t]) => (
              <a key={id} href={`#${id}`} style={{ color: 'var(--ink-muted)', textDecoration: 'none', fontSize: '.8rem' }}>{t}</a>
            ))}
          </nav>
          <ThemeToggle />
        </div>
      </header>
      <div style={{ position: 'sticky', top: 56, zIndex: 19, background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap" style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end', padding: '10px 0' }}>
          <span className="mono" style={{ color: 'var(--ink-muted)', fontSize: '.8rem' }}>
            Data s/d {meta ? formatTanggal(meta.tanggal_data_terakhir, { pendek: true }) : '…'}
          </span>
          <Selector kind="komoditas" />
          <Selector kind="pasar" />
          <Selector kind="rentang" />
        </div>
      </div>
      <main className="wrap">
        <Hero />
        <section id="eksplorasi"><EksplorasiHarga /></section>
        <section id="cuaca"><CuacaKurs /></section>
        <section id="prediksi"><PrediksiModel /></section>
        <section id="band"><RekomendasiBand /></section>
        <section id="riset"><RingkasanRiset /></section>
      </main>
      <footer className="wrap mono" style={{ color: 'var(--ink-muted)', fontSize: '.75rem', padding: '3rem 0' }}>
        {meta?.catatan?.map((c, i) => <p key={i}>{c}</p>)}
      </footer>
    </>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <FilterProvider>
          <Shell />
        </FilterProvider>
      </DataProvider>
    </ThemeProvider>
  )
}
