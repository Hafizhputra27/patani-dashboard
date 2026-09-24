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

## Prediksi harga — dari mana angkanya?

Angka model di `#/prediksi` dihasilkan di repo pipeline [`example_scrap`](https://github.com/Hafizhputra27/example_scrap), bukan di browser — dashboard hanya membaca `public/data/prediksi.json` dan menampilkannya.

### 1. Rumus

Bukan regresi linear biasa. LightGBM = gabungan **500 decision tree** (satu model per horizon: `model_direct_h{1,3,7}.txt`). Model memprediksi **selisih harga**, lalu hasilnya dijumlahkan ke harga terakhir yang tercatat (**anchor**):

| Termin | Arti |
| --- | --- |
| `harga_prediksi(t)` | harga prediksi di hari target `t` |
| `harga_anchor` | harga terakhir yang lengkap ("hari ini") |
| `Δ(x)` | selisih yang diprediksi = `0.05 × Σ(m=1..500) T_m(x)` |
| `T_m(x)` | pohon ke-`m` dari 500 pohon, tiap pohon punya aturan percabangan sendiri |
| `x` | fitur input (poin 2) |

$$harga\_prediksi(t) = harga\_anchor + 0.05 \times \sum_{m=1}^{500} T_m(x)$$

### 2. Fitur input (per pasar + komoditas)

| Grup | Fitur |
| --- | --- |
| Harga historis | harga kemarin (`lag1`), 7 hari lalu (`lag7`), 14 hari lalu (`lag14`), rata-rata & deviasi rolling 7 hari, rata-rata rolling 14 hari |
| Cuaca | curah hujan hari ini + akumulasi 7 & 14 hari, suhu rata-rata/min/max |
| Kurs | USD/IDR hari ini & 7 hari lalu |
| Kalender | hari-dalam-minggu, bulan, akhir pekan, jarak hari ke Lebaran terdekat |

### 3. Sumber data

| Data | Sumber |
| --- | --- |
| Harga harian | SIBAPOKTING Kab. Bandung (di-scrape manual, tidak ada API) |
| Cuaca | Open-Meteo |
| Kurs USD/IDR | Frankfurter (ECB) |

Scope: 9 pasar, 25 komoditas, rentang 2024-08-22 s.d. 2026-08-22.

### 4. Bagaimana prediksi dibuat

Untuk tiap (pasar, komoditas): ambil baris terakhir yang lengkap sebagai anchor ("hari ini"), hitung fitur kalender untuk tanggal target (`anchor` + H hari), jalankan model horizon H → dapat `delta` → `harga_prediksi = anchor + delta`.

> **Prediksi dihitung dari TANGGAL DATA TERAKHIR, bukan dari hari ini.**

### 5. Keterbatasan (angka nyata dari `riset.json`)

Model ML **tidak mengalahkan baseline naif** "harga besok = harga hari ini" — MAE model > MAE baseline di semua horizon:

| Horizon | MAE model | MAE baseline | Selisih |
| --- | ---: | ---: | ---: |
| H+1 | 602 | 481 | 25,2% |
| H+3 | 1.246 | 979 | 27,2% |
| H+7 | 1.905 | 1.648 | 15,6% |

- Prediksi model ditampilkan sebagai **pembanding, bukan angka otoritatif**.
- Rekomendasi band harga dibangun dari **distribusi empiris (p10–p90)**, bukan dari model ML.
- Harga = acuan negosiasi petani, bukan harga pasti tengkulak.

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
