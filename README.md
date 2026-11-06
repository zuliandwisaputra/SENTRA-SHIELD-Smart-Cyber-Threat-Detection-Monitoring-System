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
| 1a | Lab Docker, agent Python, API agent (F1, F2) | ✅ Selesai |
| 1b | Mesin deteksi, Attack Story, skor (F3, F4, F5) | ✅ Selesai |
| 1c | Dashboard live, respons berjenjang & blokir (F6, F7) | ✅ Selesai |
| 2 | Uji Kesiapan, Sensor Buta, Kampanye, audit log, LAPSIT, Penjaga Situs (F8–F13) | 🔄 Sedang dikerjakan: F8, F9, F10 selesai |
| 3 | Mode demo read-only, landing page (F15); Telegram (F14) bila sempat | ⏳ |

### Sudah jalan vs peta jalan

| Kemampuan | Status |
|---|---|
| Lab satu perintah: `docker compose up -d` → 3 agent terdaftar otomatis dan mengirim heartbeat | ✅ Sudah jalan (24 detik dari volume kosong, di luar waktu build) |
| Agent Python tanpa dependensi: log web, SSH, firewall (NFLOG), FIM, sensor Modbus pasif | ✅ Sudah jalan, diuji dengan nmap, hydra, sqlmap, dan tulis Modbus dari container penyerang |
| Antrean lokal 10.000 event saat Core putus, batch 1 detik, heartbeat 10 detik | ✅ Sudah jalan |
| API agent sesuai PRD bagian 9 (HTTPS, token Sanctum ter-hash, 401/422/429) | ✅ Sudah jalan |
| Kode pendaftaran sekali pakai, cabut token → agent langsung ditolak | ✅ Sudah jalan |
| Respons berjenjang: Operator/Analis usul blokir → Komandan setuju/tolak (dari HP) → agent memblokir di nftables | ✅ Sudah jalan di lab: penyerang terputus 2,7 detik setelah disetujui |
| Rollback oleh Komandan, blokir Kedaluwarsa otomatis, riwayat tindakan | ✅ Sudah jalan |
| Audit log berantai hash (login, aksi admin, eksekusi perintah) | ✅ Pencatatan jalan; halaman Verifikasi di Fase 2 |
| Halaman Satuan & Agent, Pengguna; Beranda: pohon satuan + Tingkat Siaga | ✅ Sudah jalan |
| Lima peran sesuai matriks hak akses PRD; Operator hanya melihat satuannya | ✅ Sudah jalan |
| Mesin deteksi R01–R11 (pola + ambang), daftar putih IP, aturan bisa diubah Admin | ✅ Sudah jalan |
| Korelasi Attack Story: nmap + hydra + sqlmap dari satu IP = 1 insiden dengan tahap kill chain dan ATT&CK | ✅ Sudah jalan di lab (insiden muncul ±6 detik setelah serangan dimulai) |
| Skor yang bisa dijelaskan + rincian per komponen; severity dan Tingkat Siaga satuan otomatis | ✅ Sudah jalan (contoh PRD = 240 Kritis diuji otomatis) |
| Daftar Insiden, Detail Insiden, Detail Event (setiap angka bisa diklik ke buktinya) | ✅ Sudah jalan |
| Beranda Komando live: metrik, feed event, grafik event per menit, pohon satuan | ✅ Sudah jalan: WebSocket Reverb (event → tampil ±2 detik), cadangan polling 3 detik |
| Sensor Buta: heartbeat hilang > 30 detik → agent BUTA + insiden Tinggi; sumber log rutin yang diam → peringatan; agent hidup kembali tercatat | ✅ Sudah jalan di lab (alarm 39 detik setelah agent dimatikan) |
| Kampanye lintas satuan: IP yang sama menyerang ≥ 2 satuan dalam 24 jam → skor ×1,3, blokir serentak sekali setuju | ✅ Sudah jalan di lab (penyerang terputus dari dua satuan 7,2 detik setelah disetujui dari HP) |
| Uji Kesiapan: 11 skenario aman ke host sendiri (R01–R07, R09–R12), matriks hasil, cakupan, rata-rata waktu deteksi, riwayat | ✅ Sudah jalan di lab: cakupan 11/11, rata-rata 4,2 detik, tanpa insiden palsu |
| Halaman audit log + Verifikasi Rantai, LAPSIT, Penjaga Situs, dan seterusnya | ⏳ Fase 2–3 |
| Mode Latihan (replay), impor IOC offline | 🗺️ Peta jalan (di luar lingkup lomba) |

## Menjalankan lab demo (disarankan)

**Pengguna Windows:** ikuti [panduan pemula Windows](docs/panduan-pemula-windows.md), lalu klik dua kali `lab\windows\mulai-lab.bat`. Tidak perlu mengetik perintah.

Linux/macOS — kebutuhan: Docker dengan Compose v2 (Docker Desktop atau Docker Engine), RAM kosong ±3 GB, port `8443` bebas.

```bash
git clone -b claude/pensive-galileo-eow7qv https://github.com/zuliandwisaputra17-stack/SENTRA-SHIELD-Smart-Cyber-Threat-Detection-Monitoring-System.git
```

