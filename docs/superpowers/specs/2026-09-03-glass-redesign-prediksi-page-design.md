# Design — Glass Redesign + Halaman Prediksi Terpisah + Tanggal Hidup

**Tanggal:** 2026-09-03
**Status:** untuk direview
**Pemilik:** Hafizh
**Basis:** memperluas `docs/dashboard-implementation-plan.md` (sudah diimplementasi, commit `2de702d`). PRD `docs/dashboard-PRD.md` tetap kontrak dasar; design-doc `docs/dashboard-design.md` §1–2, §11–12 **digantikan** oleh §6 dokumen ini.

---

## 1. Tujuan

1. **Tanggal hidup.** Header menampilkan tanggal/jam hari ini yang berjalan realtime. Di halaman prediksi, ada "estimasi hari ini" yang **bergerak seiring pergantian hari** — berdasarkan proyeksi band empiris dari harga aktual terakhir, bukan model ML bergulir.
2. **Halaman prediksi terpisah.** Route `#/prediksi` khusus model (backtest, kartu prediksi, MAE, proyeksi bergulir) + konteks historis per-komoditas. Halaman utama `#/` fokus eksplorasi.
3. **Pemilihan komoditas lebih mudah.** Chip grid per kategori + search, menggantikan `<select>` komoditas.
4. **Redesign visual "tempered glass".** Panel kaca beku di atas gradient-mesh gelap, aksen lime, tipografi grotesk, komponen timeline interaktif — mengikuti referensi "Milestones of Impact".

## 2. Non-tujuan (tetap seperti sekarang)

- **Tidak ada dependency runtime baru.** Tetap `react`, `react-dom`, `recharts` saja. Routing ditulis tangan (~20 baris).
- **Tidak ada backend / API call.** Hanya `fetch('/data/*.json')`.
- **Model ML tidak jalan di browser.** Angka model tetap dari `prediksi.json` (anchor tetap 22 Agu 2026), ditampilkan apa adanya + label.
- **Prinsip PRD §2 tetap berlaku:** setiap angka model berpasangan baseline + label MAE; harga = acuan eceran; ketidakpastian adalah pesan utama; 3 komoditas caveat + sel kosong ditandai.
- Bahasa Indonesia, `<html lang="id">`. Light + dark tema. Responsif 360px. `prefers-reduced-motion/-transparency`, `forced-colors` dihormati.
- Data JSON tidak berubah. "Tanggal hari ini" murni dari `Date` browser.

## 3. Arsitektur

### 3.1 Routing (`src/router.jsx`, tanpa library)

```
useRoute() → { path, query, navigate }
  path   : string  — bagian setelah '#', tanpa query. Default '/'. Trailing slash ditoleransi.
  query  : URLSearchParams — parsed dari '?...' di hash
  navigate(to) : set window.location.hash = to

<Route path="/prediksi">{children}</Route>
  — render children hanya saat path match (exact)

<RouteLink to="/prediksi" className>…</RouteLink>
  — <a href="#/prediksi"> + set aria-current saat aktif
```

- Listener `hashchange` di `useRoute` → `useState` re-render. Satu listener global via module-level subscriber list (hindari N listener).
- Ganti route → scroll ke atas + wrapper cross-fade 200ms (di-gate reduced-motion).
- Route tidak dikenal → redirect ke `/`.

### 3.2 State filter lintas halaman

- `FilterContext` **tidak berubah strukturnya** (`komoditas/pasar/rentang` + setter). Hidup di root, di atas `<Route>`, jadi pilihan komoditas ikut saat pindah halaman.
- **Sinkron URL (baru):** `FilterProvider` inisialisasi dari `location.hash` query `k` (komoditas), `p` (pasar), `r` (rentang) bila ada & valid terhadap `meta.json`. Saat filter berubah → `history.replaceState(null, '', '#' + path + '?' + params)` (path saat ini dipertahankan). URL = cermin; `FilterContext` = sumber kebenaran.
- Validasi: nilai `k` yang tidak ada di `meta.komoditas` diabaikan (fallback default).

### 3.3 Shell & halaman

```
<ThemeProvider><DataProvider><FilterProvider>
  <Shell>                         ← header kaca (jam hidup + nav route) + control-bar kaca + footer
    <Route path="/">        <Eksplorasi /> </Route>
    <Route path="/prediksi"><Prediksi />   </Route>
  </Shell>
</…>
```

