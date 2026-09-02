# Glass Redesign + Halaman Prediksi + Tanggal Hidup — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Pisah dashboard jadi 2 route hash (`#/` eksplorasi, `#/prediksi` model), tambah jam hidup + proyeksi band empiris bergulir yang bergerak per hari, dan redesign visual ke "tempered glass" (panel kaca di atas gradient-mesh gelap, aksen lime, komponen timeline interaktif, pemilih komoditas chip-grid).

**Architecture:** SPA React 18 + Vite tetap statis, tanpa dependency runtime baru. Routing hash ditulis tangan (`useSyncExternalStore` + `hashchange`). `FilterContext` hidup di root lintas route, disinkron ke URL query. Proyeksi = fungsi murni `proyeksiBand()` atas `band.json` (bukan model ML). Lapisan visual: token `:root` baru + `glass.css` + komponen `<Glass>`, komponen lama di-restyle jadi class-based.

**Tech Stack:** React 18, Vite 5, Recharts 2, Vitest + @testing-library/react + jsdom. Google Fonts (IBM Plex Sans, IBM Plex Mono — Fraunces dibuang).

**Spec:** `docs/superpowers/specs/2026-09-03-glass-redesign-prediksi-page-design.md` (baca bersama plan ini). PRD dasar: `docs/dashboard-PRD.md`. Design-doc lama `docs/dashboard-design.md` §1–2/§7/§11–12 digantikan spec §6.

## Global Constraints

- **Dependency runtime: hanya `react`, `react-dom`, `recharts`.** Routing, hooks, semua ditulis tangan. Tidak ada `react-router`, tidak ada lib state, tidak ada lib animasi.
- **Tanpa backend / API eksternal.** Hanya `fetch('/data/<file>.json')` relatif. "Hari ini" dari `Date` browser saja.
- **Model ML tidak jalan di browser.** Angka model dari `prediksi.json` ditampilkan apa adanya + label "dihitung dari 22 Agu 2026". Tidak digeser.
- **Setiap angka prediksi model dirender berpasangan baseline + label `model historis +X% MAE`.** Tidak pernah angka model sendirian.
- **Proyeksi bergulir = band empiris, WAJIB berlabel** caption persis: `"Proyeksi dari distribusi historis pergerakan harga 7-hari, bukan prediksi bergulir model ML. Data harga aktual berakhir 22 Agu 2026 — makin jauh dari tanggal itu, rentang makin lebar."`
- **Bahasa Indonesia.** `<html lang="id">`.
- **Warna chart dari `tokens.js`** (hex solid, bukan `var()`), tema-aware. Palet seri colorblind-safe (`cat1/cat2/cat3`) TIDAK berubah. Aksen lime `--accent` bukan warna seri.
- **3 komoditas caveat** (`BAWANG MERAH BATU`, `SAYURAN KENTANG LOKAL`, `KACANG TANAH KUPAS`) & sel kosong ditandai eksplisit.
- **Tiap chart:** `<Legend>` untuk ≥2 seri, teks token (bukan warna seri), `<TabelView>` dalam `<details>`, `isAnimationActive={!prefersReducedMotion}`, `role="img"` + `aria-label` via `ChartFrame`.
- **Satu y-axis per chart.**
- `prefers-reduced-motion`, `prefers-reduced-transparency`, `forced-colors` dihormati. `:focus-visible` 2px `--accent`. Target sentuh ≥ 40px. Body tak pernah scroll horizontal.
- Commit setelah tiap task. Conventional commit.
- Test dijalankan: `npx vitest run`. Semua hijau di akhir tiap task.

---

## File Structure (delta terhadap kondisi sekarang)

**Baru:**
- `src/router.jsx` — `useRoute`, `Route`, `RouteLink`, `parseHash`
- `src/store/today.js` — `useToday`, `hariIniISO`
- `src/lib/proyeksi.js` — `proyeksiBand`, `inLebaranWindow`, `LEBARAN_DATES`
- `src/components/Glass.jsx` — primitive panel kaca / kartu tone
- `src/components/Shell.jsx` — header + sub-bar + footer + `<Route>` (dipisah dari `App.jsx`)
- `src/components/KomoditasPicker.jsx` — chip grid + search
- `src/components/Timeline.jsx` — rel + 3 kartu + scrubber
- `src/pages/Eksplorasi.jsx` — rakitan section `#/`
- `src/pages/Prediksi.jsx` — rakitan section `#/prediksi`
- `src/sections/ProyeksiBergulir.jsx` — kartu headline + `<ProyeksiChart>`
- `src/sections/KonteksHistoris.jsx` — mini line-chart + kartu angka band
- `src/charts/ProyeksiChart.jsx` — aktual + pita proyeksi + garis HARI INI
- `src/glass.css` — background mesh + `.glass*` + guard a11y

**Diubah:**
- `src/App.jsx` — susut jadi provider + `<Shell>`
- `src/store/FilterContext.jsx` — init dari URL query + `replaceState` sync
- `src/store/ThemeContext.jsx` — tak berubah (dipakai apa adanya)
- `src/tokens.js` — nilai `ink/inkMuted/line/surface/bg/brand/signature` per tema
- `src/styles.css` — `:root` token baru + utility layout (`.subbar`, `.chip*`, `.timeline*`, dll)
- `src/components/Selector.jsx` — hapus cabang `komoditas` (tinggal pasar/rentang)
- `src/components/{ChartFrame,StatTile,PrediksiChip,BadgeCaveat,BannerKejujuran,ThemeToggle}.jsx` — restyle class-based
- `src/sections/{Hero,EksplorasiHarga,CuacaKurs,RekomendasiBand,RingkasanRiset}.jsx` — wrapper glass; `RingkasanRiset` pakai `<Timeline>`
- `src/charts/*.jsx` — restyle otomatis via `ChartFrame`
- `index.html` — `<link>` font tanpa Fraunces
- `src/test-setup.jsx`, `src/test-fixtures.jsx` — tambah helper

**Dihapus:**
- `src/sections/PrediksiModel.jsx` (+ `PrediksiModel.test.jsx`) — dipecah ke `pages/Prediksi.jsx` + `sections/ProyeksiBergulir.jsx`

---

## Task 1: Hash router

**Files:**
- Create: `src/router.jsx`
- Test: `src/router.test.jsx`

**Interfaces:**
- Produces:
  - `parseHash(hash: string) → { path: string, query: URLSearchParams }` — `path` dinormalisasi (leading `/`, tanpa trailing `/`, root = `'/'`)
  - `useRoute() → { path: string, query: URLSearchParams, navigate(to: string): void }`
  - `<Route path="/x">{children}</Route>` — render children hanya bila `path === "/x"`
  - `<RouteLink to="/x" {...aProps}>{children}</RouteLink>` — `<a href="#/x">` + `aria-current="page"` saat aktif

- [ ] **Step 1: Write the failing test — `src/router.test.jsx`**

```jsx
import { render, screen, act } from '@testing-library/react'
import { parseHash, useRoute, Route, RouteLink } from './router'

test('parseHash normalizes path and reads query', () => {
  expect(parseHash('#/').path).toBe('/')
  expect(parseHash('').path).toBe('/')
  expect(parseHash('#/prediksi/').path).toBe('/prediksi')
  const { path, query } = parseHash('#/prediksi?k=CABE%20MERAH&r=1thn')
  expect(path).toBe('/prediksi')
  expect(query.get('k')).toBe('CABE MERAH')
  expect(query.get('r')).toBe('1thn')
})

function Probe() {
  const { path, navigate } = useRoute()
  return <button onClick={() => navigate('/prediksi')}>{path}</button>
}

test('useRoute tracks hash and navigate updates it', () => {
  window.location.hash = '#/'
  render(<Probe />)
  const b = screen.getByRole('button')
  expect(b).toHaveTextContent('/')
  act(() => b.click())
  expect(b).toHaveTextContent('/prediksi')
  expect(window.location.hash).toBe('#/prediksi')
})

test('Route renders only on match; RouteLink marks current', () => {
  window.location.hash = '#/prediksi'
  render(
    <>
      <Route path="/"><span>home</span></Route>
      <Route path="/prediksi"><span>pred</span></Route>
      <RouteLink to="/prediksi">link</RouteLink>
    </>,
  )
  expect(screen.queryByText('home')).toBeNull()
  expect(screen.getByText('pred')).toBeInTheDocument()
  expect(screen.getByRole('link', { name: 'link' })).toHaveAttribute('aria-current', 'page')
})
```

- [ ] **Step 2: Run — `npx vitest run src/router.test.jsx`** → FAIL (module not found)

- [ ] **Step 3: Implement `src/router.jsx`**

```jsx
import { useSyncExternalStore } from 'react'

const listeners = new Set()
function emit() { listeners.forEach((l) => l()) }
if (typeof window !== 'undefined') window.addEventListener('hashchange', emit)

function subscribe(cb) { listeners.add(cb); return () => listeners.delete(cb) }
function snapshot() { return (typeof window !== 'undefined' && window.location.hash) || '#/' }

export function parseHash(hash) {
  const raw = (hash || '#/').replace(/^#/, '')
  const qi = raw.indexOf('?')
  const pathRaw = qi === -1 ? raw : raw.slice(0, qi)
  const qs = qi === -1 ? '' : raw.slice(qi + 1)
  const trimmed = pathRaw.replace(/^\/+|\/+$/g, '')
  return { path: trimmed ? '/' + trimmed : '/', query: new URLSearchParams(qs) }
}

export function useRoute() {
  const hash = useSyncExternalStore(subscribe, snapshot, () => '#/')
  const { path, query } = parseHash(hash)
  const navigate = (to) => { window.location.hash = to.startsWith('#') ? to : '#' + to }
  return { path, query, navigate }
}

export function Route({ path, children }) {
  const { path: current } = useRoute()
  return current === path ? children : null
}

export function RouteLink({ to, children, ...rest }) {
  const { path } = useRoute()
  const target = to.replace(/^#/, '')
  return (
    <a href={'#' + target} aria-current={path === target ? 'page' : undefined} {...rest}>
      {children}
    </a>
  )
}
```

- [ ] **Step 4: Run — `npx vitest run src/router.test.jsx`** → PASS

- [ ] **Step 5: Run full suite — `npx vitest run`** → 27 lama + 3 baru PASS

- [ ] **Step 6: Commit**

```bash
git add src/router.jsx src/router.test.jsx
git commit -m "feat: hash router (useRoute/Route/RouteLink), no deps"
```

---

## Task 2: Shell + pemisahan halaman

**Files:**
- Create: `src/components/Shell.jsx`, `src/pages/Eksplorasi.jsx`, `src/pages/Prediksi.jsx`, `src/pages/Prediksi.test.jsx`
- Modify: `src/App.jsx`, `src/App.test.jsx`, `src/a11y.test.jsx`
- Delete: `src/sections/PrediksiModel.jsx`, `src/sections/PrediksiModel.test.jsx`

