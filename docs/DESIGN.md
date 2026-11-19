# DESIGN.md — KiloTrack (Aplikasi Laundry Kiloan)

**Versi:** 1.0 · **Tanggal:** 19 November 2026 · **Tujuan:** Design system + spesifikasi layar untuk generate UI yang konsisten di Google Stitch
**Dokumen pendamping:** `PRD_laundry_kiloan.md` (referensi fitur F1–F8)

> File ini mengikuti format DESIGN.md yang dikenali Google Stitch — file markdown agent-friendly yang berisi aturan desain untuk diimpor/diekspor antar tool. Gunakan bagian "Stitch Prompts" di Lampiran untuk generate tiap layar dengan gaya yang identik.

---

## 1. Identitas Brand

- **Nama produk:** KiloTrack
- **Tagline:** "Cucian Anda, Terlacak Sampai Selesai"
- **Kepribadian:** bersih, terpercaya, ramah, efisien. Nuansa "segar dan bersih" seperti cucian yang baru selesai — bukan korporat kaku, bukan juga mainan anak.
- **Metafora visual:** air + kebersihan + progres. Hindari: warna neon, gradien mencolok, ilustrasi kartun.
- **Bahasa UI:** Bahasa Indonesia, sapaan "Kak" untuk customer (mis. "Cucian Kak Budi"), netral untuk admin. Angka rupiah selalu `Rp20.000` (titik ribuan).

## 2. Warna

### 2.1 Palet Utama
| Token | Hex | Penggunaan |
|---|---|---|
| `primary` | `#0E7490` (teal 700) | Tombol utama, link, item nav aktif, header aktif |
| `primary-dark` | `#155E75` | Hover state tombol utama |
| `primary-light` | `#E0F2F7` | Background elemen terpilih, chip aktif |
| `accent` | `#F59E0B` (amber 500) | Aksi sekunder menonjol: badge "Siap Diambil", highlight estimasi selesai |
| `surface` | `#FFFFFF` | Kartu, tabel, form |
| `background` | `#F8FAFC` (slate 50) | Latar halaman admin & tracking |
| `text-primary` | `#0F172A` (slate 900) | Teks utama |
| `text-secondary` | `#64748B` (slate 500) | Label, teks bantu, placeholder |
| `border` | `#E2E8F0` (slate 200) | Border kartu, divider, outline input |

### 2.2 Warna Semantik (Status Order — KRITIS untuk konsistensi)
Status `diterima` → `siap_diambil` → `selesai` harus selalu memakai warna yang sama di SEMUA layar (badge tabel, progress bar tracking, kartu dashboard):

| Status | Warna badge | Hex background / teks |
|---|---|---|
| `diterima` | Slate | `#F1F5F9` bg / `#334155` text — "Diterima" |
| `dicuci` | Blue | `#DBEAFE` bg / `#1D4ED8` text — "Dicuci" |
| `dikeringkan` | Indigo | `#E0E7FF` bg / `#4338CA` text — "Dikeringkan" |
| `disetrika` | Purple | `#F3E8FF` bg / `#7E22CE` text — "Disetrika" |
| `siap_diambil` | Amber | `#FEF3C7` bg / `#B45309` text — "Siap Diambil" |
| `selesai` | Green | `#DCFCE7` bg / `#15803D` text — "Selesai" |
| `dibatalkan` | Red | `#FEE2E2` bg / `#B91C1C` text — "Dibatalkan" |

### 2.3 Status Lain
- Sukses (toast/aktif): `#16A34A` · Error/validasi: `#DC2626` · Warning: `#D97706`

### 2.4 Aturan Warna
- Rasio kontras teks minimal WCAG AA (4.5:1). Jangan taruh teks putih di atas `primary-light`.
- Maksimal 1 warna aksen per layar. `accent` hanya untuk info penting (siap diambil, estimasi selesai), jangan untuk dekorasi.
- Jangan gunakan merah untuk hal non-error. Jangan gunakan gradien warna-warni.

## 3. Tipografi

- **Font family:** `Plus Jakarta Sans` (Google Font — tersedia di Stitch, terlihat modern, mendukung Bahasa Indonesia dengan baik). Fallback: `Inter`, lalu `system-ui`.
- **Bobot yang dipakai:** `400` (body), `500` (label), `600` (judul komponen), `700` (angka total, H1).

