# PRD — Aplikasi Laundry Kiloan "KiloTrack"

**Versi:** 1.0 (MVP) · **Tanggal:** 19 November 2026 · **Status:** Draft siap eksekusi
**Ditujukan untuk:** AI coding agent / developer

---

## 0. Konteks & Tujuan Produk

### 0.1 Ringkasan
Aplikasi web untuk usaha laundry kiloan dengan dua peran:

- **Admin** (login): mengelola harga layanan, input order cucian, kelola data customer, kirim nota + QR ke WhatsApp, update status pencucian, lihat dashboard.
- **Customer** (tanpa login): melacak status cucian via scan QR atau memasukkan kode order.

### 0.2 Tujuan MVP
1. Admin bisa menerima order dalam < 60 detik (dari input customer sampai nota terkirim).
2. Customer bisa cek status cucian tanpa login, hanya via link/QR/kode.
3. Semua transaksi tercatat dan muncul di dashboard omzet.

### 0.3 Non-Tujuan (Out of Scope MVP)
- Tidak ada login/register untuk customer.
- Tidak ada pembayaran online (QRIS/gateway pembayaran).
- Tidak ada multi-cabang / multi-outlet.
- Tidak ada aplikasi mobile native (responsive web saja).
- Tidak ada sistem membership/deposit.

### 0.4 Asumsi Teknis (WAJIB diikuti agent)
- **Stack:** Laravel 11 (monolith) + Blade/Tailwind ATAU NestJS + React — pilih satu, konsisten.
- **Database:** MySQL/PostgreSQL.
- **QR:** generate server-side (library `simple-qrcode` untuk Laravel, atau `qrcode` npm untuk Node).
- **WhatsApp:** abstraction layer `WhatsappSender` (interface) dengan 2 driver: `wa.me` link (manual, default) dan `FonnteDriver` (otomatis, via env `WHATSAPP_DRIVER`). Konfigurasi via file `.env`, BUKAN hardcode.
- **Bahasa UI:** Bahasa Indonesia.
- **Mata uang:** Rupiah, format `Rp20.000` (titik sebagai pemisah ribuan).
- **Zona waktu:** Asia/Jakarta (WIB).

### 0.5 Konvensi Penulisan untuk Agent
- Setiap fitur di bawah ini dikerjakan **berurutan per-fitur** (F1 → F8), karena ada dependensi data.
- Setiap fitur punya **Acceptance Criteria berformat Gherkin** — gunakan sebagai dasar penulisan test.
- Kolom database yang ditandai `NOT NULL` wajib divalidasi di level form request **dan** migration.
- Semua endpoint admin dilindungi middleware auth; endpoint publik hanya yang ada di F7.

---

## F1 — Manajemen Kategori Layanan & Daftar Harga

### 1.1 Deskripsi
Admin mendefinisikan kategori layanan (cuci basah, cuci kering, setrika, dll.) dan daftar harga bertingkat per satuan (kg atau pcs). Contoh: kategori "Cuci Basah + Kering", harga 7kg = Rp20.000.

### 1.2 User Story
> Sebagai admin, saya ingin mengatur daftar harga per kategori layanan dan per berat/jumlah, agar kasir cukup memilih layanan dan harga terhitung otomatis.

### 1.3 Requirement Fungsional
- **RF-1.1** Admin dapat membuat kategori layanan: nama (wajib, unik, max 100 char), deskripsi (opsional), satuan (`kg` atau `pcs`), aktif/nonaktif.
- **RF-1.2** Admin dapat membuat item harga dalam sebuah kategori: `min_qty` (desimal, wajib), `price` (integer rupiah, wajib, > 0).
- **RF-1.3** Sistem harga bertingkat: pilih harga dengan `min_qty` terbesar yang masih <= qty order. Contoh kategori X punya (7kg→20.000, 10kg→27.000): order 8kg memakai harga 7kg; order 12kg memakai harga 10kg.
- **RF-1.4** Validasi: dalam satu kategori, kombinasi `min_qty` tidak boleh duplikat.
- **RF-1.5** Admin dapat mengedit dan menonaktifkan (soft-delete) kategori/item harga. Item harga yang sudah dipakai order lama **tidak boleh** terhapus fisik (hard-delete) — historis order harus tetap benar.
- **RF-1.6** Daftar harga tampil dalam tabel dengan pencarian nama dan filter status aktif.