**Interfaces:**
- Consumes: `useRoute`, `Route` (Task 1); `useData`, `useFilter`, `formatTanggal`, `Selector`, `ThemeToggle` (sudah ada)
- Produces:
  - `<Shell />` — header (nav route + toggle) + sub-bar (banner tanggal + 3 selector) + `<main>` dengan `<Route>` + footer
  - `<Eksplorasi />` — `<Hero/> <EksplorasiHarga/> <CuacaKurs/> <RekomendasiBand/> <RingkasanRiset/>`
  - `<Prediksi />` — `<BannerKejujuran/> <BacktestChart/>` grid `<PrediksiChip/>` `<MaeHorizonChart/>`

- [ ] **Step 1: Write the failing test — `src/pages/Prediksi.test.jsx`**

```jsx
import { render, screen, waitFor } from '@testing-library/react'
import { DataProvider } from '../store/DataContext'
import { FilterProvider } from '../store/FilterContext'
import { ThemeProvider } from '../store/ThemeContext'
import Prediksi from './Prediksi'
import { stubFetchAll } from '../test-fixtures'

beforeEach(() => stubFetchAll())
const wrap = (ui) => <ThemeProvider><DataProvider><FilterProvider>{ui}</FilterProvider></DataProvider></ThemeProvider>

test('halaman prediksi: banner + backtest + chip model/baseline + MAE', async () => {
  render(wrap(<Prediksi />))
  await waitFor(() => expect(screen.getByText(/dihitung dari data terakhir/i)).toBeInTheDocument())
  expect(screen.getAllByText(/35\.000/).length).toBeGreaterThan(0)
  expect(screen.getAllByText(/35\.111/).length).toBeGreaterThan(0)
  expect(screen.getAllByText(/\+40/).length).toBeGreaterThan(0)
  expect(screen.getByText(/MAE model vs baseline per horizon/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Update `src/App.test.jsx`**

```jsx
import { render, screen, waitFor, act } from '@testing-library/react'
import App from './App'
import { stubFetchAll } from './test-fixtures'

beforeEach(() => { stubFetchAll(); window.location.hash = '#/' })

test('shell: nav route, banner tanggal, section eksplorasi di #/', async () => {
  render(<App />)
  await waitFor(() => expect(screen.getAllByText(/22 Agu 2026/).length).toBeGreaterThan(0))
  for (const id of ['eksplorasi', 'cuaca', 'band', 'riset']) {
    expect(document.getElementById(id)).toBeInTheDocument()
  }
  expect(screen.getByRole('link', { name: /Eksplorasi/i })).toHaveAttribute('href', '#/')
  expect(screen.getByRole('link', { name: /Prediksi Model/i })).toHaveAttribute('href', '#/prediksi')
})

test('navigasi ke #/prediksi menampilkan konten model', async () => {
  render(<App />)
  await waitFor(() => expect(screen.getByRole('link', { name: /Prediksi Model/i })).toBeInTheDocument())
  act(() => { window.location.hash = '#/prediksi' })
  await waitFor(() => expect(screen.getByText(/dihitung dari data terakhir/i)).toBeInTheDocument())
})
```

- [ ] **Step 3: Update `src/a11y.test.jsx`** — ganti test "nav links point to existing section ids" jadi:

```jsx
test('nav route links valid + charts punya table view di kedua route', async () => {
  window.location.hash = '#/'
  render(<App />)
  await waitFor(() => expect(screen.getAllByText('Lihat sebagai tabel').length).toBeGreaterThanOrEqual(3))
  document.querySelectorAll('header nav a[href^="#/"]').forEach((a) => {
    expect(['#/', '#/prediksi']).toContain(a.getAttribute('href'))
  })
})
```
(Sisakan test lain apa adanya; test `charts expose role=img` sudah query `div[role="img"]` — tetap valid.)

- [ ] **Step 4: Run — `npx vitest run src/App.test.jsx src/pages/Prediksi.test.jsx`** → FAIL

- [ ] **Step 5: Implement `src/pages/Eksplorasi.jsx`**

```jsx
import Hero from '../sections/Hero'
import EksplorasiHarga from '../sections/EksplorasiHarga'
import CuacaKurs from '../sections/CuacaKurs'
import RekomendasiBand from '../sections/RekomendasiBand'
import RingkasanRiset from '../sections/RingkasanRiset'

export default function Eksplorasi() {
  return (
    <>
      <Hero />
      <section id="eksplorasi"><EksplorasiHarga /></section>
      <section id="cuaca"><CuacaKurs /></section>
      <section id="band"><RekomendasiBand /></section>
      <section id="riset"><RingkasanRiset /></section>
    </>
  )
}
```

- [ ] **Step 6: Implement `src/pages/Prediksi.jsx`** (pindahan isi `PrediksiModel.jsx`, tanpa `<p className="eyebrow">`/`<h2>` ganda — itu jadi tanggung jawab section)

```jsx
import { useData } from '../store/DataContext'
import { useFilter } from '../store/FilterContext'
import BannerKejujuran from '../components/BannerKejujuran'
import PrediksiChip from '../components/PrediksiChip'
import BacktestChart from '../charts/BacktestChart'
import MaeHorizonChart from '../charts/MaeHorizonChart'

export default function Prediksi() {
  const { data: pred } = useData('prediksi.json')
  const { data: backtest } = useData('backtest.json')
  const { data: riset } = useData('riset.json')
  const { data: meta } = useData('meta.json')
  const { komoditas, pasar } = useFilter()
  if (!pred || !backtest || !riset || !meta) return <p className="mono">Memuat…</p>

  const barisKom = pred.baris.filter((r) => r.komoditas === komoditas)
  const byPasar = Object.fromEntries(barisKom.map((r) => [r.pasar, r]))
  const pasarAktif = pasar === '__semua__' ? meta.pasar[0] : pasar
  const seri = backtest.komoditas[komoditas]?.[pasarAktif]

  return (
    <div id="prediksi">
      <p className="eyebrow">Prediksi Model</p>
      <h2>Apa yang model ML katakan — dan seberapa akurat</h2>
      <BannerKejujuran tanggal={meta.tanggal_data_terakhir} />

      {/* Task 8 menyisipkan <ProyeksiBergulir /> di sini */}

      <h3>Backtest (uji pada data yang sudah lewat)</h3>
      <BacktestChart seri={seri} komoditas={komoditas} pasar={pasarAktif} />

      <h3>Prediksi ke depan — {komoditas}</h3>
      <div className="chip-grid">
        {meta.pasar.map((p) => <PrediksiChip key={p} row={byPasar[p]} />)}
      </div>

      <h3>Ringkasan akurasi per horizon</h3>
      <MaeHorizonChart horizonDirect={riset.horizon_direct} />

      {/* Task 11 menyisipkan <KonteksHistoris /> di sini */}
    </div>
  )
}
```

- [ ] **Step 7: Implement `src/components/Shell.jsx`**

```jsx
import { useEffect } from 'react'
import { useRoute, Route, RouteLink } from '../router'
import { useData } from '../store/DataContext'
import { formatTanggal } from '../store/dates'
import Selector from './Selector'
import ThemeToggle from './ThemeToggle'
import Eksplorasi from '../pages/Eksplorasi'
import Prediksi from '../pages/Prediksi'

const ROUTES = ['/', '/prediksi']

export default function Shell() {
  const { data: meta } = useData('meta.json')
  const { path, navigate } = useRoute()
  useEffect(() => { if (!ROUTES.includes(path)) navigate('/') }, [path, navigate])

  return (
    <>
      <header style={{ position: 'sticky', top: 0, zIndex: 20, background: 'var(--surface)', borderBottom: '1px solid var(--line)' }}>
        <div className="wrap" style={{ display: 'flex', alignItems: 'center', gap: 16, height: 56 }}>
          <strong style={{ fontFamily: 'var(--font-display)' }}>● Harga Hasil Bumi · Kab. Bandung</strong>
          <nav style={{ display: 'flex', gap: 14, marginLeft: 'auto' }} className="mono">
            <RouteLink to="/" style={{ color: 'var(--ink-muted)', textDecoration: 'none', fontSize: '.8rem' }}>Eksplorasi</RouteLink>
            <RouteLink to="/prediksi" style={{ color: 'var(--ink-muted)', textDecoration: 'none', fontSize: '.8rem' }}>Prediksi Model</RouteLink>
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
        <Route path="/"><Eksplorasi /></Route>
        <Route path="/prediksi"><Prediksi /></Route>
      </main>
      <footer className="wrap mono" style={{ color: 'var(--ink-muted)', fontSize: '.75rem', padding: '3rem 0' }}>
        {meta?.catatan?.map((c, i) => <p key={i}>{c}</p>)}
      </footer>
    </>
  )
}
```

- [ ] **Step 8: Rewrite `src/App.jsx`**

```jsx
import { DataProvider } from './store/DataContext'
import { FilterProvider } from './store/FilterContext'
import { ThemeProvider } from './store/ThemeContext'
import Shell from './components/Shell'

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
```

- [ ] **Step 9: Delete `src/sections/PrediksiModel.jsx` and `src/sections/PrediksiModel.test.jsx`**

```bash
git rm src/sections/PrediksiModel.jsx src/sections/PrediksiModel.test.jsx
```

- [ ] **Step 10: Add `.chip-grid` to `src/styles.css`** (jika belum ada — dipakai grid PrediksiChip)

```css
.chip-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 12px; margin: 12px 0; }
```

- [ ] **Step 11: Run — `npx vitest run`** → semua PASS

- [ ] **Step 12: Verify — `npm run dev`**, buka `#/` lalu klik "Prediksi Model" → route berubah, konten model muncul, tak ada error console.

- [ ] **Step 13: Commit**

```bash
git add -A
git commit -m "feat: split into #/ and #/prediksi routes via Shell + pages"
```

---

## Task 3: Token warna baru + lapisan kaca

**Files:**
- Modify: `src/styles.css`, `src/tokens.js`, `src/tokens.test.js`, `src/main.jsx`, `index.html`
- Create: `src/glass.css`, `src/components/Glass.jsx`, `src/components/Glass.test.jsx`

**Interfaces:**
- Produces:
  - CSS: `:root` token baru (spec §6.1) + alias sementara `--bg`, `--brand`, `--surface`, `--surface-2` (dihapus Task 4)
  - `.glass`, `.glass--pale`, `.glass--lime`, `.glass--dark` (glass.css)
  - `<Glass as="div" tone="default|pale|lime|dark" className style {...rest}>` → elemen dengan class kaca
  - `getTokens(theme)` nilai baru (spec §6.1)

- [ ] **Step 1: Write the failing test — `src/components/Glass.test.jsx`**