- `App.jsx` menyusut jadi provider + `<Shell>`.
- `src/pages/Eksplorasi.jsx` = `<Hero/> <EksplorasiHarga/> <CuacaKurs/> <RekomendasiBand/> <RingkasanRiset/>`
- `src/pages/Prediksi.jsx` = `<ProyeksiBergulir/> <BacktestChart/> <PrediksiChip grid/> <MaeHorizonChart/> <KonteksHistoris/>`
- `sections/PrediksiModel.jsx` lama dihapus; isinya dipecah ke `pages/Prediksi.jsx` + `sections/ProyeksiBergulir.jsx`.

## 4. Tanggal hidup + Proyeksi Band Bergulir

### 4.1 `src/store/today.js`

```
useToday(intervalMs = 60000) → Date
  — useState(() => new Date()); setInterval update; cleanup on unmount.
  — Menghormati vi.setSystemTime di test.
```
Konsumen: header (`formatTanggal` + jam `HH:MM`), `ProyeksiBergulir`.

### 4.2 `src/lib/proyeksi.js`

```
LEBARAN_DATES = ['2025-03-31', '2026-03-20', '2027-03-10']   // Idul Fitri (perkiraan; verifikasi saat implementasi)

inLebaranWindow(date) → boolean
  — true bila date ∈ [Lebaran − 21 hari, Lebaran + 7 hari] untuk salah satu LEBARAN_DATES

proyeksiBand(bandKomoditas, hargaAnchor, d0, targetDate) → {
  median, p10, p90,   // Rupiah, sudah dibulatkan
  n,                  // hari dari d0 ke targetDate (floor, ≥ 0)
  kondisi,            // 'normal' | 'dekat_lebaran'
  kadaluarsa,         // boolean — n > 30
}
```

Algoritma:
```
n = max(0, floor((targetDate − d0) / hari))
if n === 0 → { median:anchor, p10:anchor, p90:anchor, n:0, kondisi:'normal', kadaluarsa:false }
kondisi = inLebaranWindow(targetDate) ? 'dekat_lebaran' : 'normal'
b = bandKomoditas[kondisi]                 // persen: {p10, median, p90}
t = n / 7
median = anchor · (1 + (b.median/100) · t)          // drift linear terhadap waktu
p10    = anchor · (1 + (b.p10/100)  · √t)           // sebaran melebar ~√waktu (random walk)
p90    = anchor · (1 + (b.p90/100)  · √t)
p10    = max(p10, anchor · 0.1)                     // clamp agar tak negatif/absurd
kadaluarsa = n > 30
```
Catatan: banyak komoditas punya `b.median === 0` → median tetap flat di `anchor`, hanya pita melebar. Itu hasil jujur (persistence + ketidakpastian tumbuh).

### 4.3 `src/charts/ProyeksiChart.jsx` (memperluas `PitaKetidakpastian`)

Data per hari `i` dari `(d0Offset − 90)` sampai `(todayOffset + 7)`:
- `i ≤ d0Offset` → `{ t, aktual: seri[i], p10:null, median:null, p90:null }`
- `i === d0Offset` → set juga `median = aktual` (sambung garis)
- `i > d0Offset` → `{ t, aktual:null, ...proyeksiBand(band, anchor, d0, tanggal(i)) }`

Render (ComposedChart) — ikut konvensi `PitaKetidakpastian` yang ada:
- `<Line dataKey="aktual">` solid, `t.ink`, 2px
- `<Area>` pita p10→p90: teknik base+span, gradien `t.cat2` (kondisi normal) / `t.cat3` (dekat Lebaran) @8%→22%. Bila rentang tanggal proyeksi melintasi window Lebaran, pakai warna sesuai `kondisi` mayoritas titik proyeksi + hatch 45° untuk segmen Lebaran (seperti design-doc §5).
- `<Line dataKey="median">` dashed `4 3`, `t.signature`, 1.5px
- `<ReferenceLine x={tanggal(todayOffset)}>` label "HARI INI", `t.signature`, geser 600ms saat `useToday` berubah (key = today) — di-gate reduced-motion
- `<ReferenceLine>` tiap Lebaran dalam rentang, `strokeDasharray="2 4"`
- `<ChartFrame>` bungkus: judul, caption wajib (§4.4), `<details>` tabel