### 1.4 Model Data
```
service_categories: id, name (unique), description nullable, unit enum(kg,pcs), is_active bool, timestamps
price_items:        id, service_category_id FK, min_qty decimal(8,2), price int (rupiah), is_active bool, timestamps
                        UNIQUE(service_category_id, min_qty)
```

### 1.5 Acceptance Criteria (Gherkin)
```gherkin
Scenario: Buat kategori baru
  Given admin login di halaman "Layanan"
  When admin isi nama "Cuci Basah + Kering", satuan "kg", lalu simpan
  Then kategori muncul di daftar dengan status aktif

Scenario: Harga bertingkat otomatis
  Given kategori "Cuci Basah" punya harga (7kg, 20000) dan (10kg, 27000)
  When order dibuat dengan qty 9 kg pada kategori tersebut
  Then harga satuan yang dipakai adalah 20000
```

---

## F2 — Manajemen Customer

### 2.1 Deskripsi
Admin menginput data customer saat menerima order. Tidak ada registrasi mandiri.

### 2.2 User Story
> Sebagai admin, saya ingin menyimpan nama (wajib) dan nomor WhatsApp (opsional) customer, agar nota bisa dikirim otomatis dan riwayat customer mudah dicari saat order berikutnya.

### 2.3 Requirement Fungsional
- **RF-2.1** Form customer: `name` wajib (max 100 char), `whatsapp` opsional.
- **RF-2.2** Validasi nomor WA: simpan dalam format E.164 Indonesia (`+628xxxxxxxxx`, 10–15 digit setelah +62). Konversi otomatis: input `0812...` → simpan `+62812...`; input `812...` → `+62812...`; buang spasi, tanda hubung, dan leading zero. Input tidak valid → pesan error jelas, bukan gagal diam.
- **RF-2.3** Nomor WA unik (opsional tapi jika diisi tidak boleh duplikat) — jika admin input nomor yang sudah ada, tampilkan customer existing untuk dipilih alih-alih duplikasi data.
- **RF-2.4** Pencarian customer by nama atau nomor WA dengan autocomplete saat input order.
- **RF-2.5** Halaman riwayat customer: daftar semua order milik customer tsb.
- **RF-2.6** Customer hanya bisa diedit oleh admin (nama, nomor WA). Tidak ada hapus permanen jika punya order — gunakan soft-delete.

### 2.4 Model Data
```
customers: id, name varchar(100) NOT NULL, whatsapp varchar(20) NULL UNIQUE (format +62...), is_active bool, timestamps
```

### 2.5 Acceptance Criteria (Gherkin)
```gherkin
Scenario: Normalisasi nomor WA
  When admin input "0812-3456 7890" di kolom WhatsApp
  Then sistem menyimpan "+6281234567890"

Scenario: Nomor duplikat terdeteksi
  Given customer "Budi" dengan WA "+6281234567890" sudah ada
  When admin input nomor yang sama pada order baru
  Then sistem menampilkan opsi untuk memilih customer "Budi" yang sudah ada
```

---

## F3 — Penerimaan Order & Nota

### 3.1 Deskripsi
Inti aplikasi: admin membuat order cucian, sistem menghitung harga otomatis dari daftar harga (F1), menghasilkan kode order unik dan nota.

### 3.2 User Story
> Sebagai admin, saya ingin memilih customer, memasukkan rincian cucian per layanan, dan mendapatkan nota dengan total harga otomatis — dalam sekali proses input.