```jsx
import { render, screen } from '@testing-library/react'
import Glass from './Glass'

test('Glass default → .glass; tone → .glass--tone; as + props diteruskan', () => {
  const { rerender } = render(<Glass>isi</Glass>)
  expect(screen.getByText('isi')).toHaveClass('glass')

  rerender(<Glass tone="lime" className="x">isi</Glass>)
  const el = screen.getByText('isi')
  expect(el).toHaveClass('glass', 'glass--lime', 'x')

  rerender(<Glass as="section" aria-label="panel">isi</Glass>)
  expect(screen.getByLabelText('panel').tagName).toBe('SECTION')
})
```

- [ ] **Step 2: Update `src/tokens.test.js`**

```js
import { getTokens } from './tokens'

test('getTokens: dark cat3 amber tetap, seri colorblind-safe tak berubah', () => {
  expect(getTokens('dark').cat3).toBe('#B27B27')
  expect(getTokens('light').cat3).toBe('#E69F00')
  expect(getTokens('dark').cat1).toBe('#3C97D4')
})
test('getTokens: default light, bg + ink baru', () => {
  expect(getTokens(undefined).bg).toBe('#EEF3E9')
  expect(getTokens('dark').bg).toBe('#0B1410')
  expect(getTokens('dark').ink).toBe('#F2F6F0')
})
test('kontras ink-muted vs bg >= 4.5:1 kedua tema', () => {
  const lum = (hex) => {
    const c = [0, 2, 4].map((i) => parseInt(hex.slice(1 + i, 3 + i), 16) / 255)
      .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4))
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2]
  }
  const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05) }
  for (const th of ['light', 'dark']) {
    const t = getTokens(th)
    expect(ratio(t.inkMuted, t.bg)).toBeGreaterThanOrEqual(4.5)
  }
})
```

- [ ] **Step 3: Run — `npx vitest run src/tokens.test.js src/components/Glass.test.jsx`** → FAIL

- [ ] **Step 4: Rewrite `src/tokens.js`**

```js
const LIGHT = {
  ink: '#12201A', inkMuted: '#46564C', line: '#B9C6B0', surface: '#F8FAF5', bg: '#EEF3E9',
  brand: '#3C8E1C', signature: '#8AB84F',
  cat1: '#0072B2', cat2: '#009E73', cat3: '#E69F00',
  naik: '#2C7A4B', turun: '#B5502F', stabil: '#7B8470',
  rain: '#3C7A9E', temp: '#C46A3C',
}
const DARK = {
  ink: '#F2F6F0', inkMuted: '#9FB098', line: '#2E3A30', surface: '#141E19', bg: '#0B1410',
  brand: '#93E84D', signature: '#A6D26A',
  cat1: '#3C97D4', cat2: '#12A97F', cat3: '#B27B27',
  naik: '#69B487', turun: '#D9805E', stabil: '#8C9580',
  rain: '#5FA0C4', temp: '#D98C5E',
}
export const getTokens = (theme) => (theme === 'dark' ? DARK : LIGHT)
```

> Jika test kontras gagal untuk salah satu nilai `inkMuted`, gelapkan (light) / terangkan (dark) 1–2 langkah sampai lolos, lalu samakan nilainya di `styles.css` `:root`.

- [ ] **Step 5: Implement `src/components/Glass.jsx`**

```jsx
export default function Glass({ as: As = 'div', tone = 'default', className = '', children, ...rest }) {
  const cls = ['glass', tone !== 'default' && `glass--${tone}`, className].filter(Boolean).join(' ')
  return <As className={cls} {...rest}>{children}</As>
}
```

- [ ] **Step 6: Rewrite `:root` block di `src/styles.css`** (ganti blok `:root`/`@media dark`/`[data-theme=dark]` lama dengan ini; sisakan reset + layout di bawahnya)

```css
:root {
  --bg-base:#EEF3E9; --ink:#12201A; --ink-muted:#46564C; --line:rgba(18,32,26,.14);
  --accent:#3C8E1C; --accent-ink:#0B1410;
  --glass:rgba(255,255,255,.55); --glass-brd:rgba(255,255,255,.75); --glass-hi:rgba(255,255,255,.9);
  --card-pale:#EDF2E7; --card-lime:#93E84D; --card-dark:#10201A;
  --mesh-1:rgba(147,232,77,.10); --mesh-2:rgba(120,150,110,.30); --mesh-3:rgba(90,120,95,.28);
  --r:16px;
  --font-display:'IBM Plex Sans',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  --font-body:'IBM Plex Sans',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;
  --font-mono:'IBM Plex Mono','SF Mono','Roboto Mono',ui-monospace,monospace;
  /* alias sementara (dihapus Task 4) */
  --bg:var(--bg-base); --brand:var(--accent); --surface:#F8FAF5; --surface-2:#E7EDE0;
}
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]) {
    --bg-base:#0B1410; --ink:#F2F6F0; --ink-muted:#9FB098; --line:rgba(255,255,255,.10);
    --accent:#93E84D;
    --glass:rgba(255,255,255,.055); --glass-brd:rgba(255,255,255,.14); --glass-hi:rgba(255,255,255,.22);
    --card-pale:#E4EADD; --card-dark:#0C1712;
    --mesh-1:rgba(147,232,77,.10); --mesh-2:rgba(27,59,46,.55); --mesh-3:rgba(14,42,32,.60);
    --surface:#141E19; --surface-2:#1B2620;
  }
}
:root[data-theme="dark"] {
  --bg-base:#0B1410; --ink:#F2F6F0; --ink-muted:#9FB098; --line:rgba(255,255,255,.10);
  --accent:#93E84D;
  --glass:rgba(255,255,255,.055); --glass-brd:rgba(255,255,255,.14); --glass-hi:rgba(255,255,255,.22);
  --card-pale:#E4EADD; --card-dark:#0C1712;
  --surface:#141E19; --surface-2:#1B2620;
}
body { background: var(--bg-base); color: var(--ink); }
```

- [ ] **Step 7: Create `src/glass.css`** (spec §6.2, §6.3)

```css
body::before {
  content:''; position:fixed; inset:0; z-index:-2;
  background:
    radial-gradient(50% 40% at 15% 18%, var(--mesh-1), transparent 70%),
    radial-gradient(45% 45% at 85% 12%, var(--mesh-2), transparent 70%),
    radial-gradient(65% 55% at 72% 92%, var(--mesh-3), transparent 70%),
    var(--bg-base);
}
body::after {
  content:''; position:fixed; inset:0; z-index:-1; opacity:.03; pointer-events:none;
  background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
}
.glass {
  background: var(--glass);
  backdrop-filter: blur(24px) saturate(1.4);
  -webkit-backdrop-filter: blur(24px) saturate(1.4);
  border: 1px solid var(--glass-brd);
  border-radius: var(--r);
  box-shadow: inset 0 1px 0 var(--glass-hi), 0 20px 60px -22px rgba(0,0,0,.5);
}
.glass--pale { background: var(--card-pale); color:#12201A; border-color: transparent; backdrop-filter:none; -webkit-backdrop-filter:none; }
.glass--lime { background: var(--card-lime); color: var(--accent-ink); border-color: transparent; backdrop-filter:none; -webkit-backdrop-filter:none; }
.glass--dark { background: var(--card-dark); color:#F2F6F0; border-color: rgba(255,255,255,.08); backdrop-filter:none; -webkit-backdrop-filter:none; }

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  :root { --glass: rgba(248,250,245,.95); }
  :root[data-theme="dark"], :root:not([data-theme="light"]) { --glass: rgba(18,28,23,.94); }
}
@media (prefers-reduced-transparency: reduce) {
  .glass { backdrop-filter:none; -webkit-backdrop-filter:none; background: var(--surface); }
}
@media (forced-colors: active) {
  .glass, .glass--pale, .glass--lime, .glass--dark {
    background: Canvas; color: CanvasText; border: 1px solid CanvasText;
    backdrop-filter:none; -webkit-backdrop-filter:none;
  }
}
```

- [ ] **Step 8: Import `glass.css` di `src/main.jsx`** — tambah `import './glass.css'` setelah `import './styles.css'`.

- [ ] **Step 9: `index.html`** — ganti `<link href="...Fraunces...">` jadi:

```html
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500&family=IBM+Plex+Sans:wght@400;500;600&display=swap" rel="stylesheet" />
```

- [ ] **Step 10: Run — `npx vitest run`** → semua PASS

- [ ] **Step 11: Verify — `npm run dev`** → background gelap bermesh, teks terbaca, panel lama masih tampil (belum di-restyle). Toggle tema jalan.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: glass design tokens + glass.css layer + Glass component"
```

---

## Task 4: Restyle komponen ke class-based kaca

**Files:**
- Modify: `src/styles.css` (hapus alias, tambah utility), `src/components/{Shell,ChartFrame,StatTile,PrediksiChip,BadgeCaveat,BannerKejujuran,ThemeToggle}.jsx`, `src/sections/{Hero,EksplorasiHarga,CuacaKurs,RekomendasiBand}.jsx`
- Modify jika ada test yang assert inline style: (tidak ada saat ini — semua assert teks/role) — verifikasi ulang saat run.

**Interfaces:**
- Consumes: `.glass*`, `<Glass>` (Task 3)
- Produces: kelas layout `.eyebrow` (revisi), `.panel-glass`, `.stat`, `.stat--lime`, `.subbar`, `.site-header`, `.chip`, `.chip--on` (dipakai Task 9/10 juga)

- [ ] **Step 1: Tambah utility ke `src/styles.css`** (setelah blok reset yang sudah ada; sesuaikan `.eyebrow`)

```css
.eyebrow {
  font-family: var(--font-mono); font-weight: 500; font-size: .7rem;
  letter-spacing: .18em; text-transform: uppercase; color: var(--accent);
  margin: 0 0 .35rem; display: flex; align-items: center; gap: .6rem;
}
.eyebrow::after { content: ''; flex: 1; height: 1px; background: var(--line); }
h1 { font-size: clamp(2rem, 5vw, 3.5rem); line-height: 1.05; letter-spacing: -.02em; }
h2 { font-size: clamp(1.5rem, 3vw, 2.25rem); letter-spacing: -.01em; }
h3 { font-size: 1.1rem; }

.site-header, .subbar { background: color-mix(in srgb, var(--bg-base) 55%, transparent); }
.subbar { position: sticky; top: 56px; z-index: 19; border-bottom: 1px solid var(--line); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }
.site-header { position: sticky; top: 0; z-index: 20; border-bottom: 1px solid var(--line); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); }

.chip {
  font: 500 .8rem/1 var(--font-body); padding: 8px 12px; border-radius: 999px;
  border: 1px solid var(--glass-brd); background: var(--glass); color: var(--ink);
  cursor: pointer; min-height: 34px;
}
.chip--on { background: var(--card-lime); color: var(--accent-ink); border-color: transparent; }
.stat { padding: 12px 14px; border-radius: 12px; }
.stat--lime { background: var(--card-lime); color: var(--accent-ink); }