Seri harga aktual: `pasar === '__semua__'` → `buildEnvelope(perPasar).map(e=>e.avg)`; selain itu `perPasar[pasar]`. `anchor` = nilai non-null terakhir dari seri itu; `d0` = `meta.tanggal_data_terakhir`.

### 4.4 `src/sections/ProyeksiBergulir.jsx`

- **Kartu headline** (`<Glass tone="lime">` bila normal, `tone="dark"` bila kadaluarsa):
  - "Estimasi hari ini · proyeksi band empiris"
  - `Rp {median}` besar (mono), " · rentang Rp {p10} – Rp {p90}"
  - chip: "+{n} hari sejak data terakhir 22 Agu 2026"
  - badge kondisi: "normal" / "menjelang Lebaran"
  - **caption wajib** (persis): *"Proyeksi dari distribusi historis pergerakan harga 7-hari, bukan prediksi bergulir model ML. Data harga aktual berakhir 22 Agu 2026 — makin jauh dari tanggal itu, rentang makin lebar."*
- **`kadaluarsa` (n > 30):** kartu jadi amber, teks utama diganti *"Data harga sudah {n} hari — jalankan ulang pipeline scraping untuk proyeksi yang berarti."*, angka proyeksi tetap tampil tapi `opacity: .55`.
- Di bawahnya: `<ProyeksiChart />`.
- Reaksi ke `FilterContext` (komoditas & pasar) + `useToday()`.

## 5. Peta halaman & section

### `#/` — Eksplorasi (utama)
| Section | Komponen | Catatan |
|---|---|---|
| Hero | `Hero` (restyle kaca) | Pita Ketidakpastian ilustratif 2 tahun tetap |
| Eksplorasi Harga | `EksplorasiHarga` + `HargaChart` | envelope 9 pasar + spotlight + stat tile (tone) |
| Cuaca & Kurs | `CuacaKurs` + 3 chart | tetap 3 chart terpisah |
| Rekomendasi Band | `RekomendasiBand` + `BandKomoditasChart` | kalkulator `rekomendasiBand` tetap |
| Ringkasan Riset | `RingkasanRiset` + **`Timeline`** | 8 tahap sebagai timeline interaktif |

### `#/prediksi` — Model
| Section | Komponen | Catatan |
|---|---|---|
| Proyeksi Bergulir | **`ProyeksiBergulir`** + `ProyeksiChart` | baru — §4 |
| Backtest | `BacktestChart` | aktual/model/baseline, MAE di caption |
| Prediksi ke depan | grid `PrediksiChip` | 9 pasar × {H+1,3,7}, model vs baseline + MAE. Label: "dihitung dari 22 Agu 2026" |
| Akurasi per horizon | `MaeHorizonChart` | dari `riset.json` horizon_direct |
| Konteks historis | **`KonteksHistoris`** | mini line-chart harga 2 tahun komoditas terpilih + kartu angka band (normal vs Lebaran) — read-only, bantu bandingkan saat pilih komoditas |

`BannerKejujuran` tampil di atas section `#/prediksi`. Sub-bar (KomoditasPicker + Pasar + Rentang) muncul di **kedua** halaman.

## 6. Sistem visual (menggantikan design-doc §1–2, §11–12)

### 6.1 Token (`:root` di `styles.css`)

```
                     LIGHT                    DARK
--bg-base             #EEF3E9                  #0B1410
--ink                 #12201A                  #F2F6F0
--ink-muted           #48584E                  rgba(242,246,240,.68)
--line                rgba(18,32,26,.14)       rgba(255,255,255,.10)
--accent              #3C8E1C                  #93E84D
--accent-ink          #0B1410                  #0B1410
--glass               rgba(255,255,255,.55)    rgba(255,255,255,.055)
--glass-brd           rgba(255,255,255,.75)    rgba(255,255,255,.14)
--glass-hi            rgba(255,255,255,.9)      rgba(255,255,255,.22)
--card-pale           #EDF2E7                  #E4EADD
--card-lime           #93E84D                  #93E84D
--card-dark           #10201A                  #0C1712
--r                   16px (panel) · 12px (kartu) · 999px (chip/pill)
--font-display        'IBM Plex Sans', system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif
--font-body           'IBM Plex Sans', system-ui, …
--font-mono           'IBM Plex Mono', 'SF Mono', 'Roboto Mono', ui-monospace, monospace
```
Aturan tema: semua token di `:root` polos (light). Redefinisi di `@media (prefers-color-scheme: dark) { :root:not([data-theme="light"]) }` dan `:root[data-theme="dark"]`. `body { background: var(--bg-base) }` eksplisit.