### 3.3 Requirement Fungsional
- **RF-3.1** Kode order unik format `LN-YYMMDD-XXXX` (`XXXX` = nomor urut harian, reset tiap hari). Contoh: `LN-261119-0042`.
- **RF-3.2** Order minimal berisi 1 item: pilih kategori layanan aktif (F1) + qty. Bisa lebih dari satu item (campur cuci basah + setrika).
- **RF-3.3** Sistem menampilkan **estimasi berat** opsional (kg) untuk referensi timbangan, tapi yang dihitung adalah qty final yang diinput.
- **RF-3.4** Perhitungan harga: `harga_item = price dari price_item yang cocok (aturan RF-1.3)`. Total = Σ semua item. Untuk satuan `kg`, qty desimal maksimal 2 angka (mis. 3.5 kg).
- **RF-3.5** Status awal order otomatis: `diterima` (lihat F6).
- **RF-3.6** Setelah order dibuat, sistem menghasilkan: (a) nota HTML siap print berisi kode order, tanggal, nama customer, rincian item, total; (b) token tracking acak (lihat F4); (c) tombol kirim WA (lihat F5) dan tombol print.
- **RF-3.7** Order hanya bisa diubah (edit item/harga) selama status masih `diterima`. Setelah masuk proses, hanya status yang bisa berubah (F6).
- **RF-3.8** Batalkan order: status `dibatalkan`, wajib isi alasan, order hilang dari laporan omzet.

### 3.4 Model Data
```
orders:       id, order_code varchar(15) UNIQUE NOT NULL, customer_id FK NOT NULL,
              total_price int NOT NULL, status enum NOT NULL default 'diterima',
              tracking_token char(32) NOT NULL UNIQUE, notes nullable, cancel_reason nullable,
              created_by FK users, timestamps
order_items:  id, order_id FK, service_category_id FK, price_item_id FK,
              qty decimal(8,2) NOT NULL, unit_price int NOT NULL, subtotal int NOT NULL
```
> Catatan: `unit_price` dan `subtotal` di-snapshot ke `order_items` agar perubahan daftar harga di masa depan tidak mengubah order historis.

### 3.5 Acceptance Criteria (Gherkin)
```gherkin
Scenario: Order multi-item
  Given kategori "Cuci Basah" (7kg, 20000) dan "Setrika" (kg, 5000)
  When admin buat order: Cuci Basah 7kg + Setrika 7kg untuk customer "Budi"
  Then total harga = 175000 dan kode order unik dengan format LN-YYMMDD-XXXX
```

---

## F4 — Generator QR Code

### 4.1 Deskripsi
Setiap order menghasilkan QR code yang mengarah ke halaman tracking publik (F7). QR dikirim via WhatsApp dan bisa dicetak sebagai label.

### 4.2 User Story
> Sebagai customer, saya ingin men-scan QR dari nota WhatsApp saya dan langsung melihat status cucian tanpa login.

### 4.3 Requirement Fungsional
- **RF-4.1** Saat order dibuat (F3), generate `tracking_token` acak 32 karakter (cryptographically secure, mis. `bin2hex(random_bytes(16))`).
- **RF-4.2** QR code men-encode URL: `{BASE_URL}/t/{order_code}?tk={tracking_token}`. `BASE_URL` dari env, bukan hardcode.
- **RF-4.3** QR dibuat server-side sebagai PNG, di-cache di storage (regenerate hanya jika file hilang), ukuran min 300x300 px agar mudah discan dari layar HP.
- **RF-4.4** QR tampil di: nota print (ukuran label), pesan WA (F5), dan detail order di dashboard admin.
- **RF-4.5** Halaman tracking **wajib** memvalidasi kecocokan `order_code` + `tk`. Akses dengan token salah → halaman 404 tanpa membocorkan keberadaan order.