| Style | Ukuran | Weight | Line-height | Penggunaan |
|---|---|---|---|---|
| Display | 28px | 700 | 1.2 | Angka omzet besar di dashboard |
| H1 | 24px | 700 | 1.3 | Judul halaman admin |
| H2 | 18px | 600 | 1.4 | Judul kartu, judul section |
| Body | 14px | 400 | 1.6 | Teks default UI admin |
| Label | 13px | 500 | 1.4 | Label form, nama kolom |
| Caption | 12px | 400 | 1.4 | Timestamp, teks bantu |
| Tabular | 14px | 600 | 1.2 | Angka tabel — selalu `tabular-nums` agar rata kolom |

- Tracking page (customer, mobile): Body boleh 15–16px karena dibaca di HP.
- Jangan pakai italic. Jangan pakai font serif. Jangan underline non-link.

## 4. Spacing, Radius, Shadow, Grid

- **Satu unit spacing:** 4px. Semua jarak adalah kelipatan 4 (8, 12, 16, 24, 32, 48).
- **Padding standar:** halaman 24px (desktop) / 16px (mobile); kartu 16px; tombol 12px vertikal × 16px horizontal; input 10px vertikal × 12px horizontal.
- **Radius:** kartu & modal `12px`; tombol & input `8px`; badge/chip `999px` (pill).
- **Shadow:** hanya 2 level. `shadow-sm`: `0 1px 2px rgba(15,23,42,0.06)` untuk kartu; `shadow-md`: `0 4px 12px rgba(15,23,42,0.10)` untuk elemen mengambang (dropdown, modal, toast). Tidak ada shadow berlapis dramatis.
- **Grid admin (desktop):** sidebar tetap 240px + konten max-width 1200px, gap 24px.
- **Breakpoints:** mobile < 640px (tracking page didesain mobile-first), tablet 640–1024px, desktop > 1024px (admin didesain desktop-first).

## 5. Ikon

- **Set ikon:** Material Symbols (Outlined) — set default Stitch, konsisten dengan ekspor code Tailwind.
- Ukuran: 20px di dalam tombol/label; 24px di navigasi; 48–64px di empty state.
- Ikon semantik tetap di seluruh layar:
  - Dashboard = `dashboard` · Order = `receipt_long` · Customer = `people` · Layanan/Harga = `local_laundry_service` · Pengaturan = `settings` · Logout = `logout`
  - WhatsApp = ikon chat/`chat` berwarna `#16A34A` · QR = `qr_code_2` · Print = `print` · Status berikutnya = `arrow_forward` · Cari = `search` · Tambah = `add`
- Jangan campur set ikon (jangan Material + Lucide di satu layar). Jangan kasih warna sendiri pada ikon kecuali disebutkan.

## 6. Komponen Inti

### 6.1 Button
| Varian | Tampilan | Penggunaan |
|---|---|---|
| Primary | bg `primary`, teks putih, radius 8px | "Simpan Order", "Kirim Nota via WA", aksi utama tiap form |
| Secondary | bg putih, border `border`, teks `text-primary` | "Batal", "Print", aksi sekunder |
| Success | bg `#16A34A`, teks putih | Tombol terkait WhatsApp |
| Danger | bg `#DC2626`, teks putih | "Batalkan Order" (selalu dengan konfirmasi modal) |
| Ghost | tanpa bg, teks `primary` | "Lihat Semua", link tabel |

Disabled: opacity 40%, cursor not-allowed. Semua tombol berisi ikon diletakkan di kiri teks.

### 6.2 Card
Background putih, radius 12px, `shadow-sm`, border 1px `border`, padding 16px. Kartu dashboard ringkasan: ikon 40px di lingkaran `primary-light` + angka Display + label Caption.

### 6.3 Status Badge
Pill (radius 999px), padding 4px×12px, font 12px/500, kombinasi warna sesuai tabel 2.2. Selalu teks kapital awal ("Dicuci"), tanpa ikon di dalam badge.

### 6.4 Form Input
Radius 8px, border 1px `border`, fokus: border `primary` + ring 2px `primary-light`. Label di atas input (13px/500), teks bantu/error Caption di bawah. Error: border `#DC2626` + teks bantu merah. Placeholder berwarna `text-secondary`.

