# Design Specification v2 — Patani Dashboard (Modern SaaS Style)

Dokumen spesifikasi desain antarmuka baru untuk **Patani Dashboard** berbasis layout modular modern (terinspirasi dari referensi dashboard SaaS *EdgesPay*).

---

## 1. Visi Desain & Konsep Layout

Mengubah format halaman scroll konvensional menjadi **Aplikasi Dashboard Modern Terpadu (*Unified App Shell*)** dengan struktur:
* **Kanvas Luar (*Outer Canvas*):** Warna latar lembut bergradasi netral (`#E8EEF8` / `#F0F4FA`).
* **Kontainer Aplikasi Utama (*Main App Container*):** Kartu putih besar melayang dengan sudut membulat elegan (`border-radius: 24px`), border halus, dan bayangan lembut.
* **Navigasi Sidebar Kiri (*Left Sidebar Navigation*):** Navigasi vertikal terstruktur dengan ikon modern, active indicator pill ungu lembut (`#ECE6FF`), dan status data di bagian bawah.
* **Top Bar Bersih (*Uncluttered Top Bar*):** Memuat judul halaman/greeting dinamis, info pembaruan data, search bar komoditas terintegrasi, dan jam realtime. **Prediksi Model dan filter-filter pasar tidak lagi menumpuk di header**.
* **Grid Widget Modular:** Kartu metrik bergradasi pastel (*Overview Cards*), grafik tren utama dengan filter pill di pojok atas, daftar 9 pasar tradisional bergaya list transaksi, dan widget aksi rekomendasi panen/jual.

---

## 2. Palet Warna & Token Visual (*Color Tokens*)

### A. Permukaan & Latar Belakang
| Token | Nilai Hex | Fungsi |
|---|---|---|
| `--app-canvas` | `#EAEFF8` | Latar belakang kanvas di luar kontainer aplikasi |
| `--app-surface` | `#FFFFFF` | Latar kartu utama dashboard & sidebar |
| `--surface-subtle` | `#F8FAFC` | Latar widget sekunder, tabel, dan input |
| `--border-subtle` | `#E2E8F0` | Garis pemisah halus antar komponen |

### B. Warna Teks & Tipografi
| Token | Nilai Hex | Fungsi |
|---|---|---|
| `--text-primary` | `#1E293B` | Judul, angka statistik utama, teks penting |
| `--text-secondary` | `#64748B` | Label, subjudul, teks bantuan, tanggal |
| `--text-muted` | `#94A3B8` | Caption sekunder, placeholder |

### C. Aksen Pastel Kartu (*Pastel Metric Cards*)
| Kategori | Latar Kartu | Teks / Aksen | Nilai Metrik Contoh |
|---|---|---|---|
| **Ungu Pastel (Lavender)** | `#EDE9FE` / `#F5F3FF` | `#6D28D9` / `#7C3AED` | Harga Terakhir Komoditas |
| **Biru Pastel (Sky/Soft Blue)** | `#E0F2FE` / `#F0F9FF` | `#0369A1` / `#0284C7` | Rata-Rata 9 Pasar |
| **Hijau Pastel (Mint)** | `#DCFCE7` / `#F0FDF4` | `#15803D` / `#16A34A` | Rentang Estimasi Risiko (p10–p90) |
| **Kuning/Orange Pastel** | `#FEF3C7` / `#FFFBEB` | `#B45309` / `#D97706` | Status Musiman / Menjelang Lebaran |

---

## 3. Tata Letak (*Layout Architecture*)