**`src/tokens.js`** (warna Recharts): `ink/inkMuted/line/surface/bg` diselaraskan ke nilai baru per tema; `surface` → `rgba` kaca gelap/terang (nilai solid untuk atribut SVG — pakai `#F8FAF5` light / `#141E19` dark, bukan `rgba`, karena Recharts butuh warna solid). **Seri chart tidak berubah:** `cat1 #0072B2 / #3C97D4`, `cat2 #009E73 / #12A97F`, `cat3 #E69F00 / #B27B27`, `rain`, `temp`, `naik/turun/stabil`, **`signature #8AB84F / #A6D26A`** — semua persis design-doc §12 (sudah colorblind-tested). Aksen lime UI (`--accent`) **bukan** warna seri dan tidak masuk `tokens.js`.

### 6.2 Background (`src/glass.css`)

```css
body::before{ content:''; position:fixed; inset:0; z-index:-2;
  background:
    radial-gradient(50% 40% at 15% 18%, rgba(147,232,77,.10), transparent 70%),
    radial-gradient(45% 45% at 85% 12%, rgba(27,59,46,.55), transparent 70%),
    radial-gradient(65% 55% at 72% 92%, rgba(14,42,32,.60), transparent 70%),
    var(--bg-base);
}
body::after{ content:''; position:fixed; inset:0; z-index:-1; opacity:.03; pointer-events:none;
  background-image:url("data:image/svg+xml,<svg …feTurbulence baseFrequency=0.9 …/>"); } /* grain ~1KB inline */
```
Light: blob diganti hijau pucat (opacity lebih rendah). Disimpan sebagai grup variabel `--mesh-1/2/3` supaya sekali ganti kalau nanti mau foto.

### 6.3 Utility kaca (`src/glass.css`)

```css
.glass{
  background:var(--glass);
  backdrop-filter:blur(24px) saturate(1.4);
  -webkit-backdrop-filter:blur(24px) saturate(1.4);
  border:1px solid var(--glass-brd);
  border-radius:var(--r);
  box-shadow:inset 0 1px 0 var(--glass-hi), 0 20px 60px -22px rgba(0,0,0,.5);
}
.glass--pale{ background:var(--card-pale); color:#12201A; border-color:transparent; backdrop-filter:none; }
.glass--lime{ background:var(--card-lime); color:var(--accent-ink); border-color:transparent; backdrop-filter:none; }
.glass--dark{ background:var(--card-dark); color:#F2F6F0; border-color:rgba(255,255,255,.08); backdrop-filter:none; }

@supports not ((backdrop-filter:blur(1px)) or (-webkit-backdrop-filter:blur(1px))){
  :root{ --glass:rgba(18,28,23,.93); } :root:not([data-theme="dark"]){ --glass:rgba(248,250,245,.95); }
}
@media (prefers-reduced-transparency: reduce){
  .glass{ backdrop-filter:none; -webkit-backdrop-filter:none; background:var(--bg-base); }
}
@media (forced-colors: active){
  .glass,.glass--pale,.glass--lime,.glass--dark{ background:Canvas; color:CanvasText; border:1px solid CanvasText; backdrop-filter:none; }
}
```

### 6.4 Tipografi

| Elemen | Spec |
|---|---|
| hero h1 | Plex Sans 600 · `clamp(2rem, 5vw, 3.5rem)` · lh 1.05 · `letter-spacing:-.02em` |
| h2 section | Plex Sans 600 · `clamp(1.5rem, 3vw, 2.25rem)` · `-.01em` |
| h3 | Plex Sans 600 · `1.1rem` |
| eyebrow | Plex Mono 500 · `.7rem` · `letter-spacing:.18em` · UPPERCASE · `--accent` · diikuti garis `--line` 1px |
| body | Plex Sans 400 · `.95rem` · lh 1.6 |
| caption/tick | Plex Mono 400 · `.75rem` · `--ink-muted` |
| angka Rupiah/data | Plex Mono 500 · `font-variant-numeric:tabular-nums` |