### 6.5 Tabel (Admin)
Header: bg `background`, teks Caption uppercase tracking-wide. Baris: border-bottom `border`, hover `primary-light` 40%. Aksi di kolom terakhir, rata kanan. Di mobile, tabel berubah jadi daftar kartu (bukan scroll horizontal).

### 6.6 Modal & Toast
Modal: max-width 480px, radius 12px, `shadow-md`, backdrop hitam 40%. Toast: fixed bottom-right (desktop) / bottom-center (mobile), radius 8px, ikon status + teks Body, auto-hide 3 detik.

### 6.7 Progress Tracker (Khas Halaman Tracking)
6 langkah vertikal di mobile: lingkaran 32px + garis penghubung. Tahap tercapai = lingkaran solid `primary` + ikon `check` putih; tahap berjalan = lingkaran solid `accent` berdenyut halus; tahap mendatang = lingkaran outline `border`. Di samping tiap langkah: nama tahap (Body/500) + timestamp (Caption) bila sudah tercapai.

### 6.8 Empty State
Ikon besar 64px warna `text-secondary` 40%, judul H2, satu kalimat penjelasan, satu tombol Primary "Buat Order Pertama" / "Atur Harga Layanan".

## 7. Arsitektur Layout

### 7.1 Shell Admin (Desktop, F1–F6, F8)
- Sidebar kiri 240px putih: logo KiloTrack atas, nav vertikal dengan ikon, user avatar + nama di bawah, tombol Logout.
- Nav aktif: bg `primary-light`, teks `primary`, garis indikator 3px `primary` di tepi kiri.
- Topbar konten: judul H1 halaman + breadcrumb ringan, tombol Primary aksi utama halaman di kanan ("+ Order Baru").
- Konten: grid kartu di atas, tabel di bawah, padding halaman 24px.

### 7.2 Shell Tracking Customer (Mobile-first, F7)
- Tanpa sidebar, tanpa nav admin. Header ramping: logo kecil + nama laundry.
- Latar `background`, kartu status putih di tengah, max-width 480px di desktop (tengah layar, seperti mobile app).
- Tombol "Cek Status" utama; halaman hasil tracking memakai Progress Tracker 6.7.
- Tidak ada tombol selain "Refresh" — read-only total.

## 8. Spesifikasi Per Layar (8 layar — sesuai fitur PRD)

**S1 · Login Admin** (mobile+desktop)
Split layout: kiri panel `primary` dengan ilustrasi cucian bersih + tagline; kanan form putih (email, password, tombol Primary "Masuk"). Tanpa "lupa password" di MVP.

**S2 · Dashboard Admin** (F8)
4 kartu ringkasan atas (Omzet Hari Ini, Order Baru, Dalam Proses, Siap Diambil — angka Display, kartu "Siap Diambil" ber-border `accent`); grafik batang omzet 7 hari; tabel 10 order terbaru (kode, customer, total, badge status, waktu, aksi). Filter periode pill di kanan atas.

**S3 · Daftar & Kelola Layanan/Harga** (F1)
Header "Layanan & Harga" + tombol "+ Kategori". Tabel: nama kategori, satuan (chip kg/pcs), rentang harga ("7kg — Rp20.000"), status aktif toggle. Klik baris → expand daftar harga bertingkat kategori tsb + tombol "+ Harga" per kategori. Modal form kategori & form harga.

**S4 · Form Order Baru** (F3) — **layar terpenting, harus tercepat dipakai**
3 seksi dalam satu halaman: (1) Customer — input autocomplete nama/WA, atau "+ Customer Baru" inline (nama wajib, WA opsional); (2) Rincian Cucian — baris item berulang: dropdown kategori + qty + harga terhitung otomatis per baris (mis. "7kg × Rp20.000"), tombol "+ Tambah Item"; (3) Ringkasan sticky di bawah (mobile) / kanan (desktop): total besar, catatan opsional, tombol Primary besar "Simpan & Kirim Nota". Setelah simpan → layar sukses dengan 3 tombol: "Kirim via WhatsApp" (Success), "Print Nota" (Secondary), "Selesai" (Ghost).

**S5 · Daftar Order** (F3/F6)
Filter tab horizontal: Semua · Diterima · Dicuci · Selesai · Siap Diambil; search kode/nama. Tabel seperti 6.5 dengan kolom aksi "Lanjut Tahap →" (tombol kecil Primary) di tiap baris berproses. Detail order: nota lengkap, QR code, timeline status (riwayat F6).

