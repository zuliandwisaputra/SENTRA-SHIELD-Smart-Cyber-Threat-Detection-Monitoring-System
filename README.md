# SENTRA SHIELD — Smart Cyber Threat Detection & Monitoring System

Pusat komando deteksi dan respons ancaman siber berbasis web untuk satuan TNI AD. Sensor ringan dipasang di tiap satuan. Pusat berbasis Laravel merangkum ratusan event menjadi satu insiden. Respons mengikuti rantai komando.

Karya untuk **Kartika Cyber Hackathon 2026**, kategori 02 Penangkalan (Defensive Shield).

> **Nyata** — setiap deteksi berasal dari telemetri asli; tidak ada data atau angka karangan di dashboard.
> **Terukur** — sistem menguji dirinya sendiri (Uji Kesiapan) dan menampilkan cakupan deteksi dalam angka.
> **Siap pakai** — berjalan penuh tanpa internet, cukup di mini-PC.

## Status pengerjaan

| Fase | Isi | Status |
|---|---|---|
| 0 | Fondasi repo, skema database, peran & hak akses, data master | ✅ Selesai |
| 1a | Lab Docker, agent Python, API agent (F1, F2) | ⏳ Berikutnya |
| 1b | Mesin deteksi, Attack Story, skor (F3, F4, F5) | ⏳ |
| 1c | Dashboard live, respons berjenjang & blokir (F6, F7) | ⏳ |
| 2 | Uji Kesiapan, Sensor Buta, Kampanye, audit log, LAPSIT, Penjaga Situs (F8–F13) | ⏳ |
| 3 | Mode demo read-only, landing page (F15); Telegram (F14) bila sempat | ⏳ |

### Sudah jalan vs peta jalan

| Kemampuan | Status |
|---|---|
| Login (rate limit 5 percobaan), tanpa registrasi publik | ✅ Sudah jalan |
| Lima peran (Operator, Analis, Komandan, Admin, Demo) sesuai matriks hak akses PRD | ✅ Sudah jalan |
| Operator hanya melihat satuannya; two-person rule pada keputusan tindakan | ✅ Sudah jalan (policy + test) |
| Skema 15 tabel inti; event dan audit log tidak bisa diubah lewat aplikasi | ✅ Sudah jalan |
| Katalog aturan R01–R13 sesuai PRD bagian 10 | ✅ Tersimpan (mesin deteksi di Fase 1b) |
| Beranda Komando: pohon satuan + Tingkat Siaga | ✅ Pohon satuan (metrik & feed live di Fase 1c) |
| Agent, lab, deteksi, korelasi, blokir, dan seterusnya | ⏳ Fase 1–3 |
| Mode Latihan (replay), impor IOC offline | 🗺️ Peta jalan (di luar lingkup lomba) |

## Struktur repo

```
core/    aplikasi Laravel (Core + Command)
agent/   sentra_agent.py, install.sh, config.example.json (Python, pustaka standar saja)
lab/     docker-compose.yml, target satuan, PLC simulasi, penyerang
docs/    arsitektur, keputusan desain, bukti demo
site/    landing page untuk link karya
```

## Stack

Laravel 13 (PHP 8.3), MySQL 8, Blade + Livewire + Tailwind CSS + Chart.js, Laravel Breeze (login), Laravel Sanctum (token agent), Laravel Reverb (realtime, dengan cadangan polling), agent Python 3.10+ tanpa dependensi eksternal.

Tidak ada font, CDN, atau layanan cloud yang dimuat saat runtime. **Sistem berjalan offline setelah image Docker dan model LLM ditarik sekali.**

## Menjalankan Core untuk pengembangan (Fase 0)

Lab lengkap dengan satu perintah (`docker compose up -d`) tersedia mulai Fase 1a. Sampai saat itu, Core dijalankan langsung di laptop.

Kebutuhan: PHP 8.3+ (ekstensi `pdo_mysql`, `mbstring`, `xml`, `curl`, `zip`, `intl`), Composer 2, Node.js 20+, Docker (untuk MySQL).

```bash
docker run -d --name sentra-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=sentra -e MYSQL_USER=sentra -e MYSQL_PASSWORD=sentra -p 127.0.0.1:3306:3306 mysql:8.4
```

Tunggu sekitar 20 detik sampai MySQL siap, lalu buat database test:

```bash
docker exec sentra-mysql mysql -uroot -proot -e "CREATE DATABASE IF NOT EXISTS sentra_test; GRANT ALL ON sentra_test.* TO 'sentra'@'%';"
```

```bash
cd core
composer install
npm ci && npm run build
cp .env.example .env
php artisan key:generate
php artisan migrate:fresh --seed
php artisan test
php artisan serve
```

Buka http://127.0.0.1:8000.

### Akun lab bawaan

Kata sandi awal semua akun: `Latihan#2026` (ubah lewat `SENTRA_SEED_PASSWORD` di `.env`). Hanya untuk lab: ganti kata sandi bila dipakai di luar lab.

| Email | Peran | Satuan |
|---|---|---|
| `admin@sentra.lab` | Admin | Kodam Latihan I |
| `komandan@sentra.lab` | Komandan | Kodam Latihan I |
| `analis@sentra.lab` | Analis | Kodam Latihan I |
| `operator.a@sentra.lab` | Operator | Kodim Latihan A |
| `operator.b@sentra.lab` | Operator | Kodim Latihan B |
| `demo@sentra.lab` | Demo (hanya lihat) | Kodam Latihan I |

Seeder hanya membuat data master (satuan, akun, aturan, pengaturan). Seeder **tidak** membuat event, insiden, atau angka apa pun.

## Dokumentasi

- [Keputusan desain](docs/keputusan-desain.md): hal yang menyimpang dari atau memperjelas PRD, beserta alasannya.

## Pernyataan karya dasar

Proyek ini dibangun di atas perangkat lunak sumber terbuka yang sudah ada: kerangka aplikasi Laravel, Laravel Breeze (scaffolding login, tampilan Livewire/Volt), Livewire, Laravel Sanctum, Laravel Reverb, Tailwind CSS, Chart.js, Laravel Echo, dan pusher-js. Semuanya berlisensi MIT. Logika SENTRA SHIELD (agent, deteksi, korelasi, skor, respons, Uji Kesiapan, dan seterusnya) ditulis untuk lomba ini.

## Lisensi

[MIT](LICENSE)
