# Dashboard Harga Hasil Bumi — Kab. Bandung

Dashboard statis (React 18 + Vite 5 + Recharts 2). Tanpa backend — semua data
dari 8 file JSON di `public/data/`, semua filter & kalkulasi di browser.
Dependency runtime: hanya `react`, `react-dom`, `recharts`.

## Dev

```bash
npm install
npm run dev
```

## Test

```bash
npm test
```

## Deploy

**Vercel (auto-deploy).** Repo terhubung ke Vercel — setiap push ke `main`
otomatis deploy ke production, tiap PR dapat preview. Build default Vite
(`vite build` → `dist/`), tanpa env var (`base` = `/`). Live:
<https://patani-dashboard.vercel.app>.

**Manual / static host lain.** `npm run build` → deploy folder `dist/`.
`DEPLOY_BASE` men-set `base` path Vite (default `/`); untuk GitHub Pages
project site pakai `/<nama-repo>/`:

```bash
DEPLOY_BASE=/patani-dashboard/ npm run build
```

## Update data

1. **Otomatis (GitHub Actions):** Workflow `.github/workflows/auto-refresh-data.yml` berjalan tiap hari pukul 07:30 WIB untuk menarik data 8 file JSON terbaru yang dihasilkan oleh repo pipeline [`example_scrap`](https://github.com/Hafizhputra27/example_scrap) dan otomatis meng-commit ke repo ini.
2. **Manual:** Di repo pipeline: `./run_pipeline.sh` → salin `dashboard_data/*.json` ke `public/data/` di sini → commit.

Selama data belum di-refresh, halaman `#/prediksi` menandai proyeksi "sudah N hari" dan (bila > 30 hari) meminta pipeline dijalankan ulang.

## Halaman (routing hash, tanpa library)

- **`#/` — Eksplorasi:** hero, harga 9 pasar (envelope + spotlight),
  cuaca & kurs, rekomendasi band + kalkulator, ringkasan riset (timeline
  8 tahap interaktif).
- **`#/prediksi` — Model:** proyeksi band empiris **bergulir** (bergerak
  tiap hari), backtest, kartu prediksi model vs baseline + label MAE, MAE
  per horizon, konteks historis per komoditas.

Komoditas dipilih lewat chip-grid per kategori + search (`KomoditasPicker`);
pilihan disinkron ke URL (`#/prediksi?k=CABE+MERAH+KERITING`) agar bisa
dibagikan. Header menampilkan tanggal/jam hari ini realtime.

## Proyeksi band empiris

"Estimasi hari ini" di `#/prediksi` = proyeksi dari **distribusi historis
pergerakan harga** (`band.json`), bukan prediksi bergulir model ML — model
tidak jalan di browser dan tidak mengalahkan baseline. Dari harga aktual
terakhir (22 Agu 2026): median bergeser linear terhadap waktu, rentang
p10–p90 melebar ~√waktu, dan parameter beralih ke "dekat Lebaran" bila
tanggal target masuk window Lebaran. Angka model dari `prediksi.json` tetap
ditampilkan apa adanya, berlabel "dihitung dari 22 Agu 2026".

## Prinsip (dari PRD §2)

- Setiap prediksi model ML tampil **berpasangan dengan baseline** + label
  `model historis +X% MAE`.
- Banner tanggal data terakhir selalu terlihat; prediksi model dihitung dari
  tanggal data terakhir, bukan hari ini.
- 3 komoditas caveat (`BAWANG MERAH BATU`, `SAYURAN KENTANG LOKAL`,
  `KACANG TANAH KUPAS`) dan sel pasar×komoditas kosong ditandai eksplisit.
- Tiap chart punya alternatif tabel (`<details>`), legend/label (bukan warna
  saja), light + dark tema, `prefers-reduced-motion` / `-transparency` /
  `forced-colors` dihormati.

## Desain

Tempered glass: panel kaca (`.glass`) di atas gradient-mesh gelap, aksen lime
(`--accent`), IBM Plex Sans/Mono. Warna seri chart tetap palet colorblind-safe
terpisah (`src/tokens.js`) — lime bukan warna seri.

## Struktur

- `src/router.jsx` — hash router (`useRoute`/`Route`/`RouteLink`)
- `src/store/` — DataContext (lazy fetch + cache), FilterContext (+ URL sync),
  ThemeContext, `dates.js`, `today.js` (`useToday`)
- `src/lib/` — `series.js`, `stats.js`, `rekomendasi.js`, `proyeksi.js`
- `src/components/` — `Glass`, `KomoditasPicker`, `Timeline`, `Shell`, dll
- `src/charts/` — komponen Recharts + `ChartFrame` + `ProyeksiChart`
- `src/pages/` — `Eksplorasi.jsx`, `Prediksi.jsx`
- `src/sections/` — section per halaman
- `src/styles.css` + `src/glass.css` — token + lapisan kaca

Spec & plan: `docs/superpowers/specs/` dan `docs/superpowers/plans/`.