**S6 · Kelola Customer** (F2)
Search bar + tabel (nama, WA, jumlah order, total belanja, aksi "Lihat Riwayat"). Detail customer: kartu info + riwayat order list.

**S7 · Halaman Cek Status (publik)** (F7, bagian 1)
Landing minimal: logo, headline H1 "Cek Status Cucian Kak/Ibu", satu input besar kode order ("LN-261119-0042") + tombol Primary "Cek Status". Ilustrasi ikon `local_laundry_service` besar. Jika tanpa token → layar verifikasi 4 digit terakhir nomor WA (2 input besar, fokus otomatis).

**S8 · Hasil Tracking (publik)** (F7, bagian 2)
Kartu utama: sapaan "Halo, Kak Budi 👋", kode order + tanggal terima, Progress Tracker 6 langkah, kartu estimasi selesai (border `accent`, ikon jam), ringkasan rincian item ringkas, link kecil "Buka nota lengkap". Auto-refresh 30 detik dengan indikator halus. Status `siap_diambil` → confetti halus / ikon `celebration` + banner amber "Cucian siap diambil! 🎉".

## 9. Aturan Konsistensi (Do & Don't)

**Do:**
- Angka rupiah selalu `Rp20.000`, kode order selalu format `LN-261119-0042`, monospace tidak perlu.
- Satu layar = satu aksi utama (satu tombol Primary menonjol).
- Status selalu pakai badge, bukan teks polos.
- Mobile tracking harus nyaman dipakai satu tangan.

**Don't:**
- Jangan pakai dark mode di MVP (semua layar light).
- Jangan pakai emoji di UI admin (boleh minimal di pesan WhatsApp & tracking customer).
- Jangan pakai warna selain yang ada di tabel 2.1–2.3.
- Jangan buat login/registrasi untuk customer.

## 10. Cara Pakai di Google Stitch

1. **Mode:** generate di **Standard mode** (bukan Thinking/Pro) supaya opsi Copy to Figma tersedia. Ekspor dibatasi 16 layar per kali ekspor — 8 layar di dokumen ini aman.
2. **Urutan kerja:** generate dulu S2 (dashboard) → kunci gaya → generate S1, S3–S6 (shell admin yang sama) → terakhir S7–S8 (mobile, shell berbeda). Jangan campur shell admin & tracking dalam satu sesi generate.
3. **Konsistensi:** setelah layar pertama jadi, gunakan iterasi chat ("ubah X") alih-alih prompt baru penuh, agar gaya tidak bergeser. Impor DESIGN.md ini ke Stitch untuk mengikat aturan.
4. **Ekspor:** Copy to Figma (paste Ctrl/Cmd+V di Figma) untuk poles manual, atau Export Code (HTML/CSS Tailwind) untuk langsung dipakai developer/agent yang membangun PRD.
5. Setiap prompt di bawah sudah memuat "gaya wajib" — gunakan verbatim, jangan dipangkas.

---

## Lampiran — Stitch Prompts (copy-paste, verbatim)

> Prompt ditulis dalam bahasa Inggris karena Stitch memberi hasil paling akurat dengan prompt Inggris. Teks UI di dalamnya tetap Bahasa Indonesia sesuai produk.

**Prompt dasar (tempel di awal setiap prompt layar admin):**
```
Design a clean, modern admin dashboard page for "KiloTrack", a laundry service web app in Indonesian language. Style: teal primary color #0E7490, background #F8FAFC, white cards with 12px radius and subtle shadow, Plus Jakarta Sans font, Material Symbols icons, left sidebar 240px with icons (dashboard, receipt_long, people, local_laundry_service, settings), generous 24px page padding, WCAG AA contrast. Professional and fresh, like a fintech dashboard, no gradients, no dark mode, no emojis.
```

**S1 Login:**
```
[Prompt dasar] This screen: a login page with a split layout — left panel solid teal #0E7490 with the KiloTrack logo and tagline "Cucian Anda, Terlacak Sampai Selesai", right side a white card with email and password fields and a teal primary button labeled "Masuk".
```