`index.html`: hapus Fraunces dari `<link>` Google Fonts → `family=IBM+Plex+Sans:wght@400;500;600&family=IBM+Plex+Mono:wght@400;500&display=swap`.

### 6.5 Motion (semua di-gate `@media (prefers-reduced-motion: reduce)` → instan)

| Momen | Spec |
|---|---|
| Ganti route | cross-fade 200ms |
| Section masuk viewport | translateY(12px) + fade 400ms, IntersectionObserver, stagger 60ms antar-anak |
| Panel kaca hover | `--glass-brd` → `--glass-hi` 150ms |
| Node timeline | pulse glow 2s loop pada node aktif; transisi kartu slide 300ms |
| Garis "HARI INI" | geser ke x baru 600ms ease saat tanggal berganti |
| Toggle tema | `background-color`/`color` 200ms |

Tidak ada: parallax, auto-carousel, angka berkedip. Count-up dihapus (design-doc lama §7) — statis.

### 6.6 Aksesibilitas (lantai kualitas, tetap dari PRD §6 + design-doc §10)

- `:focus-visible` outline 2px `--accent` offset 2px pada semua kontrol (chip, node timeline, link, select, input).
- Kontras: `--ink`/bg ≥ 7:1; `--ink-muted` di atas kaca ≥ 4.5:1 **kedua tema** — kaca duduk di atas mesh bervariasi, jadi opacity `--ink-muted` mungkin perlu dinaikkan; **cek wajib saat implementasi** (`tokens.test.js` + manual).
- Tiap chart: `role="img"` + `aria-label` + `<details>` tabel (sudah ada di `ChartFrame`).
- Identitas seri tak pernah warna-saja: legend + label langsung + (arah) ikon.
- Timeline: node = `<button>` dengan `aria-label="Tahap {n}: {judul}"`, `aria-current` pada aktif; panah `<button aria-label="Tahap sebelumnya/berikutnya">`. Bisa dioperasikan penuh keyboard (Tab + Enter, ← → saat fokus di rel).
- KomoditasPicker: chip = `<button role="radio">` dalam `role="radiogroup" aria-label="Komoditas"`; search `<input type="search">` dengan `/` shortcut; hasil kosong → teks "tidak ada komoditas cocok".
- Target sentuh ≥ 40px. Body tidak pernah scroll horizontal (wide content → `overflow-x:auto`).

## 7. Komponen — antarmuka

### `<Glass>` — `src/components/Glass.jsx`
```
<Glass as="section" tone="default|pale|lime|dark" className style>{children}</Glass>
  as    : elemen (default 'div')
  tone  : 'default' → .glass ; lainnya → .glass--{tone}
```

### `<KomoditasPicker>` — `src/components/KomoditasPicker.jsx`
- Konsumsi: `useData('meta.json')`, `useFilter()`
- Panel kaca. Search `<input>` (filter `nama`, case-insensitive, tanpa diakritik).
- Chip dikelompokkan 6 kategori (urutan: bawang, cabai, sayuran, umbi, kacang, buah). Judul grup = eyebrow mono.
- Chip: nama komoditas; `caveat_data` → titik ⚠ + `title`. Aktif → `.glass--lime`.
- Klik → `setKomoditas`. `radiogroup` semantics.
- Mobile (`max-width: 720px`): default collapse → tombol `Komoditas: {nama} ▾`, expand overlay kaca.

### `<Timeline>` — `src/components/Timeline.jsx`
```
<Timeline items={[{ n, judul, isi }]} />
```
- State `aktif` (index, default 0).
- Rel horizontal: `items.length` node `<button>` + garis penghubung. Node aktif glow lime.
- 3 kartu: `items[aktif-1]` (`.glass--pale`), `items[aktif]` (`.glass--lime`), `items[aktif+1]` (`.glass--dark`); yang di luar range → slot kosong/redуп. Mobile → 1 kartu (`items[aktif]`).
- Scrubber pill (`.glass--lime`): `←` `→` + strip tick (`items.length` tick, aktif tebal).
- `←/→`, klik node → `aktif` berubah; kartu slide 300ms (reduced-motion → instan).
- Dipakai di `RingkasanRiset` dengan `items={riset.tahapan}`.