@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration:.01ms !important; transition-duration:.01ms !important; } }
@media (prefers-reduced-transparency: reduce) { .recharts-area-area { fill-opacity:.2 !important; } .site-header, .subbar { backdrop-filter:none; -webkit-backdrop-filter:none; background: var(--surface); } }
@media (max-width: 640px) {
  .wrap { padding-inline: 1rem; }
  .site-header nav { overflow-x: auto; white-space: nowrap; }
}
```

- [ ] **Step 2: Hapus alias sementara dari `:root`** (`--bg`, `--brand`, `--surface`, `--surface-2`) — lalu grep & ganti sisa pemakaian:

Run: `grep -rn "var(--brand)\|var(--surface-2)\|var(--surface)\|var(--bg)" src/` — untuk tiap hit:
- `var(--brand)` → `var(--accent)`
- `var(--surface)` (background panel) → hapus inline, pakai `className="glass"` / `<Glass>`
- `var(--surface-2)` → `var(--card-pale)` (light inset) atau biarkan lewat `.glass--pale`
- `var(--bg)` → `var(--bg-base)`

> `tokens.js` tetap punya key `surface`/`bg` (untuk Recharts) — itu JS, bukan CSS var, jangan diubah di step ini.

- [ ] **Step 3: Rewrite `src/components/ChartFrame.jsx`**

```jsx
import TabelView from '../components/TabelView'

export default function ChartFrame({ judul, caption, tabel, ariaLabel, children }) {
  return (
    <figure style={{ margin: '0 0 1.5rem' }}>
      {judul && <figcaption className="eyebrow">{judul}</figcaption>}
      <div className="glass" style={{ padding: 16 }} role="img" aria-label={ariaLabel || judul || caption}>
        {children}
      </div>
      {caption && <figcaption className="mono" style={{ fontSize: '.75rem', color: 'var(--ink-muted)', marginTop: 6 }}>{caption}</figcaption>}
      {tabel && (
        <details style={{ marginTop: 6 }}>
          <summary className="mono" style={{ fontSize: '.75rem', color: 'var(--ink-muted)', cursor: 'pointer' }}>Lihat sebagai tabel</summary>
          <TabelView kolom={tabel.kolom} baris={tabel.baris} />
        </details>
      )}
    </figure>
  )
}
```

- [ ] **Step 4: Rewrite `src/components/StatTile.jsx`**

```jsx
export default function StatTile({ label, value, tone }) {
  return (
    <div className={tone === 'lime' ? 'glass stat stat--lime' : 'glass stat'}>
      <div style={{ fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: '1.3rem' }}>{value}</div>
      <div className="mono" style={{ fontSize: '.7rem', textTransform: 'uppercase', letterSpacing: '.08em', opacity: .8 }}>{label}</div>
    </div>
  )
}
```

- [ ] **Step 5: Rewrite `src/components/PrediksiChip.jsx`** — bungkus terluar `<div className="glass" style={{ padding: 14 }}>` (ganti `panel`); dot model `background: 'var(--accent)'`. Sisanya sama.

- [ ] **Step 6: Rewrite `BadgeCaveat.jsx` + `BannerKejujuran.jsx` + `ThemeToggle.jsx`** — ganti `var(--surface-2)`→`var(--card-pale)`, `var(--brand)`→`var(--accent)`, `var(--line)` tetap. `ThemeToggle` border `1px solid var(--glass-brd)`.

- [ ] **Step 7: `Shell.jsx`** — `<header ... className="site-header">` (hapus inline background/position/border, pindah ke class), `<div className="subbar">` untuk sub-bar. Nav link warna `var(--ink-muted)`, aktif (`[aria-current=page]`) → `var(--accent)` (tambah CSS: `.site-header nav a[aria-current="page"]{color:var(--accent)}`).

- [ ] **Step 8: Sections** — di `Hero.jsx`, `EksplorasiHarga.jsx`, `CuacaKurs.jsx`, `RekomendasiBand.jsx`: ganti tiap `<div className="panel" ...>` / `style={{background:'var(--surface)'...}}` jadi `className="glass"`. Grid stat di `EksplorasiHarga`/`Hero` tetap; `StatTile` sudah kaca.

- [ ] **Step 9: Run — `npx vitest run`** → semua PASS (perbaiki selector test yang pecah bila ada — kemungkinan tidak ada karena berbasis teks)

- [ ] **Step 10: Verify — `npm run dev`** → `#/` & `#/prediksi` tampil bergaya kaca konsisten, light + dark, 360px tak scroll horizontal.

- [ ] **Step 11: Commit**

```bash
git add -A
git commit -m "feat: restyle components to glass panels, drop token aliases"
```

---

## Task 5: `useToday` + jam hidup di header

**Files:**
- Create: `src/store/today.js`, `src/store/today.test.jsx`
- Modify: `src/components/Shell.jsx`, `src/test-setup.jsx`

**Interfaces:**
- Produces:
  - `useToday(intervalMs = 60000) → Date` — re-render tiap interval; hormati `vi.setSystemTime`
  - `hariIniISO(d = new Date()) → 'YYYY-MM-DD'` (waktu lokal)

- [ ] **Step 1: Aktifkan fake timers opsional — tambah ke `src/test-setup.jsx`** (di paling bawah)

```js
import { afterEach, vi } from 'vitest'
afterEach(() => { vi.useRealTimers() })
```

- [ ] **Step 2: Write the failing test — `src/store/today.test.jsx`**

```jsx
import { render, screen, act } from '@testing-library/react'
import { vi } from 'vitest'
import { useToday, hariIniISO } from './today'

function Probe() {
  const d = useToday(1000)
  return <span>{hariIniISO(d)}</span>
}

test('useToday mengikuti waktu sistem dan update tiap interval', () => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-09-06T10:00:00'))
  render(<Probe />)
  expect(screen.getByText('2026-09-06')).toBeInTheDocument()
  act(() => { vi.setSystemTime(new Date('2026-09-07T10:00:00')); vi.advanceTimersByTime(1000) })
  expect(screen.getByText('2026-09-07')).toBeInTheDocument()
})

test('hariIniISO memformat lokal', () => {
  expect(hariIniISO(new Date('2026-03-09T23:30:00'))).toBe('2026-03-09')
})
```

- [ ] **Step 3: Run — `npx vitest run src/store/today.test.jsx`** → FAIL

- [ ] **Step 4: Implement `src/store/today.js`**

```js
import { useEffect, useState } from 'react'

export const hariIniISO = (d = new Date()) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`

export function useToday(intervalMs = 60000) {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), intervalMs)
    return () => clearInterval(id)
  }, [intervalMs])
  return now
}
```

- [ ] **Step 5: Run — `npx vitest run src/store/today.test.jsx`** → PASS

- [ ] **Step 6: Pakai di `Shell.jsx`** — impor `useToday` + `formatTanggal`; di header, sebelah `<strong>`:

```jsx
const today = useToday()
// ...
<span className="mono" style={{ color: 'var(--ink-muted)', fontSize: '.75rem', marginLeft: 12 }}>
  {formatTanggal(today, { pendek: true })} · {String(today.getHours()).padStart(2, '0')}:{String(today.getMinutes()).padStart(2, '0')}
</span>
```

- [ ] **Step 7: Run full — `npx vitest run`** → PASS. (`App.test.jsx` sudah `stubFetchAll`; jam pakai `new Date()` asli — tidak mengganggu assertion teks.)

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: useToday hook + live clock in header"
```

---

## Task 6: `proyeksi.js` — proyeksi band empiris

**Files:**
- Create: `src/lib/proyeksi.js`, `src/lib/proyeksi.test.js`

**Interfaces:**
- Produces:
  - `LEBARAN_DATES: string[]` — `['2025-03-31','2026-03-20','2027-03-10']`
  - `inLebaranWindow(date: Date|string, lebaran?: string[]) → boolean` — true bila `date ∈ [L−21h, L+7h]`
  - `proyeksiBand(bandKomoditas: {normal, dekat_lebaran}, hargaAnchor: number, d0: Date|string, targetDate: Date|string) → { median, p10, p90, n, kondisi, kadaluarsa }`
    - `bandKomoditas[kondisi]` = `{ p10, median, p90, ... }` (persen)
    - drift median linear `×(n/7)`; sebaran `p10/p90` `×√(n/7)`; `p10` di-clamp `≥ hargaAnchor·0.1`; `kadaluarsa = n > 30`; `n = 0` → semua = `hargaAnchor`

- [ ] **Step 1: Write the failing test — `src/lib/proyeksi.test.js`**

```js
import { proyeksiBand, inLebaranWindow } from './proyeksi'

const band = { normal: { p10: -20, median: 0, p90: 20 }, dekat_lebaran: { p10: -35, median: 10, p90: 40 } }

test('n=0 → semua = anchor', () => {
  const r = proyeksiBand(band, 1000, '2026-08-22', '2026-08-22')
  expect(r).toMatchObject({ median: 1000, p10: 1000, p90: 1000, n: 0, kondisi: 'normal', kadaluarsa: false })
})
test('median=0 → median flat, pita melebar ~√t', () => {
  const r = proyeksiBand(band, 1000, '2026-08-22', '2026-08-29') // n=7, t=1
  expect(r.median).toBe(1000)
  expect(r.p90).toBe(1200)
  expect(r.p10).toBe(800)
  const r4 = proyeksiBand(band, 1000, '2026-08-22', '2026-09-19') // n=28, t=4, √t=2
  expect(r4.p90).toBe(1400)
})
test('drift median linear', () => {
  const r = proyeksiBand({ normal: { p10: -10, median: 14, p90: 10 } }, 1000, '2026-08-01', '2026-08-15') // n=14, t=2
  expect(r.median).toBe(1280) // 1000*(1+0.14*2)
})
test('clamp p10 >= 10% anchor', () => {
  const r = proyeksiBand({ normal: { p10: -95, median: 0, p90: 5 } }, 1000, '2026-08-01', '2026-08-29') // n=28, t=4, √t=2 → -1.9
  expect(r.p10).toBe(100)
})
test('kadaluarsa saat n > 30', () => {
  expect(proyeksiBand(band, 1000, '2026-08-01', '2026-08-31').kadaluarsa).toBe(false) // n=30
  expect(proyeksiBand(band, 1000, '2026-08-01', '2026-09-01').kadaluarsa).toBe(true)  // n=31
})
test('kondisi dekat_lebaran saat target di window', () => {
  const r = proyeksiBand(band, 1000, '2026-02-20', '2026-03-10') // Lebaran 2026-03-20, −10 hari
  expect(r.kondisi).toBe('dekat_lebaran')
})
test('inLebaranWindow batas ±', () => {
  expect(inLebaranWindow('2026-02-27')).toBe(true)   // −21
  expect(inLebaranWindow('2026-02-26')).toBe(false)  // −22
  expect(inLebaranWindow('2026-03-27')).toBe(true)   // +7
  expect(inLebaranWindow('2026-03-28')).toBe(false)  // +8
})
```

