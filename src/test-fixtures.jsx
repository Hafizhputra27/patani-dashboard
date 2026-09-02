import { vi } from 'vitest'

const META = {
  tanggal_data_terakhir: '2026-08-22',
  tanggal_data_awal: '2024-08-22',
  pasar: ['Pasar Banjaran', 'Pasar Ciwidey'],
  komoditas: [
    { nama: 'CABE MERAH KERITING', kategori: 'cabai', caveat_data: false },
    { nama: 'BAWANG MERAH BATU', kategori: 'bawang', caveat_data: true },
  ],
  catatan: ['catatan uji satu', 'catatan uji dua'],
}

const N = 40
const seq = (base, step) => Array.from({ length: N }, (_, i) => base + i * step)

const HARGA = {
  tanggal_awal: '2024-08-22',
  n_hari: N,
  komoditas: {
    'CABE MERAH KERITING': { 'Pasar Banjaran': seq(40000, 100), 'Pasar Ciwidey': seq(38000, 120) },
    'BAWANG MERAH BATU': { 'Pasar Banjaran': seq(30000, 50), 'Pasar Ciwidey': Array(N).fill(null) },
  },
}

const CUACA = {
  tanggal_awal: '2024-08-22',
  pasar: {
    'Pasar Banjaran': { curah_hujan_mm: seq(0, 1), suhu_avg: seq(24, 0), suhu_min: seq(20, 0), suhu_max: seq(30, 0) },
    'Pasar Ciwidey': { curah_hujan_mm: seq(1, 1), suhu_avg: seq(22, 0), suhu_min: seq(18, 0), suhu_max: seq(28, 0) },
  },
}

const KURS = { tanggal_awal: '2024-08-22', kurs_usd_idr: seq(15600, 5) }

const BAND = {
  horizon: 7,
  komoditas: {
    'CABE MERAH KERITING': {
      normal: { p10: -16.7, p25: -8.3, median: 0, p75: 9.4, p90: 25, lebar_band: 41.7, n: 5032 },
      dekat_lebaran: { p10: -30, p25: -20, median: 0, p75: 20, p90: 37.1, lebar_band: 67.1, n: 395 },
    },
    'BAWANG MERAH BATU': {
      normal: { p10: -6, p25: -2, median: 0, p75: 2, p90: 6, lebar_band: 12, n: 900 },
      dekat_lebaran: { p10: -10, p25: -4, median: 0, p75: 4, p90: 10, lebar_band: 20, n: 300 },
    },
  },
}

const PRED = {
  tanggal_anchor_range: ['2026-08-16', '2026-08-22'],
  baris: [
    {
      pasar: 'Pasar Banjaran', komoditas: 'CABE MERAH KERITING', tanggal_anchor: '2026-08-22', harga_terakhir: 35000,
      tanggal_target_h1: '2026-08-23', pred_model_h1: 35011, pred_baseline_h1: 35000, mae_model_hist_h1: 619, mae_baseline_hist_h1: 460, model_lebih_buruk_pct_h1: 34.5,
      tanggal_target_h3: '2026-08-25', pred_model_h3: 34945, pred_baseline_h3: 35000, mae_model_hist_h3: 1181, mae_baseline_hist_h3: 939, model_lebih_buruk_pct_h3: 25.7,
      tanggal_target_h7: '2026-08-29', pred_model_h7: 35111, pred_baseline_h7: 35000, mae_model_hist_h7: 2231, mae_baseline_hist_h7: 1592, model_lebih_buruk_pct_h7: 40.1,
    },
  ],
}

const BACKTEST = {
  horizon: 7,
  komoditas: {
    'CABE MERAH KERITING': {
      'Pasar Banjaran': {
        tanggal: ['2026-06-24', '2026-06-25', '2026-06-26'],
        aktual: [35000, 35500, 36000],
        model: [35200, 35100, 36400],
        baseline: [34800, 35000, 35500],
      },
    },
  },
}

const RISET = {
  tahapan: [{ n: 1, judul: 'Bug data kotor', isi: 'detail tahap satu' }],
  horizon_direct: [{ horizon: 1, mae_model: 619, mae_baseline: 460, selisih_pct: 34.5 }],
  horizon_recursive: [{ horizon: 'H+1', mae_model: 658, mae_baseline: 460 }],
  kesimpulan: 'Fitur tidak cukup untuk mengalahkan baseline.',
}

const BY_FILE = {
  'meta.json': META,
  'harga.json': HARGA,
  'cuaca.json': CUACA,
  'kurs.json': KURS,
  'band.json': BAND,
  'prediksi.json': PRED,
  'backtest.json': BACKTEST,
  'riset.json': RISET,
}

export function stubFetchAll() {
  vi.stubGlobal('fetch', vi.fn((url) => {
    const key = Object.keys(BY_FILE).find((f) => String(url).includes(f))
    return Promise.resolve({ ok: true, json: () => Promise.resolve(BY_FILE[key] ?? {}) })
  }))
}

export { META, HARGA, CUACA, KURS, BAND, PRED, BACKTEST, RISET }
