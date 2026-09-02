# Dashboard Harga Hasil Bumi — Kab. Bandung

Dashboard statis (React 18 + Vite 5 + Recharts 2). Tanpa backend — semua data
dari 8 file JSON di `public/data/` (salinan dari pipeline `example_scrap`),
semua filter & kalkulasi di browser.

## Dev

```bash
npm install
npm run dev
```

## Test

```bash
npm test
```

## Build & deploy

```bash
DEPLOY_BASE=/patani-dashboard/ npm run build
```

Deploy folder `dist/` ke GitHub Pages / Netlify / Vercel. `DEPLOY_BASE` men-set
`base` path Vite (default `/`); untuk GitHub Pages project site pakai
`/<nama-repo>/`.

## Update data

Di repo pipeline: `./run_pipeline.sh` → salin `dashboard_data/*.json` ke
`public/data/` di sini → commit.

## Prinsip

- Setiap prediksi model ML tampil **berpasangan dengan baseline** + label
  `model historis +X% MAE` — model tidak mengalahkan baseline persistence di
  horizon manapun 1–7 hari (lihat section Ringkasan Riset).
- Banner tanggal data terakhir selalu terlihat; prediksi dihitung dari tanggal
  data terakhir, bukan hari ini.
- 3 komoditas caveat (`BAWANG MERAH BATU`, `SAYURAN KENTANG LOKAL`,
  `KACANG TANAH KUPAS`) dan sel pasar×komoditas kosong ditandai eksplisit.
- Tiap chart punya alternatif tabel (`<details>`), legend/label (bukan warna
  saja), light + dark tema, dan menghormati `prefers-reduced-motion`.

## Struktur

- `src/store/` — DataContext (lazy fetch + cache), FilterContext, ThemeContext, dates
- `src/lib/` — series/stats helpers, `rekomendasiBand()` (port band logic)
- `src/charts/` — komponen Recharts + `ChartFrame`
- `src/components/` — Selector, ThemeToggle, PrediksiChip, dll
- `src/sections/` — 6 section halaman
- `src/tokens.js` — warna chart (design doc §12)