**S2 Dashboard:**
```
[Prompt dasar] This screen: the main dashboard. Top row: 4 summary stat cards — "Omzet Hari Ini" with large number "Rp1.240.000", "Order Baru" 12, "Dalam Proses" 8, "Siap Diambil" 5 (this card has an amber #F59E0B border). Below: a bar chart of weekly revenue, then a table "Order Terbaru" with columns: Kode Order, Customer, Total, Status (colored pill badges: blue "Dicuci", amber "Siap Diambil", green "Selesai"), Waktu, and an action button "Lanjut Tahap". Period filter pills in the top right.
```

**S3 Layanan & Harga:**
```
[Prompt dasar] This screen: service and pricing management titled "Layanan & Harga". Header has a primary button "+ Kategori". A table listing service categories: Nama (e.g. "Cuci Basah + Kering"), Satuan (pill "kg"), Rentang Harga ("7kg — Rp20.000"), and an active toggle. One expanded row shows tiered prices (7kg Rp20.000, 10kg Rp27.000) with an "+ Harga" button and edit/delete icon buttons. A modal for adding a new price tier: fields Min Qty, Harga, with Save and Cancel buttons.
```

**S4 Order Baru:**
```
[Prompt dasar] This screen: a "Buat Order Baru" form with 3 sections. Section 1 "Customer": autocomplete input with search icon and a small "+ Customer Baru" button opening inline fields (Nama wajib, No. WhatsApp opsional with +62 prefix). Section 2 "Rincian Cucian": repeating item rows — dropdown "Kategori Layanan", number input "Qty", and auto-calculated price per row ("7kg × Rp20.000"), with a "+ Tambah Item" ghost button. Section 3: a sticky summary bar at the bottom showing a large total "Total: Rp140.000" and a large teal primary button "Simpan & Kirim Nota". Also show the success state: a card with order code "LN-261119-0042", a QR code, and three buttons: green "Kirim via WhatsApp", outlined "Print Nota", text "Selesai".
```

**S5 Daftar Order:**
```
[Prompt dasar] This screen: an order list titled "Order". Horizontal filter tabs: Semua, Diterima, Dicuci, Selesai, Siap Diambil, plus a search input. Table columns: Kode Order, Customer, Total, Status (colored badges), Waktu, and a small teal button "Lanjut Tahap" with an arrow icon. Below, an expanded order detail card showing the full nota, a QR code, and a vertical status timeline with timestamps.
```

**S6 Kelola Customer:**
```
[Prompt dasar] This screen: customer management titled "Customer" with a large search bar. Table: Nama, No. WhatsApp, Jumlah Order, Total Belanja, and "Lihat Riwayat" action. Below, an expanded customer detail card with a customer info block (name, +62812-3456-7890) and a compact list of their past orders with status badges.
```

**S7 Cek Status (mobile):**
```
Design a mobile-first (375px) public page for "KiloTrack", an Indonesian laundry tracking web app — no login. Style: teal #0E7490 accents, background #F8FAFC, white cards 12px radius, Plus Jakarta Sans, Material Symbols, light mode only, friendly and clean. This screen: a minimal landing with the KiloTrack logo, a big friendly headline "Cek Status Cucian Kamu", one large input for order code with placeholder "LN-261119-0042", a full-width teal primary button "Cek Status", and a large local_laundry_service icon illustration. Also show a second variant: verification screen asking for the last 4 digits of the WhatsApp number with 4 large single-digit input boxes.
```

**S8 Hasil Tracking (mobile):**
```
Design a mobile-first (375px) public tracking result page for "KiloTrack", Indonesian laundry app — no login, read-only. Style: teal #0E7490, background #F8FAFC, white cards 12px radius, Plus Jakarta Sans, Material Symbols, light mode, subtle animations only. This screen: header with small logo. A main white card: greeting "Halo, Kak Budi", order code "LN-261119-0042" and received date, then a vertical 6-step progress tracker (Diterima, Dicuci, Dikeringkan, Disetrika, Siap Diambil, Selesai) — completed steps are solid teal circles with white check icons and timestamps, the current step "Disetrika" is a solid amber pulsing circle, future steps are outlined grey. Below: an amber-bordered card "Estimasi Selesai: Kamis, 19 Nov, 17.00" with a clock icon, and a compact order summary. A small "Refresh" text button at the bottom. Include a variant where status is "Siap Diambil" showing an amber celebration banner "Cucian siap diambil! 🎉".
```