- [ ] **Step 2: Run — `npx vitest run src/lib/proyeksi.test.js`** → FAIL

- [ ] **Step 3: Implement `src/lib/proyeksi.js`**

```js
export const LEBARAN_DATES = ['2025-03-31', '2026-03-20', '2027-03-10']
const MS_HARI = 86400000
const toUTC = (v) => (v instanceof Date ? v : new Date(v + 'T00:00:00Z'))

export function inLebaranWindow(date, lebaran = LEBARAN_DATES) {
  const t = toUTC(date).getTime()
  return lebaran.some((l) => {
    const c = toUTC(l).getTime()
    return t >= c - 21 * MS_HARI && t <= c + 7 * MS_HARI
  })
}

export function proyeksiBand(bandKomoditas, hargaAnchor, d0, targetDate) {
  const n = Math.max(0, Math.floor((toUTC(targetDate) - toUTC(d0)) / MS_HARI))
  if (n === 0) {
    return { median: hargaAnchor, p10: hargaAnchor, p90: hargaAnchor, n: 0, kondisi: 'normal', kadaluarsa: false }
  }
  const kondisi = inLebaranWindow(targetDate) ? 'dekat_lebaran' : 'normal'
  const b = bandKomoditas[kondisi] || bandKomoditas.normal
  const t = n / 7
  let p10 = hargaAnchor * (1 + (b.p10 / 100) * Math.sqrt(t))
  p10 = Math.max(p10, hargaAnchor * 0.1)
  return {
    median: Math.round(hargaAnchor * (1 + (b.median / 100) * t)),
    p10: Math.round(p10),
    p90: Math.round(hargaAnchor * (1 + (b.p90 / 100) * Math.sqrt(t))),
    n,
    kondisi,
    kadaluarsa: n > 30,
  }
}
```

- [ ] **Step 4: Run — `npx vitest run src/lib/proyeksi.test.js`** → PASS

- [ ] **Step 5: Verify `LEBARAN_DATES`** — cek tanggal Idul Fitri 2025/2026/2027 (sumber: kalender Hijriah / SKB 3 Menteri bila sudah terbit). Perbaiki bila meleset, jalankan ulang test.

- [ ] **Step 6: Run full — `npx vitest run`** → PASS

- [ ] **Step 7: Commit**

```bash
git add src/lib/proyeksi.js src/lib/proyeksi.test.js
git commit -m "feat: proyeksiBand + inLebaranWindow (empirical rolling projection)"
```

---

## Task 7: `ProyeksiChart`

**Files:**
- Create: `src/charts/ProyeksiChart.jsx`, `src/charts/ProyeksiChart.test.jsx`

**Interfaces:**
- Consumes: `useData('harga.json'|'band.json'|'meta.json')`, `useFilter`, `useTokens`, `usePrefersReducedMotion`, `useToday`, `hariIniISO`, `offsetToDate`, `formatTanggal`, `indexOfDate`, `buildEnvelope`, `sampel`, `proyeksiBand`, `inLebaranWindow`, `LEBARAN_DATES`, `ChartFrame`, `TooltipKustom`
- Produces: `<ProyeksiChart />` — self-contained; anchor = harga non-null terakhir dari seri aktif (`__semua__` → envelope avg); x dari `d0−90` s/d `hariIni+7`

- [ ] **Step 1: Write the failing test — `src/charts/ProyeksiChart.test.jsx`**