### 4.4 Acceptance Criteria (Gherkin)
```gherkin
Scenario: QR mengarah ke tracking valid
  When customer scan QR order LN-261119-0042
  Then browser membuka halaman tracking order tersebut dengan status terkini

Scenario: Token salah ditolak
  When user membuka /t/LN-261119-0042?tk=token_salah
  Then sistem menampilkan halaman 404
```

---

## F5 — Integrasi WhatsApp (Nota + QR)

### 5.1 Deskripsi
Setelah order dibuat, admin bisa mengirim nota + QR ke WhatsApp customer, atau membuka chat manual via `wa.me`.

### 5.2 User Story
> Sebagai admin, saya ingin sekali klik mengirim nota dan QR ke nomor WA customer, agar customer punya bukti order dan cara melacak cucian.

### 5.3 Requirement Fungsional
- **RF-5.1** Driver abstrak `WhatsappSender::send(string $toE164, string $message, ?string $imagePath)`.
- **RF-5.2** **Driver manual (default):** tidak mengirim otomatis; UI menampilkan tombol yang membuka `https://wa.me/{62xxxx}?text={urlencoded message}` di tab baru. Gunakan jika `WHATSAPP_DRIVER=manual` atau customer tidak punya nomor WA.
- **RF-5.3** **Driver Fonnte (opsional):** jika `WHATSAPP_DRIVER=fonnte` dan `FONNTE_TOKEN` terisi, kirim pesan + gambar QR otomatis via API Fonnte. Semua credential dari env. Jika request gagal, tampilkan error di UI dan simpan log — jangan gagalkan pembuatan order.
- **RF-5.4** Isi pesan nota (template, bisa diedit admin dari pengaturan): sapaan + nama customer, kode order, rincian item & qty, total harga, estimasi selesai, teks "Scan QR di bawah / buka link untuk cek status", link tracking singkat, QR image.
- **RF-5.5** Nomor tujuan selalu dinormalisasi ke E.164 (F2) sebelum dikirim.
- **RF-5.6** Log pengiriman: tabel `whatsapp_logs` (order_id, tujuan, driver, sukses/gagal, pesan error, waktu).
- **RF-5.7** Jika customer tanpa nomor WA, tombol kirim disembunyikan dan diganti hint "Customer tanpa nomor WA — print nota saja".

### 5.4 Model Data
```
whatsapp_logs: id, order_id FK, to_number varchar(20), driver varchar(20),
               status enum(success,failed), error_message nullable, timestamps
```

### 5.5 Acceptance Criteria (Gherkin)
```gherkin
Scenario: Kirim otomatis via Fonnte
  Given WHATSAPP_DRIVER=fonnte dan FONNTE_TOKEN valid
  When admin klik "Kirim Nota via WA" pada order LN-261119-0042 milik customer bernomor WA
  Then customer menerima pesan berisi rincian nota + QR, dan whatsapp_logs terisi status success

Scenario: Fallback driver manual
  Given WHATSAPP_DRIVER=manual
  When admin klik "Kirim Nota via WA"
  Then tab baru terbuka ke wa.me dengan isi pesan nota terisi otomatis
```

---

## F6 — Workflow Status Pencucian

### 6.1 Deskripsi
Admin memperbarui status order mengikuti proses nyata; setiap perubahan status tercatat waktunya dan otomatis tercermin di halaman tracking customer (F7).

### 6.2 User Story
> Sebagai admin, saya ingin memindahkan status cucian dari satu tahap ke tahap berikutnya, agar customer selalu melihat progres yang akurat.

### 6.3 Requirement Fungsional
- **RF-6.1** Urutan status wajib (state machine, tidak boleh melompat maju lebih dari 1 tahap):
  `diterima → dicuci → dikeringkan → disetrika → siap_diambil → selesai`
  Pengecualian: `dibatalkan` hanya boleh dari `diterima` atau `dicuci`.