### `<ProyeksiBergulir>` / `<ProyeksiChart>` / `<KonteksHistoris>`
Lihat §4.3–4.4. `KonteksHistoris`: `useData('harga.json')` + `useData('band.json')` → mini `LineChart` harga 2 tahun (1 seri, avg) + 2 `<Glass tone>` kartu angka band normal & dekat_lebaran (p10/median/p90/lebar_band/n) komoditas terpilih.

### Redesign komponen lama (perubahan)
| File | Perubahan |
|---|---|
| `App.jsx` | → shell tipis: provider + `<Shell>` + `<Route>` |
| `src/components/Shell.jsx` (baru, pisah dari App) | header kaca sticky: logo + jam hidup (`useToday`) + `<RouteLink>` Eksplorasi/Prediksi + `<ThemeToggle>`; control-bar kaca sticky: banner "Data s/d 22 Agu 2026" + `<KomoditasPicker>` + Selector pasar + Selector rentang; footer catatan |
| `Selector.jsx` | hanya `pasar` & `rentang` (komoditas pindah ke picker); styling kaca |
| `ChartFrame.jsx` | panel → `.glass`; judul → eyebrow; `<details>` tabel restyle |
| `StatTile.jsx` | prop `tone` opsional (`lime` utk 1 highlight); pakai `<Glass>` |
| `PrediksiChip.jsx` | `<Glass>`; dot model `--accent` |
| `BadgeCaveat`, `BannerKejujuran` | restyle token baru |
| `tokens.js` | nilai `ink/inkMuted/line/surface/bg/signature` per §6.1 |
| `styles.css` | `:root` token baru (§6.1) + reset + `.wrap` + layout + media queries |
| `glass.css` (baru) | background mesh + `.glass*` + `@supports`/reduced-transparency/forced-colors; di-import di `main.jsx` setelah `styles.css` |
| `index.html` | `<link>` font tanpa Fraunces |

## 8. Struktur file (delta)

```
src/
  router.jsx                    (baru)
  glass.css                     (baru)
  store/today.js                (baru)
  lib/proyeksi.js               (baru)
  components/
    Glass.jsx                   (baru)
    KomoditasPicker.jsx         (baru)
    Timeline.jsx                (baru)
    Shell.jsx                   (baru — dipisah dari App.jsx)
    Selector.jsx                (ubah)
    StatTile.jsx ChartFrame.jsx PrediksiChip.jsx BadgeCaveat.jsx BannerKejujuran.jsx  (restyle)
  pages/
    Eksplorasi.jsx              (baru — rakitan section utama)
    Prediksi.jsx                (baru)
  charts/
    ProyeksiChart.jsx           (baru)
    (lainnya: restyle via ChartFrame)
  sections/
    ProyeksiBergulir.jsx        (baru)
    KonteksHistoris.jsx         (baru)
    PrediksiModel.jsx           (HAPUS — dipecah)
    Hero/EksplorasiHarga/CuacaKurs/RekomendasiBand/RingkasanRiset.jsx  (restyle; RingkasanRiset pakai <Timeline>)
  App.jsx                       (susut)
  tokens.js styles.css index.html  (ubah)
```

## 9. Testing

**Pertahankan 27 test lama.** Selector yang mengacu teks aman; yang mengacu struktur (mis. `App.test.jsx` id section) disesuaikan ke shell + route baru. Test yang menyebut `sections/PrediksiModel` dipindah ke `pages/Prediksi.test.jsx`.