```jsx
import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { DataProvider } from '../store/DataContext'
import { FilterProvider } from '../store/FilterContext'
import { ThemeProvider } from '../store/ThemeContext'
import ProyeksiChart from './ProyeksiChart'
import { stubFetchAll } from '../test-fixtures'

beforeEach(() => { stubFetchAll(); vi.useFakeTimers(); vi.setSystemTime(new Date('2026-09-06T09:00:00')) })
const wrap = (ui) => <ThemeProvider><DataProvider><FilterProvider>{ui}</FilterProvider></DataProvider></ThemeProvider>

test('render proyeksi: judul, caption band-empiris, penanda HARI INI, tabel', async () => {
  render(wrap(<ProyeksiChart />))
  await waitFor(() => expect(screen.getByText(/Proyeksi harga CABE MERAH KERITING/i)).toBeInTheDocument())
  expect(screen.getByText(/band empiris/i)).toBeInTheDocument()
  expect(screen.getByText('HARI INI')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run — `npx vitest run src/charts/ProyeksiChart.test.jsx`** → FAIL

- [ ] **Step 3: Implement `src/charts/ProyeksiChart.jsx`**

```jsx
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
  const d0Off = serie.length - 1
  const todayOff = d0Off + Math.max(0, indexOfDate(d0, hariIniISO(today)))
  const startOff = Math.max(0, d0Off - 90)
  const endOff = todayOff + 7

  const rows = []
  for (let i = startOff; i <= endOff; i++) {
    const tgl = offsetToDate(harga.tanggal_awal, i)
    const label = formatTanggal(tgl, { pendek: true })
    if (i <= d0Off) {
      rows.push({ t: label, aktual: serie[i] ?? null })
    } else {
      const p = proyeksiBand(b, anchor, d0, tgl)
      rows.push({ t: label, aktual: null, base: p.p10, span: p.p90 - p.p10, median: p.median })
    }
  }
  const joinIdx = d0Off - startOff
  if (rows[joinIdx]) { rows[joinIdx].median = rows[joinIdx].aktual; rows[joinIdx].base = rows[joinIdx].aktual; rows[joinIdx].span = 0 }

  const hue = inLebaranWindow(today) ? t.cat3 : t.cat2
  const todayLabel = formatTanggal(today, { pendek: true })
  const lebaranLabels = LEBARAN_DATES
    .map((d) => { const off = indexOfDate(harga.tanggal_awal, d); return (off >= startOff && off <= endOff) ? formatTanggal(offsetToDate(harga.tanggal_awal, off), { pendek: true }) : null })
    .filter(Boolean)

  return (
    <ChartFrame
      judul={`Proyeksi harga ${komoditas}`}
      caption="Garis solid = harga aktual s/d 22 Agu 2026. Pita = proyeksi band empiris (p10–p90), melebar seiring waktu. Bukan prediksi model ML."
      tabel={{
        kolom: ['Tanggal', 'Aktual', 'Median proyeksi', 'p10', 'p90'],
        baris: sampel(rows).map((r) => [r.t, r.aktual, r.median ?? null, r.base ?? null, r.base != null ? r.base + r.span : null]),
      }}
    >
      <ResponsiveContainer width="100%" height={340}>
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
```

- [ ] **Step 4: Run — `npx vitest run src/charts/ProyeksiChart.test.jsx`** → PASS

- [ ] **Step 5: Run full — `npx vitest run`** → PASS

- [ ] **Step 6: Commit**

```bash
git add src/charts/ProyeksiChart.jsx src/charts/ProyeksiChart.test.jsx
git commit -m "feat: ProyeksiChart — actual line + widening empirical band + HARI INI marker"
```

---

## Task 8: `ProyeksiBergulir` → halaman prediksi

**Files:**
- Create: `src/sections/ProyeksiBergulir.jsx`, `src/sections/ProyeksiBergulir.test.jsx`
- Modify: `src/pages/Prediksi.jsx`

**Interfaces:**
- Consumes: `useData`, `useFilter`, `useToday`, `buildEnvelope`, `proyeksiBand`, `inLebaranWindow`, `<Glass>`, `<ProyeksiChart>`
- Produces: `<ProyeksiBergulir />` — kartu headline (`tone="lime"` normal / `tone="dark"` kadaluarsa) + caption wajib + `<ProyeksiChart />`

- [ ] **Step 1: Write the failing test — `src/sections/ProyeksiBergulir.test.jsx`**

```jsx
import { render, screen, waitFor } from '@testing-library/react'
import { vi } from 'vitest'
import { DataProvider } from '../store/DataContext'
import { FilterProvider } from '../store/FilterContext'
import { ThemeProvider } from '../store/ThemeContext'
import ProyeksiBergulir from './ProyeksiBergulir'
import { stubFetchAll } from '../test-fixtures'

const wrap = (ui) => <ThemeProvider><DataProvider><FilterProvider>{ui}</FilterProvider></DataProvider></ThemeProvider>
beforeEach(() => stubFetchAll())

test('headline = proyeksiBand hari ini + chip +N hari + caption wajib', async () => {
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-09-06T09:00:00')) // d0=2026-08-22 → n=15
  render(wrap(<ProyeksiBergulir />))
  await waitFor(() => expect(screen.getByText(/Estimasi hari ini/i)).toBeInTheDocument())
  expect(screen.getByText(/\+15 hari sejak data terakhir 22 Agu 2026/)).toBeInTheDocument()
  expect(screen.getByText(/bukan prediksi bergulir model ML/)).toBeInTheDocument()
  expect(screen.getByText('Rp 43.290')).toBeInTheDocument() // anchor avg fixture; median% = 0
})

test('n>30 → mode peringatan refresh', async () => {
  vi.useFakeTimers(); vi.setSystemTime(new Date('2026-10-05T09:00:00')) // n=44
  render(wrap(<ProyeksiBergulir />))
  await waitFor(() => expect(screen.getByText(/jalankan ulang pipeline scraping/i)).toBeInTheDocument())
})
```

- [ ] **Step 2: Run — `npx vitest run src/sections/ProyeksiBergulir.test.jsx`** → FAIL

- [ ] **Step 3: Implement `src/sections/ProyeksiBergulir.jsx`**

```jsx
import { useData } from '../store/DataContext'
import { useFilter } from '../store/FilterContext'
import { useToday } from '../store/today'
import { buildEnvelope } from '../lib/series'
import { proyeksiBand, inLebaranWindow } from '../lib/proyeksi'
import Glass from '../components/Glass'
import ProyeksiChart from '../charts/ProyeksiChart'

const rp = (v) => 'Rp ' + Math.round(v).toLocaleString('id-ID')
const CAPTION = 'Proyeksi dari distribusi historis pergerakan harga 7-hari, bukan prediksi bergulir model ML. Data harga aktual berakhir 22 Agu 2026 — makin jauh dari tanggal itu, rentang makin lebar.'

export default function ProyeksiBergulir() {
  const { data: harga } = useData('harga.json')
  const { data: band } = useData('band.json')
  const { data: meta } = useData('meta.json')
  const { komoditas, pasar } = useFilter()
  const today = useToday()
  if (!harga || !band || !meta) return <p className="mono">Memuat…</p>

  const b = band.komoditas[komoditas]
  const perPasar = harga.komoditas[komoditas] || {}
  const serie = pasar === '__semua__' ? buildEnvelope(perPasar).map((e) => e.avg) : (perPasar[pasar] || [])
  let anchor = null
  for (let i = serie.length - 1; i >= 0; i--) { if (serie[i] != null) { anchor = serie[i]; break } }
  const d0 = meta.tanggal_data_terakhir
  const r = b && anchor != null ? proyeksiBand(b, anchor, d0, today) : null
  const kondisi = inLebaranWindow(today) ? 'menjelang Lebaran' : 'normal'

  return (
    <>
      <h3>Estimasi hari ini — proyeksi band empiris</h3>
      {r && (
        <Glass tone={r.kadaluarsa ? 'dark' : 'lime'} style={{ padding: 20, margin: '12px 0' }}>
          {r.kadaluarsa && (
            <p style={{ fontWeight: 600, margin: '0 0 8px' }}>
              Data harga sudah {r.n} hari — jalankan ulang pipeline scraping untuk proyeksi yang berarti.
            </p>
          )}
          <div className="mono" style={{ fontSize: '1.6rem', fontWeight: 600, opacity: r.kadaluarsa ? 0.55 : 1 }}>{rp(r.median)}</div>
          <div className="mono" style={{ opacity: r.kadaluarsa ? 0.55 : 1 }}>rentang {rp(r.p10)} – {rp(r.p90)}</div>
          <div className="mono" style={{ fontSize: '.8rem', marginTop: 6 }}>
            +{r.n} hari sejak data terakhir 22 Agu 2026 · kondisi {kondisi}
          </div>
          <p style={{ fontSize: '.8rem', marginTop: 8 }}>{CAPTION}</p>
        </Glass>
      )}
      {!b && <p className="mono">Band tidak tersedia untuk {komoditas}.</p>}
      <ProyeksiChart />
    </>
  )
}
```

- [ ] **Step 4: Sisipkan ke `src/pages/Prediksi.jsx`** — impor `ProyeksiBergulir`; ganti komentar `{/* Task 8 ... */}` dengan `<ProyeksiBergulir />`.

- [ ] **Step 5: Run — `npx vitest run src/sections/ProyeksiBergulir.test.jsx src/pages/Prediksi.test.jsx`** → PASS

- [ ] **Step 6: Run full — `npx vitest run`** → PASS

- [ ] **Step 7: Verify — `npm run dev`**, `#/prediksi` → kartu "Estimasi hari ini" + grafik proyeksi dengan garis HARI INI.

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: ProyeksiBergulir section on #/prediksi (live headline + chart)"
```

---

## Task 9: `KomoditasPicker` (komponen berdiri sendiri)

**Files:**
- Create: `src/components/KomoditasPicker.jsx`, `src/components/KomoditasPicker.test.jsx`
- Modify: `src/styles.css` (kelas `.komoditas-picker`, `.picker-toggle`, `.picker-body`, `.chip-row`)

**Interfaces:**
- Consumes: `useData('meta.json')`, `useFilter`, `<Glass>`
- Produces: `<KomoditasPicker />` — `role="group"` berisi tombol toggle (mobile) + `<input type="search">` + `role="radiogroup"` chip per kategori (`bawang, cabai, sayuran, umbi, kacang, buah`). Chip aktif `.chip--on`; caveat → ` ⚠` + `title`.

- [ ] **Step 1: Write the failing test — `src/components/KomoditasPicker.test.jsx`**

```jsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { DataProvider } from '../store/DataContext'
import { FilterProvider, useFilter } from '../store/FilterContext'
import { ThemeProvider } from '../store/ThemeContext'
import KomoditasPicker from './KomoditasPicker'
import { stubFetchAll } from '../test-fixtures'

beforeEach(() => stubFetchAll())
function Echo() { return <span data-testid="k">{useFilter().komoditas}</span> }
const wrap = (ui) => <ThemeProvider><DataProvider><FilterProvider>{ui}<Echo /></FilterProvider></DataProvider></ThemeProvider>

test('search memfilter, klik chip mengubah komoditas, caveat bertanda', async () => {
  render(wrap(<KomoditasPicker />))
  await waitFor(() => expect(screen.getByRole('radiogroup', { name: /komoditas/i })).toBeInTheDocument())
  fireEvent.change(screen.getByLabelText(/cari komoditas/i), { target: { value: 'batu' } })
  const chip = screen.getByRole('radio', { name: /BAWANG MERAH BATU/ })
  expect(chip).toHaveTextContent('⚠')
  fireEvent.click(chip)
  expect(screen.getByTestId('k')).toHaveTextContent('BAWANG MERAH BATU')
})

test('search tanpa hasil → pesan kosong', async () => {
  render(wrap(<KomoditasPicker />))
  await waitFor(() => expect(screen.getByLabelText(/cari komoditas/i)).toBeInTheDocument())
  fireEvent.change(screen.getByLabelText(/cari komoditas/i), { target: { value: 'zzz' } })
  expect(screen.getByText(/tidak ada komoditas cocok/i)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run — `npx vitest run src/components/KomoditasPicker.test.jsx`** → FAIL

- [ ] **Step 3: Implement `src/components/KomoditasPicker.jsx`**

```jsx
import { useState } from 'react'
import { useData } from '../store/DataContext'
import { useFilter } from '../store/FilterContext'
import Glass from './Glass'

const KATEGORI = ['bawang', 'cabai', 'sayuran', 'umbi', 'kacang', 'buah']
const norm = (s) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')

export default function KomoditasPicker() {
  const { data: meta } = useData('meta.json')
  const { komoditas, setKomoditas } = useFilter()
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  if (!meta) return null

  const cocok = meta.komoditas.filter((k) => norm(k.nama).includes(norm(q)))
  const grup = KATEGORI.map((kat) => [kat, cocok.filter((k) => k.kategori === kat)]).filter(([, arr]) => arr.length)

  return (
    <Glass className="komoditas-picker" role="group" aria-label="Pemilih komoditas">
      <button type="button" className="picker-toggle mono" aria-expanded={open} onClick={() => setOpen((o) => !o)}>
        Komoditas: {komoditas} ▾
      </button>
      <div className={open ? 'picker-body is-open' : 'picker-body'}>
        <input type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari komoditas…" aria-label="Cari komoditas" />
        <div role="radiogroup" aria-label="Komoditas">
          {grup.map(([kat, arr]) => (
            <div key={kat}>
              <p className="eyebrow">{kat}</p>
              <div className="chip-row">
                {arr.map((k) => (
                  <button
                    key={k.nama}
                    type="button"
                    role="radio"
                    aria-checked={k.nama === komoditas}
                    className={k.nama === komoditas ? 'chip chip--on' : 'chip'}
                    title={k.caveat_data ? 'data 1–3 pasar jarang lapor' : undefined}
                    onClick={() => { setKomoditas(k.nama); setOpen(false) }}
                  >
                    {k.nama}{k.caveat_data ? ' ⚠' : ''}
                  </button>
                ))}
              </div>
            </div>
          ))}
          {!cocok.length && <p className="mono">Tidak ada komoditas cocok.</p>}
        </div>
      </div>
    </Glass>
  )
}
```

- [ ] **Step 4: Tambah CSS ke `src/styles.css`**

```css
.komoditas-picker { padding: 10px 12px; min-width: 260px; }
.picker-toggle { display: none; width: 100%; text-align: left; background: none; border: none; color: var(--ink); font-size: .85rem; cursor: pointer; }
.picker-body input[type="search"] { width: 100%; margin-bottom: 8px; padding: 6px 8px; background: var(--glass); border: 1px solid var(--glass-brd); border-radius: 8px; color: var(--ink); font: 400 .85rem var(--font-body); }
.chip-row { display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 8px; }
@media (max-width: 720px) {
  .picker-toggle { display: block; }
  .picker-body { display: none; }
  .picker-body.is-open { display: block; position: absolute; z-index: 25; margin-top: 8px; padding: 12px; max-width: 92vw; max-height: 60vh; overflow: auto; }
  .komoditas-picker { position: relative; }
}
```

- [ ] **Step 5: Run — `npx vitest run src/components/KomoditasPicker.test.jsx`** → PASS

- [ ] **Step 6: Run full — `npx vitest run`** → PASS

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: KomoditasPicker — chip grid by category + search"
```

---

## Task 10: Pasang picker + sinkron URL query

**Files:**
- Modify: `src/components/Shell.jsx`, `src/components/Selector.jsx`, `src/store/FilterContext.jsx`, `src/store/contexts.test.jsx`

**Interfaces:**
- Consumes: `parseHash` (Task 1), `<KomoditasPicker>` (Task 9)
- Produces: `FilterProvider` — init `komoditas/pasar/rentang` dari `?k/?p/?r` di hash; `history.replaceState` saat berubah (path dipertahankan). `Selector` hanya `kind="pasar"|"rentang"`.

- [ ] **Step 1: Update `src/store/contexts.test.jsx`** — tambah:

```jsx
import { parseHash } from '../router'

test('FilterProvider init dari URL query dan sync balik', () => {
  window.location.hash = '#/prediksi?k=BAWANG%20MERAH&r=1thn'
  render(<FilterProvider><FProbe /></FilterProvider>)
  const b = screen.getByRole('button')
  expect(b).toHaveTextContent('BAWANG MERAH|1thn')
  act(() => b.click()) // setKomoditas('BAWANG MERAH') — idempotent; ganti FProbe agar set nilai lain
  expect(parseHash(window.location.hash).path).toBe('/prediksi')
})
```

> Sesuaikan `FProbe` agar tombolnya `setKomoditas('SAYURAN TOMAT')` lalu assert `parseHash(window.location.hash).query.get('k')` === `'SAYURAN TOMAT'`. Reset `window.location.hash = '#/'` di `afterEach`.

- [ ] **Step 2: Run — `npx vitest run src/store/contexts.test.jsx`** → FAIL

- [ ] **Step 3: Update `src/store/FilterContext.jsx`**

```jsx
import { createContext, useContext, useEffect, useState } from 'react'
import { parseHash } from '../router'

const Ctx = createContext(null)
const VALID_RENTANG = ['3bln', '1thn', '2thn']
const q = (key) => (typeof window === 'undefined' ? null : parseHash(window.location.hash).query.get(key))

export function FilterProvider({ children }) {
  const [komoditas, setKomoditas] = useState(() => q('k') || 'CABE MERAH KERITING')
  const [pasar, setPasar] = useState(() => q('p') || '__semua__')
  const [rentang, setRentang] = useState(() => (VALID_RENTANG.includes(q('r')) ? q('r') : '2thn'))

  useEffect(() => {
    if (typeof window === 'undefined') return
    const { path } = parseHash(window.location.hash)
    const p = new URLSearchParams()
    if (komoditas !== 'CABE MERAH KERITING') p.set('k', komoditas)
    if (pasar !== '__semua__') p.set('p', pasar)
    if (rentang !== '2thn') p.set('r', rentang)
    const qs = p.toString()
    const next = '#' + path + (qs ? '?' + qs : '')
    if (next !== window.location.hash) window.history.replaceState(null, '', next)
  }, [komoditas, pasar, rentang])

  return (
    <Ctx.Provider value={{ komoditas, pasar, rentang, setKomoditas, setPasar, setRentang }}>
      {children}
    </Ctx.Provider>
  )
}
export const useFilter = () => useContext(Ctx)
```

> Komoditas invalid (tak ada di `meta`) dibiarkan lewat — chart sudah guard (`harga.komoditas[komoditas] || {}`). Tidak perlu validasi di sini.

- [ ] **Step 4: Update `src/components/Selector.jsx`** — hapus cabang `kind === 'komoditas'` (blok `opts/value/onChange/label` untuk komoditas). Sisakan `pasar` & `rentang`. Hapus baris `if (kind === 'komoditas') { ... }`.

- [ ] **Step 5: Update `src/components/Shell.jsx`** — impor `KomoditasPicker`; ganti `<Selector kind="komoditas" />` jadi `<KomoditasPicker />`.

- [ ] **Step 6: Update `src/App.test.jsx`** — `beforeEach` sudah set `window.location.hash = '#/'`; tambah `afterEach(() => { window.location.hash = '#/' })` di file test yang memuat `<App />` bila belum ada.

- [ ] **Step 7: Run — `npx vitest run`** → PASS (perbaiki `contexts.test.jsx` FProbe sesuai Step 1)

- [ ] **Step 8: Verify — `npm run dev`** → ganti komoditas via chip → URL jadi `#/…?k=…`, semua chart update; reload halaman → komoditas tetap.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: wire KomoditasPicker into shell + FilterContext URL sync"
```

---

## Task 11: `KonteksHistoris` → halaman prediksi

**Files:**
- Create: `src/sections/KonteksHistoris.jsx`, `src/sections/KonteksHistoris.test.jsx`
- Modify: `src/pages/Prediksi.jsx`

**Interfaces:**
- Consumes: `useData('harga.json'|'band.json')`, `useFilter`, `useTokens`, `usePrefersReducedMotion`, `offsetToDate`, `formatTanggal`, `buildEnvelope`, `sampel`, `<Glass>`, `<ChartFrame>`, `TooltipKustom`
- Produces: `<KonteksHistoris />` — mini `LineChart` harga rata-rata 2 tahun + 2 kartu angka band (`normal` `.glass--pale`, `dekat_lebaran` `.glass--dark`)

- [ ] **Step 1: Write the failing test — `src/sections/KonteksHistoris.test.jsx`**

```jsx
import { render, screen, waitFor } from '@testing-library/react'
import { DataProvider } from '../store/DataContext'
import { FilterProvider } from '../store/FilterContext'
import { ThemeProvider } from '../store/ThemeContext'
import KonteksHistoris from './KonteksHistoris'
import { stubFetchAll } from '../test-fixtures'

beforeEach(() => stubFetchAll())
const wrap = (ui) => <ThemeProvider><DataProvider><FilterProvider>{ui}</FilterProvider></DataProvider></ThemeProvider>

test('render mini-chart + kartu band normal & Lebaran', async () => {
  render(wrap(<KonteksHistoris />))
  await waitFor(() => expect(screen.getByText(/Konteks historis — CABE MERAH KERITING/i)).toBeInTheDocument())
  expect(screen.getByText(/Kondisi normal/i)).toBeInTheDocument()
  expect(screen.getByText(/Menjelang Lebaran/i)).toBeInTheDocument()
  expect(screen.getByText(/lebar band 41\.7%/)).toBeInTheDocument()
})
```

- [ ] **Step 2: Run — `npx vitest run src/sections/KonteksHistoris.test.jsx`** → FAIL

- [ ] **Step 3: Implement `src/sections/KonteksHistoris.jsx`**

```jsx
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useData } from '../store/DataContext'
import { useFilter } from '../store/FilterContext'
import { useTokens, usePrefersReducedMotion } from '../store/ThemeContext'
import { offsetToDate, formatTanggal } from '../store/dates'
import { buildEnvelope, sampel } from '../lib/series'
import Glass from '../components/Glass'
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
            <Glass key={key} tone={key === 'dekat_lebaran' ? 'dark' : 'pale'} style={{ padding: 14 }}>
              <p className="eyebrow">{judul}</p>
              <div className="mono">median {pct(b[key]?.median)} · p10 {pct(b[key]?.p10)} · p90 {pct(b[key]?.p90)}</div>
              <div className="mono" style={{ fontSize: '.75rem' }}>lebar band {b[key]?.lebar_band}% · n={b[key]?.n}</div>
            </Glass>
          ))}
        </div>
      )}
    </>
  )
}
```

- [ ] **Step 4: Sisipkan ke `src/pages/Prediksi.jsx`** — impor `KonteksHistoris`; ganti komentar `{/* Task 11 ... */}` dengan `<KonteksHistoris />`.

- [ ] **Step 5: Run — `npx vitest run src/sections/KonteksHistoris.test.jsx src/pages/Prediksi.test.jsx`** → PASS

- [ ] **Step 6: Run full — `npx vitest run`** → PASS

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: KonteksHistoris section on #/prediksi"
```