- **RF-6.4** Tombol aksi cepat "Lanjut ke tahap berikutnya" (1 klik) di daftar order dan detail order.
- **RF-6.5** Setiap perubahan status dicatat di `order_status_histories` (order_id, status_lama, status_baru, updated_by, waktu).
- **RF-6.6** Halaman tracking customer (F7) menampilkan riwayat waktu tiap tahap yang sudah tercapai + estimasi waktu tahap berikutnya (berdasarkan rata-rata durasi historis order dengan kategori layanan sama, fallback: konstanta dari pengaturan, mis. 2 hari).
- **RF-6.7** Opsional (flag env `WA_NOTIFY_STATUS=true`): kirim pesan WA otomatis saat status berubah ke `siap_diambil` (pesan "cucian kakak sudah selesai, silakan diambil 🎉" + jam operasional). Gunakan driver F5 yang sama.

### 6.4 Model Data
```
order_status_histories: id, order_id FK, status_lama nullable, status_baru, updated_by FK users, created_at
```

### 6.5 Acceptance Criteria (Gherkin)
```gherkin
Scenario: Tidak bisa melompati tahap
  Given order berstatus "diterima"
  When admin mencoba mengubah status langsung ke "disetrika"
  Then sistem menolak dengan pesan "Status hanya bisa maju satu tahap"

Scenario: Riwayat tercatat
  When admin mengubah status order dari "dicuci" ke "dikeringkan"
  Then entri baru dibuat di order_status_histories dan halaman tracking customer menampilkan dua tahap tercapai
```

---

## F7 — Halaman Tracking Publik (Customer)

### 7.1 Deskripsi
Halaman web publik tanpa login untuk customer melihat status cucian, diakses via: (a) scan QR, (b) link dari pesan WA, (c) input manual kode order di halaman utama.

### 7.2 User Story
> Sebagai customer, saya ingin mengecek status cucian saya hanya dengan scan QR atau memasukkan kode order, tanpa perlu membuat akun.

### 7.3 Requirement Fungsional
- **RF-7.1** Route publik: `GET /t/{order_code}?tk={tracking_token}` — validasi pasangan kode+token (F4), salah → 404.
- **RF-7.2** Halaman utama publik `GET /cek` berisi form input kode order (format `LN-YYMMDD-XXXX`). Submit tanpa token → tampilkan halaman status ringkas **hanya jika** pencocokan kode tepat, dan minta konfirmasi nomor WA 4 digit terakhir sebagai verifikasi ringan (anti-curi-data). Jika datang dari QR/link (token valid), tampilkan detail penuh tanpa verifikasi tambahan.
- **RF-7.3** Konten halaman tracking: nama customer (panggilan pertama saja, mis. "Budi"), kode order, tanggal terima, rincian item & qty (tanpa snapshot harga opsional — default: tampilkan), progress bar 6 tahap (F6), timestamp tiap taham tercapai, estimasi selesai, tombol "Refresh" dan auto-refresh tiap 30 detik.
- **RF-7.4** Mobile-first, ringan (tanpa JS framework berat), tetap fungsional dengan JS dimatikan (server-rendered + meta refresh).
- **RF-7.5** Tidak ada tombol/aksi apapun untuk customer — read-only penuh. Tanpa link ke dashboard admin.
- **RF-7.6** Halaman tracking order berstatus `dibatalkan` menampilkan pesan "Order dibatalkan" tanpa detail alasan.

### 7.4 Acceptance Criteria (Gherkin)
```gherkin
Scenario: Cek via kode manual
  Given order LN-261119-0042 milik customer ber-WA +6281234567890
  When customer buka /cek, input "LN-261119-0042" dan 4 digit terakhir WA "7890"
  Then halaman menampilkan status cucian terkini dengan progress bar
```

---

## F8 — Dashboard Admin & Laporan