Test baru:
| File | Cakupan |
|---|---|
| `lib/proyeksi.test.js` | `proyeksiBand`: n=0 → flat; drift linear; sebaran √t; `b.median=0` → median flat; clamp p10; `kadaluarsa` n>30. `inLebaranWindow` batas ±. `vi.setSystemTime`. |
| `router.test.jsx` | parse `#/prediksi?k=X` → path+query; `navigate` ubah hash; `<Route>` render kondisional; route asing → `/`. |
| `store/today.test.jsx` | `useToday` re-render setelah `vi.advanceTimersByTime`; hormati `vi.setSystemTime`. |
| `components/KomoditasPicker.test.jsx` | search memfilter; klik chip → `setKomoditas`; grup kategori; chip caveat bertanda; hasil kosong. |
| `components/Timeline.test.jsx` | `→` majukan aktif; klik node ke-k; kartu aktif = `items[k].judul`; `aria-current`; reduced-motion tanpa error. |
| `sections/ProyeksiBergulir.test.jsx` | headline = `proyeksiBand` untuk `vi.setSystemTime` tertentu; `n>30` → teks peringatan; caption wajib persis ada; ganti komoditas → angka berubah. |
| `pages/Prediksi.test.jsx` | render proyeksi + backtest + chips (model & baseline & `+X% MAE`) + MAE chart + konteks historis; banner kejujuran ada. |
| `a11y.test.jsx` (perluas) | dua route; panel `div[role=img]` punya `aria-label`; `radiogroup` picker; timeline node punya `aria-label`; jalur `prefers-reduced-transparency` (mock matchMedia) tidak error. |

Setup test (`test-setup.jsx`): tambah fake timers opsional per-test; `matchMedia` sudah stub. `test-fixtures.jsx`: tambah `d0`, `LEBARAN` ke fixture; `stubFetchAll` sudah cover 8 file.

**Pass visual manual:** `npm run dev` → `#/` dan `#/prediksi`; light + dark; 360px; Tab keyboard (focus ring); OS reduced-motion & reduced-transparency; ganti komoditas via chip → cek semua chart + URL `?k=` update; biarkan tab terbuka lewat tengah malam / `setSystemTime` → "HARI INI" & headit­line geser.

## 10. Build & kinerja

- `npm run build` tetap sukses; **tidak ada dependency runtime baru**. Bundle diperkirakan tetap ~165 KB gzip (routing + hooks kecil; komponen baru menggantikan yang lama).
- `harga.json` (920 KB) & `backtest.json` (360 KB) tetap `fetch` lazy per `useData`.
- Font: −1 request (Fraunces dibuang).
- Grain SVG inline ~1 KB di CSS.

## 11. Risiko & cek implementasi

1. **Kontras `--ink-muted` di atas kaca** — mesh gelap bervariasi; teks muted bisa < 4.5:1 di area terang. Cek dengan sampel terburuk; naikkan opacity token bila perlu; tambahkan assertion di `tokens.test.js`.
2. **`backdrop-filter` di Firefox lama / kondisi tertentu** — fallback `@supports` wajib diverifikasi (set opacity kaca tinggi).
3. **Proyeksi kadaluarsa** — per 2026-09-03 sudah `n≈12`; saat demo ke dosen bisa `n>30`. Pastikan mode peringatan amber jelas & tidak memalukan (framing: "perlu refresh data", bukan "error").
4. **`LEBARAN_DATES`** — perkiraan; verifikasi tanggal Idul Fitri 2025–2027 sebelum rilis.
5. **Scroll restoration antar-route** — pastikan pindah route reset scroll ke atas tapi anchor `#/prediksi` tidak dianggap fragment id.
6. **URL query + hash router** — `history.replaceState` dengan hash; hindari loop `hashchange` → filter → replaceState → hashchange. Guard: replaceState tidak memicu `hashchange`; tetap tambahkan cek "nilai sama → skip".
7. **Timeline di mobile** — 3 kartu tak muat; pastikan breakpoint 1-kartu diuji di 360px.

## 12. Yang berubah dari dokumen sebelumnya

- `dashboard-design.md` §1 (token warna), §2 (Fraunces), §7 (count-up), §11 (`:root`), §12 (sebagian `tokens.js`) → digantikan §6 di sini. §3 (palet seri colorblind-safe), §5 (Pita Ketidakpastian), §9 (spesifikasi per-chart), §10 (a11y) **tetap berlaku**.
- `dashboard-implementation-plan.md` → semua Task 1–17 sudah selesai; dokumen ini menambah lapisan di atasnya (routing, halaman prediksi, proyeksi bergulir, redesign).
- PRD `dashboard-PRD.md` → §5.4 (Prediksi) sekarang halaman sendiri + proyeksi bergulir; §6 "satu halaman scroll" dilonggarkan jadi "dua route hash, tetap statis". Prinsip §2 tidak berubah.