```bash
cd SENTRA-SHIELD-Smart-Cyber-Threat-Detection-Monitoring-System
```

```bash
docker compose -f lab/docker-compose.yml up -d --build
```

```bash
bash lab/cek-lab.sh
```

Buka **https://localhost:8443**. Sertifikat dibuat CA lab sendiri, jadi lanjutkan saja peringatan browser. Skenario serangan, topologi, dan reset ada di [lab/README.md](lab/README.md).

**Sistem berjalan offline setelah image Docker dan model LLM ditarik sekali.** Build pertama membutuhkan internet untuk image dasar, apt, composer, dan npm.

### Akun lab bawaan

Kata sandi awal semua akun: `Latihan#2026` (ubah lewat `SENTRA_SEED_PASSWORD`). Hanya untuk lab: ganti kata sandi bila dipakai di luar lab.

| Email | Peran | Satuan |
|---|---|---|
| `admin@sentra.lab` | Admin | Kodam Latihan I |
| `komandan@sentra.lab` | Komandan | Kodam Latihan I |
| `analis@sentra.lab` | Analis | Kodam Latihan I |
| `operator.a@sentra.lab` | Operator | Kodim Latihan A |
| `operator.b@sentra.lab` | Operator | Kodim Latihan B |
| `demo@sentra.lab` | Demo (hanya lihat) | Kodam Latihan I |

Seeder hanya membuat data master (satuan, akun, aturan, pengaturan). Seeder **tidak** membuat event, insiden, atau angka apa pun.

## Struktur repo

```
core/    aplikasi Laravel (Core + Command), Dockerfile
agent/   sentra_agent.py, install.sh, config.example.json, unit systemd (Python, pustaka standar saja)
lab/     docker-compose.yml, target satuan, PLC simulasi, penyerang, spike nftables
docs/    keputusan desain, bukti demo
site/    landing page untuk link karya
```

## Stack

Laravel 13 (PHP 8.3), MySQL 8.4, Blade + Livewire + Tailwind CSS + Chart.js, Laravel Breeze (login), Laravel Sanctum (token agent), Laravel Reverb (realtime, dengan cadangan polling), agent Python 3.10+ tanpa dependensi eksternal, image lab berbasis Ubuntu 24.04.

Tidak ada font, CDN, atau layanan cloud yang dimuat saat runtime.

## Pengembangan dan test

### Test

Test Core memakai MySQL 8 (database `sentra_test`):

```bash
docker run -d --name sentra-mysql -e MYSQL_ROOT_PASSWORD=root -e MYSQL_DATABASE=sentra -e MYSQL_USER=sentra -e MYSQL_PASSWORD=sentra -p 127.0.0.1:3306:3306 mysql:8.4
```

Tunggu sekitar 20 detik sampai MySQL siap:

```bash
docker exec sentra-mysql mysql -uroot -proot -e "CREATE DATABASE IF NOT EXISTS sentra_test; GRANT ALL ON sentra_test.* TO 'sentra'@'%';"
```

```bash
cd core && composer install && npm ci && npm run build && cp .env.example .env && php artisan key:generate && php artisan migrate:fresh --seed && php artisan test
```

Test agent (pustaka standar saja), dari root repo:

```bash
python3 -m unittest discover -s agent/tests -v
```

### Menjalankan Core tanpa Docker

Setelah langkah test di atas: `php artisan serve`, lalu buka http://127.0.0.1:8000. Kebutuhan: PHP 8.3+ (ekstensi `pdo_mysql`, `mbstring`, `xml`, `curl`, `zip`, `intl`), Composer 2, Node.js 20+.

## Dokumentasi

- [Panduan pemula Windows](docs/panduan-pemula-windows.md): pasang WSL, Docker Desktop, dan Git, lalu jalankan lab dengan skrip klik-dua-kali di `lab\windows`.
- [Keputusan desain](docs/keputusan-desain.md): hal yang menyimpang dari atau memperjelas PRD, beserta alasannya.
- [Lab demo](lab/README.md): topologi, skenario serangan, reset.
- [Agent](agent/README.md): sumber telemetri, perintah daftar tetap, pemasangan di host nyata.
- [Spike nftables](lab/spike/nftables/README.md): bukti log firewall dan blokir dari dalam container.

## Pernyataan karya dasar

Proyek ini dibangun di atas perangkat lunak sumber terbuka yang sudah ada:
- Berlisensi MIT: kerangka aplikasi Laravel, Laravel Breeze (scaffolding login, tampilan Livewire/Volt), Livewire, Laravel Sanctum, Laravel Reverb, Tailwind CSS, Chart.js, Laravel Echo, dan pusher-js.
- Hanya dipakai di lab (lisensi masing-masing): pymodbus untuk PLC simulasi serta nmap, hydra, dan sqlmap untuk penyerang.

Logika SENTRA SHIELD (agent, deteksi, korelasi, skor, respons, Uji Kesiapan, dan seterusnya) ditulis untuk lomba ini.

## Lisensi

[MIT](LICENSE)