---

## Task 12: `Timeline` (komponen berdiri sendiri)

**Files:**
- Create: `src/components/Timeline.jsx`, `src/components/Timeline.test.jsx`
- Modify: `src/styles.css` (`.timeline*`)

**Interfaces:**
- Consumes: `<Glass>`, `usePrefersReducedMotion`
- Produces: `<Timeline items={{ n, judul, isi }[]} />` — rel `role="list"` node `<button>` + 3 kartu (`items[aktif-1]` pale / `items[aktif]` lime / `items[aktif+1]` dark) + scrubber pill (`←`/`→` + ticks). `aria-current="step"` pada node aktif.

- [ ] **Step 1: Write the failing test — `src/components/Timeline.test.jsx`**

```jsx
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider } from '../store/ThemeContext'
import Timeline from './Timeline'

const items = [
  { n: 1, judul: 'Tahap A', isi: 'isi a' },
  { n: 2, judul: 'Tahap B', isi: 'isi b' },
  { n: 3, judul: 'Tahap C', isi: 'isi c' },
]
const wrap = (ui) => <ThemeProvider>{ui}</ThemeProvider>

test('default aktif=0; panel berikutnya memajukan; klik node melompat', () => {
  render(wrap(<Timeline items={items} />))
  expect(screen.getByRole('button', { name: /Tahap 1: Tahap A/ })).toHaveAttribute('aria-current', 'step')
  fireEvent.click(screen.getByRole('button', { name: /tahap berikutnya/i }))
  expect(screen.getByRole('button', { name: /Tahap 2: Tahap B/ })).toHaveAttribute('aria-current', 'step')
  fireEvent.click(screen.getByRole('button', { name: /Tahap 3: Tahap C/ }))
  expect(screen.getByRole('button', { name: /tahap berikutnya/i })).toBeDisabled()
})
```

- [ ] **Step 2: Run — `npx vitest run src/components/Timeline.test.jsx`** → FAIL

- [ ] **Step 3: Implement `src/components/Timeline.jsx`**

```jsx
import { useState } from 'react'
import Glass from './Glass'
import { usePrefersReducedMotion } from '../store/ThemeContext'

export default function Timeline({ items }) {
  const [aktif, setAktif] = useState(0)
  const reduced = usePrefersReducedMotion()
  if (!items?.length) return null
  const go = (i) => setAktif(Math.max(0, Math.min(items.length - 1, i)))
  const slots = [[aktif - 1, 'pale'], [aktif, 'lime'], [aktif + 1, 'dark']]

  return (
    <div className={reduced ? 'timeline no-motion' : 'timeline'}>
      <div className="timeline-rail" role="list">
        {items.map((it, i) => (
          <button
            key={it.n ?? i}
            type="button"
            role="listitem"
            className={i === aktif ? 'timeline-node is-active' : 'timeline-node'}
            aria-label={`Tahap ${it.n ?? i + 1}: ${it.judul}`}
            aria-current={i === aktif ? 'step' : undefined}
            onClick={() => go(i)}
          />
        ))}
      </div>
      <div className="timeline-cards">
        {slots.map(([idx, tone]) => (
          items[idx]
            ? (
              <Glass key={tone} tone={tone} className="timeline-card" style={{ padding: 16 }}>
                <p className="eyebrow">Tahap {items[idx].n ?? idx + 1}</p>
                <strong>{items[idx].judul}</strong>
                <p style={{ margin: '4px 0 0' }}>{items[idx].isi}</p>
              </Glass>
            )
            : <div key={tone} className="timeline-card timeline-card--empty" aria-hidden="true" />
        ))}
      </div>
      <Glass tone="lime" className="timeline-scrubber">
        <button type="button" aria-label="Tahap sebelumnya" onClick={() => go(aktif - 1)} disabled={aktif === 0}>←</button>
        <div className="timeline-ticks" aria-hidden="true">
          {items.map((_, i) => <span key={i} className={i === aktif ? 'is-active' : undefined} />)}
        </div>
        <button type="button" aria-label="Tahap berikutnya" onClick={() => go(aktif + 1)} disabled={aktif === items.length - 1}>→</button>
      </Glass>
    </div>
  )
}
```

- [ ] **Step 4: Tambah CSS ke `src/styles.css`**

```css
.timeline { margin: 1.5rem 0; }
.timeline-rail { display: flex; justify-content: space-between; align-items: center; gap: 4px; position: relative; margin-bottom: 1rem; }
.timeline-rail::before { content: ''; position: absolute; left: 0; right: 0; top: 50%; height: 1px; background: var(--line); }
.timeline-node { position: relative; width: 14px; height: 14px; border-radius: 999px; border: 1px solid var(--glass-brd); background: var(--bg-base); cursor: pointer; padding: 0; }
.timeline-node.is-active { background: var(--accent); box-shadow: 0 0 0 4px color-mix(in srgb, var(--accent) 30%, transparent); }
.timeline:not(.no-motion) .timeline-node.is-active { animation: pulse 2s ease-in-out infinite; }
@keyframes pulse { 0%,100% { box-shadow: 0 0 0 3px color-mix(in srgb, var(--accent) 30%, transparent); } 50% { box-shadow: 0 0 0 7px color-mix(in srgb, var(--accent) 12%, transparent); } }
.timeline-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; }
.timeline-card--empty { border: 1px dashed var(--line); border-radius: var(--r); opacity: .4; }
.timeline-scrubber { display: flex; align-items: center; gap: 10px; padding: 8px 12px; margin-top: 12px; width: max-content; }
.timeline-scrubber button { min-width: 32px; min-height: 32px; border: none; background: transparent; color: var(--accent-ink); font-size: 1rem; cursor: pointer; }
.timeline-scrubber button:disabled { opacity: .4; cursor: default; }
.timeline-ticks { display: flex; gap: 3px; }
.timeline-ticks span { width: 2px; height: 12px; background: color-mix(in srgb, var(--accent-ink) 30%, transparent); }
.timeline-ticks span.is-active { background: var(--accent-ink); height: 16px; }
@media (max-width: 720px) { .timeline-cards { grid-template-columns: 1fr; } .timeline-card:not(:nth-child(2)) { display: none; } }
```