### 8.1 Deskripsi
Ringkasan bisnis harian/bulanan untuk owner dan admin.

### 8.2 User Story
> Sebagai pemilik laundry, saya ingin melihat omzet hari ini, jumlah order aktif, dan tren mingguan dalam satu layar setelah login.

### 8.3 Requirement Fungsional
- **RF-8.1** Kartu ringkasan (default: hari ini): total omzet, jumlah order baru, order dalam proses, order siap diambil (belum diambil customer), order selesai.
- **RF-8.2** Grafik batang omzet 7 hari terakhir dan 30 hari terakhir (library chart apa pun yang ringan, mis. Chart.js).
- **RF-8.3** Tabel 10 order terbaru dengan kolom: kode, nama customer, total, status (badge berwarna), waktu dibuat, aksi cepat (lihat, update status).
- **RF-8.4** Filter periode (hari ini / minggu ini / bulan ini / custom range) untuk semua angka di dashboard.
- **RF-8.5** Export laporan periode terpilih ke CSV: kolom kode order, tanggal, customer, item, qty, total, status, waktu selesai.
- **RF-8.6** Omzet = Σ `total_price` order dengan status `selesai` ATAU status >= `siap_diambil` (dibayar), **tidak termasuk** `dibatalkan`.

### 8.4 Acceptance Criteria (Gherkin)
```gherkin
Scenario: Dashboard harian akurat
  Given hari ini ada 5 order (4 proses, 1 dibatalkan) total Rp310.000
  When admin membuka dashboard
  Then kartu omzet hari ini menunjukkan Rp310.000 dari 4 order (order dibatalkan tidak dihitung)
```

---

## Lampiran A — Alur End-to-End (Happy Path)

1. Admin login → buka menu "Order Baru".
2. Pilih/ketik customer (autosearch F2) → masukkan item: "Cuci Basah 7kg" → sistem hitung Rp20.000 (F1/F3).
3. Simpan → order `LN-261119-0042` dibuat, status `diterima`, token + QR digenerate (F4).
4. Admin klik "Kirim Nota via WA" → customer terima pesan nota + QR (F5).
5. Customer scan QR → lihat status real-time (F7).
6. Admin klik "Lanjut tahap" seiring proses nyata: dicuci → dikeringkan → disetrika (F6).
7. Status `siap_diambil` → (opsional) WA otomatis terkirim ke customer.
8. Customer ambil cucian, admin tandai `selesai` → order masuk omzet dashboard (F8).

## Lampiran B — Urutan Pengerjaan & Definisi Selesai per Fitur

| Fitur | Depedensi | Definition of Done |
|---|---|---|
| F1 Kategori & Harga | — | CRUD lengkap + aturan harga bertingkat lolos test |
| F2 Customer | — | Normalisasi WA + autosearch + deteksi duplikat |
| F3 Order & Nota | F1, F2 | Order multi-item, snapshot harga, nota print rapi |
| F4 QR | F3 | QR valid scannable, token divalidasi, 404 jika salah |
| F5 WhatsApp | F3, F4 | Driver manual berfungsi; driver Fonnte berfungsi bila env diisi; log terisi |
| F6 Status | F3 | State machine tanpa lompatan, riwayat tercatat |
| F7 Tracking Publik | F4, F6 | Akses via QR/link/kode; mobile-friendly; read-only |
| F8 Dashboard | F3, F6 | Angka omzet cocok dengan data manual; grafik & export jalan |

## Lampiran C — Environment Variables

```
APP_NAME=KiloTrack
APP_URL=https://contoh-laundry.id
WHATSAPP_DRIVER=manual          # manual | fonnte
FONNTE_TOKEN=                    # isi jika WHATSAPP_DRIVER=fonnte
WA_NOTIFY_STATUS=true            # kirim WA otomatis saat siap diambil
STATUS_DEFAULT_DURATION_HOURS=48 # fallback estimasi selesai
```