```
┌──────────────────────────────────────────────────────────────────────────────────────────────────┐
│ Outer Canvas: #EAEFF8                                                                            │
│  ┌────────────────────────────────────────────────────────────────────────────────────────────┐  │
│  │ Main App Card (White #FFFFFF, Radius: 24px, Shadow)                                        │  │
│  │ ┌──────────────┬─────────────────────────────────────────────────────────────────────────┐ │  │
│  │ │ SIDEBAR      │ TOP BAR: [👋 Halo, Petani] [Search Komoditas] [🕒 08 Sep 2026] [Tema]    │ │  │
│  │ │              ├─────────────────────────────────────────────────────────────────────────┤ │  │
│  │ │ 🌱 Patani Hub│ OVERVIEW METRICS ROW:                                                   │ │  │
│  │ │              │ ┌───────────────┐ ┌───────────────┐ ┌───────────────┐                   │ │  │
│  │ │ 📊 Ringkasan │ │ 🟣 Harga Kini │ │ 🔵 Rata-rata  │ │ 🟢 Estimasi 7H│                   │ │  │
│  │ │ 📈 Tren Pasar│ └───────────────┘ └───────────────┘ └───────────────┘                   │ │  │
│  │ │ 🤖 Prediksi  ├─────────────────────────────────────────────────────────────────────────┤ │  │
│  │ │ 🌤️ Cuaca     │ MAIN GRID:                                                              │ │  │
│  │ │ 💡 Rekomendasi│ ┌───────────────────────────┬─────────────────────────────────────────┐ │ │  │
│  │ │ 📑 Riset     │ │ Daftar 9 Pasar            │ Grafik Utama (Pita Ketidakpastian)      │ │ │  │
│  │ │              │ │ • Baleendah: Rp 38.000    │ [Filter Rentang: 3Bln | 1Thn | 2Thn]    │ │ │  │
│  │ │ ──────────── │ │ • Banjaran:  Rp 39.000    │ ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~ │ │ │  │
│  │ │ ⚙️ Data Aktif │ │ • Majalaya:  Rp 42.000    │                                         │ │ │  │
│  │ │ s/d 8 Sep    │ ├───────────────────────────┼─────────────────────────────────────────┤ │ │  │
│  │ │              │ │ Kalkulator Rekomendasi    │ Cuaca Pasar & Kurs USD/IDR              │ │ │  │
│  │ └──────────────┴─┴───────────────────────────┴─────────────────────────────────────────┴─┘ │  │
│  └────────────────────────────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Rincian Penataan Komponen

### 4.1 Navigasi Sidebar (Kiri)
* **Header Sidebar:** Logo tunas/daun hijau + teks tebal **"Patani"**.
* **Menu Items:**
  1. **Ringkasan (Dashboard Overview):** Menampilkan ringkasan menyeluruh harga, kartu metrik, chart tren utama, dan daftar harga 9 pasar dalam satu pandangan.
  2. **Eksplorasi Pasar:** Eksplorasi mendalam perbandingan harga 9 pasar, envelope, dan statistik komoditas.
  3. **Prediksi Model:** **Menu khusus di sidebar** (tidak mengotori header). Di halaman ini, kontrol komoditas dan pasar diletakkan secara terintegrasi di dalam halaman, menampilkan evaluasi Backtest 60 hari, perbandingan MAE, dan Proyeksi Bergulir.
  4. **Cuaca & Kurs:** Menampilkan curah hujan harian, temperatur pasar, dan nilai tukar USD/IDR.
  5. **Rekomendasi Panen:** Kalkulator rentang risiko 7 hari normal vs Lebaran.
  6. **Riset & Metodologi:** Timeline 8 tahap riset dan tabel pembuktian model.
* **Footer Sidebar:** Status tanggal data terakhir (*Data s/d 08 Sep 2026*) dan toggle tema terang/gelap.

### 4.2 Top Bar (Header Utama)
* **Sapaan / Title:** *"Pasar Bahan Pokok · Kab. Bandung"* + subtext *"Pembaruan otomatis data harian"*.
* **Komoditas Selector:** Ditempatkan sebagai dropdown pencarian yang rapi dan elegan di area header tengah/kanan, bukan menumpuk beberapa dropdown berjejer.
* **Tanggal & Waktu Realtime:** Jam dan tanggal lokal Bandung.
* **Tidak Ada Prediksi Switcher di Header:** Prediksi Model menjadi halaman/tampilan tersendiri via sidebar.

### 4.3 Widget Metrik Pastel (*Top Overview Cards*)
* 3 kartu ringkasan berjejer rapi di atas:
  1. **Harga Terakhir (Ungu Pastel):** Nilai harga komoditas terkini di pasar terpilih + badge fluktuasi.
  2. **Rata-Rata 9 Pasar (Biru Pastel):** Harga rata-rata seluruh pasar Kabupaten Bandung.
  3. **Rentang Estimasi 7 Hari (Hijau Pastel):** Batas bawah (p10) hingga batas atas (p90).

### 4.4 Daftar 9 Pasar (*Market List Widget*)
* Desain menyerupai list transaksi di referensi (ikon bulat pasar, nama pasar tradisional, status laporan, dan harga terkini berwarna kontras).

### 4.5 Grafik Utama dengan Filter Pill
* Menampilkan *Pita Ketidakpastian* atau *Tren Harga*.
* Di pojok kanan atas grafik disematkan pill switcher rentang waktu (`3 Bulan`, `1 Tahun`, `2 Tahun`) mirip pill switcher `Week / Month / 6 months / Year` pada referensi.

---

## 5. Rencana Transisi & Kompatibilitas

* **Responsif:** Pada layar desktop lebar $\ge 1024\text{px}$, sidebar ditampilkan di sisi kiri dengan layout grid 2/3 kolom. Pada tablet & mobile ($< 1024\text{px}$), sidebar otomatis menjadi collapsible menu / bottom bar yang nyaman diakses.
* **Testing:** Memastikan semua test suite (55 skenario pengujian unit & a11y) tetap lolos 100%.