- [ ] **Step 5: Run — `npx vitest run src/components/Timeline.test.jsx`** → PASS

- [ ] **Step 6: Run full — `npx vitest run`** → PASS

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: Timeline component — rail + 3-tone cards + scrubber"
```

---

## Task 13: `Timeline` di `RingkasanRiset`

**Files:**
- Modify: `src/sections/RingkasanRiset.jsx`
- Verify: `src/sections/RingkasanRiset.test.jsx` (harus tetap PASS tanpa ubahan)

**Interfaces:**
- Consumes: `<Timeline>` (Task 12), `useData('riset.json')`

- [ ] **Step 1: Update `src/sections/RingkasanRiset.jsx`**

```jsx
import { useData } from '../store/DataContext'
import TabelView from '../components/TabelView'
import Timeline from '../components/Timeline'

export default function RingkasanRiset() {
  const { data: r } = useData('riset.json')
  if (!r) return <p className="mono">Memuat…</p>
  return (
    <>
      <p className="eyebrow">Ringkasan Riset</p>
      <h2>Delapan tahap menguji apakah model bisa memprediksi harga</h2>
      <Timeline items={r.tahapan} />
      <h3>MAE model vs baseline per horizon</h3>
      <TabelView kolom={['Horizon (direct)', 'MAE model', 'MAE baseline']}
        baris={r.horizon_direct.map((h) => [`H+${h.horizon}`, h.mae_model, h.mae_baseline])} />
      <TabelView kolom={['Horizon (recursive)', 'MAE model', 'MAE baseline']}
        baris={r.horizon_recursive.map((h) => [h.horizon, h.mae_model, h.mae_baseline])} />
      <h3>Kesimpulan</h3>
      <p style={{ maxWidth: '70ch' }}>{r.kesimpulan}</p>
    </>
  )
}
```

- [ ] **Step 2: Run — `npx vitest run src/sections/RingkasanRiset.test.jsx`** → PASS (fixture `riset.tahapan` punya 1 item → `Timeline` render `items[0].judul` = `'Bug data kotor'` di kartu lime; assertion `getByText('Bug data kotor')` + `getByRole('cell', {name:'619'})` tetap lolos)

- [ ] **Step 3: Run full — `npx vitest run`** → PASS

- [ ] **Step 4: Verify — `npm run dev`** → `#/` section Riset menampilkan timeline; panah & node berpindah antar 8 tahap.

- [ ] **Step 5: Commit**

```bash
git add src/sections/RingkasanRiset.jsx
git commit -m "feat: Ringkasan Riset uses interactive Timeline"
```

---

## Task 14: Aksesibilitas + responsif + kontras

**Files:**
- Modify: `src/a11y.test.jsx`, `src/styles.css` (jika ada gap responsif), `src/test-setup.jsx`

**Interfaces:** —

- [ ] **Step 1: Perluas `src/a11y.test.jsx`**

```jsx
test('picker: radiogroup + chip radio; timeline node punya aria-label', async () => {
  window.location.hash = '#/'
  render(<App />)
  await waitFor(() => expect(screen.getByRole('radiogroup', { name: /komoditas/i })).toBeInTheDocument())
  expect(screen.getAllByRole('radio').length).toBeGreaterThan(0)
  expect(screen.getAllByRole('button', { name: /^Tahap \d+:/ }).length).toBeGreaterThanOrEqual(1)
})

test('reduced-transparency: render #/ dan #/prediksi tanpa error', async () => {
  window.matchMedia = (q) => ({
    matches: /prefers-reduced-transparency|prefers-reduced-motion/.test(q),
    media: q, addEventListener() {}, removeEventListener() {}, addListener() {}, removeListener() {}, dispatchEvent: () => false,
  })
  window.location.hash = '#/prediksi'
  render(<App />)
  await waitFor(() => expect(screen.getByText(/dihitung dari data terakhir/i)).toBeInTheDocument())
})
```

- [ ] **Step 2: Run — `npx vitest run src/a11y.test.jsx`** → PASS (perbaiki bila `matchMedia` override bocor antar test — pindah ke `afterEach` restore di file itu)

- [ ] **Step 3: Manual — `npm run dev`**, cek daftar berikut, catat & perbaiki temuan di `styles.css`:
  - 360px: body tak scroll horizontal di `#/` & `#/prediksi`; picker jadi tombol collapse; timeline 1 kartu; chip-grid 1 kolom
  - Tab keyboard: focus ring `--accent` terlihat di chip, node timeline, panah scrubber, select, input, link nav
  - Toggle tema: chart + kaca + teks konsisten light & dark
  - OS reduced-motion aktif: garis "HARI INI" & kartu timeline pindah tanpa animasi
  - Kontras: caption `--ink-muted` terbaca di atas area mesh paling terang (pojok kiri-atas)

- [ ] **Step 4: Run full — `npx vitest run`** → PASS

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "chore: a11y + responsive pass for glass redesign"
```

---

## Task 15: Build, README, verifikasi akhir

**Files:**
- Modify: `README.md`
- Verify: `dist/` build, seluruh suite

- [ ] **Step 1: `npm run build`** → sukses. Cek warning: tidak ada dependency baru; bundle ~≤ 170 KB gzip. Kalau `harga.json`/`backtest.json` ikut ke-bundle → salah (harus tetap `fetch`).

- [ ] **Step 2: `npm run preview`** → buka `#/` dan `#/prediksi`; klik semua: nav route, KomoditasPicker (ganti komoditas → semua chart + URL update), timeline riset, kalkulator band, proyeksi bergulir (garis HARI INI), toggle tema, semua `<details>` tabel.

- [ ] **Step 3: Update `README.md`** — bagian "Struktur" & "Prinsip":

```markdown
## Halaman

- `#/` — Eksplorasi: hero, harga 9 pasar, cuaca & kurs, rekomendasi band, ringkasan riset (timeline)
- `#/prediksi` — Model: proyeksi band empiris bergulir (bergerak per hari), backtest, kartu prediksi vs baseline, MAE per horizon, konteks historis per komoditas

## Tanggal & proyeksi

Header menampilkan tanggal/jam hari ini realtime. "Estimasi hari ini" di `#/prediksi`
adalah **proyeksi band empiris** dari harga aktual terakhir (22 Agu 2026) — median +
rentang p10–p90 dari distribusi historis, melebar seiring waktu. **Bukan** prediksi
model ML bergulir (model tak jalan di browser & tak mengalahkan baseline). Bila data
sudah > 30 hari, proyeksi ditandai perlu refresh pipeline.

## Desain

Tempered glass: panel kaca di atas gradient-mesh, aksen lime, IBM Plex Sans/Mono.
Light + dark, `prefers-reduced-motion/-transparency`, `forced-colors` dihormati.
```

- [ ] **Step 4: `git rm` sisa file usang** — pastikan `src/sections/PrediksiModel*.jsx` sudah terhapus (`git status`).

- [ ] **Step 5: Run full — `npx vitest run`** → semua hijau. Catat jumlah test.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "chore: build config check + README for glass redesign"
```

---

## Self-Review

**Spec coverage:**
- §3.1 routing → Task 1 ✓ · §3.2 filter+URL → Task 10 ✓ · §3.3 shell/pages → Task 2 ✓
- §4.1 useToday → Task 5 ✓ · §4.2 proyeksiBand → Task 6 ✓ · §4.3 ProyeksiChart → Task 7 ✓ · §4.4 ProyeksiBergulir → Task 8 ✓
- §5 peta halaman → Task 2 (skeleton) + 8 + 11 (prediksi), Task 13 (timeline di riset) ✓
- §6.1 token → Task 3 ✓ · §6.2 mesh bg → Task 3 ✓ · §6.3 glass utility → Task 3 ✓ · §6.4 tipografi → Task 3 (font) + Task 4 (skala) ✓ · §6.5 motion → Task 4 + 12 ✓ · §6.6 a11y → Task 14 ✓
- §7 `<Glass>` → Task 3 · `<KomoditasPicker>` → Task 9 · `<Timeline>` → Task 12 · `<ProyeksiBergulir>/<ProyeksiChart>/<KonteksHistoris>` → Task 7/8/11 · redesign komponen lama → Task 4 ✓
- §9 testing → tersebar; `a11y.test.jsx` diperluas Task 14 ✓
- §11 risiko: kontras → Task 3 Step 4 + Task 14 Step 3 · backdrop-filter fallback → Task 3 Step 7 · kadaluarsa → Task 8 · LEBARAN_DATES → Task 6 Step 5 · scroll restoration → (catatan: `useSyncExternalStore` + hash tidak auto-scroll; bila perlu tambah `window.scrollTo(0,0)` di `Shell` effect saat `path` berubah — tambahkan di Task 2 Step 7 bila terlihat mengganggu saat verifikasi) · loop replaceState → Task 10 (guard `next !== hash`) ✓

**Placeholder scan:** Tidak ada "TBD/TODO". Step yang menyuruh "sesuaikan FProbe" (Task 10 Step 1) & "gelapkan inkMuted bila gagal" (Task 3 Step 4) memberi instruksi konkret + kriteria; bukan placeholder. Task 4 Step 2 (`grep` lalu ganti) berisi aturan penggantian eksplisit per pola.

**Type consistency:**
- `proyeksiBand(bandKomoditas, hargaAnchor, d0, targetDate) → {median,p10,p90,n,kondisi,kadaluarsa}` — sama di Task 6 def, Task 7 & 8 pemakaian ✓
- `useToday(intervalMs) → Date`, `hariIniISO(d) → string` — Task 5 def, Task 7/8 pakai ✓
- `parseHash(hash) → {path, query}` — Task 1 def, Task 10 pakai `parseHash(...).query.get()` & `.path` ✓
- `<Glass as tone className>` — Task 3 def; Task 8/11/12 pakai `tone="lime|dark|pale"` ✓
- `<Timeline items={{n,judul,isi}[]}>` — Task 12 def, Task 13 pakai `r.tahapan` (bentuk `{n,judul,isi}` per PRD §4) ✓
- `Selector` setelah Task 10 hanya `kind="pasar"|"rentang"` — `Shell` (Task 10 Step 5) tidak lagi memanggil `kind="komoditas"` ✓
- `ChartFrame` prop `ariaLabel` ditambah Task 4 Step 3 — konsisten dengan pemakaian lama (opsional) ✓

## Execution Handoff

Plan lengkap tersimpan di `docs/superpowers/plans/2026-09-03-glass-redesign-prediksi-page.md`.

**Dua opsi eksekusi:**

1. **Subagent-Driven (rekomendasi)** — dispatch subagent baru per task, review 2 tahap antar task, iterasi cepat.
2. **Inline Execution** — eksekusi task di sesi ini pakai executing-plans, batch dengan checkpoint review.

Pilih yang mana?
