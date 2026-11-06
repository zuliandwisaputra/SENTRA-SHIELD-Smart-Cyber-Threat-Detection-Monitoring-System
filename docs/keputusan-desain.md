# Keputusan desain

Catatan keputusan yang menyimpang dari atau memperjelas PRD. Semuanya sudah disetujui pemilik proyek pada 6 Nov 2026.

## Keputusan yang menyimpang dari PRD

| No | Keputusan | Alasan |
|---|---|---|
| A1 | Lab memakai jaringan `net-wan` (simulasi WAN/internet). Penyerang hanya di `net-wan` dengan satu IP tetap. kodim-a, kodim-b, dan plc-sim juga tersambung ke `net-wan` dan `net-pusat`. | Di Docker, container yang tersambung ke dua jaringan mendapat dua IP berbeda, sehingga kampanye lintas satuan (syarat: IP sama) tidak akan terpicu. plc-sim juga perlu jalur ke Core. |
| A2 | Deteksi FIM (tanpa IP) ditempelkan ke insiden terbuka di satuan yang sama yang paling baru aktif (≤30 menit), dengan label **"Atribusi berdasarkan waktu"** di UI. Bila tidak ada, dibuat insiden baru tanpa IP. | Event FIM tidak punya `src_ip`, padahal korelasi memakai `unit_id` + `src_ip`. |
| A3 | Kolom `agents.asset_type` (ot/web/lainnya). `m_aset` insiden = nilai tertinggi dari agent yang terlibat. | Rumus skor butuh jenis aset; skema bagian 8 tidak memuatnya. |
| A4 | Tambahan skema: `agents.enrollment_code_hash`, `agents.enrollment_expires_at`, status agent `menunggu`, `agents.sources` (JSON), tabel `settings`, `monitored_sites.update_windows`. Kolom `agents.token_hash` tidak dipakai karena token disimpan ter-hash oleh Sanctum. | Dibutuhkan fitur PRD (kode pendaftaran, Sensor Buta, Pengaturan, R10). |
| A5 | Konfigurasi agent memakai JSON. Agent hanya memakai pustaka standar Python (zero dependency). | Pustaka standar tidak punya parser YAML. |
| A6 | Pencatat audit berantai dibuat di Fase 1; halaman audit dan tombol Verifikasi tetap di Fase 2. | G3 meminta persetujuan tercatat di audit log sejak Tingkat 1. |
| A7 | Lab cukup `docker compose up -d`; setup Core berjalan otomatis di entrypoint. Sistem berjalan **offline setelah image dan model ditarik sekali**. | PRD menargetkan instalasi satu perintah. |
| B9 | Status **Kedaluwarsa** hanya untuk blokir yang durasinya habis. Rollback oleh Komandan langsung dieksekusi (tetap tercatat di audit); two-person rule berlaku untuk `block_ip`. | Status di PRD ambigu. |
| B10 | Kaki halaman PDF LAPSIT memuat SHA-256 isi LAPSIT. SHA-256 file PDF final disimpan di `reports.sha256` dan audit log. | Hash file tidak bisa dicetak di dalam file itu sendiri. |
| B11 | Lisensi MIT. Nama satuan generik (Kodam Latihan I, Korem Latihan 01, Kodim Latihan A/B). | Menghindari nama satuan nyata. |

## Kolom pelengkap di skema

Kolom berikut melengkapi "kolom utama" bagian 8 agar fitur PRD bisa berjalan:

- `detection_rules.attack_name`, `detection_rules.stage`: kolom "MITRE ATT&CK" dan "Tahap" dari katalog bagian 10.
- `incidents.agent_id`, `detections.agent_id`: insiden Sensor Buta (R12) dibentuk per agent dan tidak punya IP.
- `detections.attribution`: label cara deteksi dikaitkan ke insiden (keputusan A2).
- `actions.group_uuid`: satu usulan blokir untuk beberapa agent cukup satu persetujuan. `actions.decision_note`: alasan setuju/tolak (bagian 11).
- `readiness_runs.agent_id`, `status`, `started_at`, `finished_at`, serta `readiness_results.started_at`: mengukur waktu deteksi per skenario.
- `site_checks.check_uuid`, `checked_at`: mengelompokkan tiga varian satu pemeriksaan.
- `reports.created_by`.
- Peran pengguna `demo` (read-only) untuk F15.

## Asumsi yang disetujui

- Laravel 13 (membutuhkan PHP ≥ 8.3, tetap memenuhi syarat "PHP 8.2+").
- Waktu disimpan dalam UTC dan ditampilkan dalam WIB.
- Operator melihat satuannya beserta satuan di bawahnya.
- Tingkat Siaga satuan = severity tertinggi dari insiden terbukanya; satuan induk mengikuti tingkat tertinggi dari dirinya dan anak-anaknya.
- Aturan ambang menghasilkan satu deteksi per (aturan, satuan, IP) per jendela waktu. Aturan pola menghasilkan satu deteksi per event yang cocok. Skor dihitung per aturan unik.
- Blokir dari insiden membuat satu baris `actions` per agent di satuan itu. Blokir kampanye: satu usulan dan satu persetujuan untuk N baris.
- Agent memasang blokir di nftables set dengan `timeout`, sehingga blokir terbuka sendiri walau Core mati.
- Uji Kesiapan memakai penanda tetap (header `X-Sentra-Readiness`, user SSH `sentra-uji`, file `.sentra_uji_*`). Event uji bertanda `is_test` dan hasilnya hanya masuk `readiness_results`. Ada 11 skenario (R01–R07, R09–R12); R08 tidak dipakai karena butuh akun SSH yang benar-benar bisa login.
- Sensor Modbus pasif: mengendus TCP/502 dengan raw socket dan mem-parse PDU.
- LAPSIT memakai model `qwen2.5:3b`, diproses async; sitasi `[EV-…]` yang tidak ada di bukti dibuang.
- Siaran realtime dikirim per batch, bukan per event.
- Agent memverifikasi sertifikat HTTPS dengan CA lab; verifikasi tidak pernah dimatikan.

## Keputusan teknis Fase 1a

Keputusan berikut tidak menyimpang dari PRD; isinya pilihan implementasi yang perlu diketahui juri teknis.

- **Log firewall lewat NFLOG, bukan `log prefix`.** Kernel membuang log nftables dari network namespace container (`nf_log_all_netns=0`). Agent memasang aturan `log group 7` untuk koneksi ke port tertutup, lalu membacanya langsung lewat socket netlink (pustaka standar). Laju log dibatasi 400 paket/detik. Bukti ada di `lab/spike/nftables/`.
- **Blokir memakai nftables set dengan `timeout`.** Blokir terbuka sendiri walau Core mati. Aturan blokir diletakkan sebelum `ct state established accept`, sehingga koneksi yang sudah terbuka ikut putus. Set dipertahankan saat agent restart.
- **Kode pendaftaran agent lab dibuat acak saat setup**, lalu dibagikan lewat volume `lab-pki`. Tidak ada kode atau token tetap di repo. Kunci privat CA dan server tetap di volume state Core; hanya `ca.crt` yang dibagikan.
- **Sensor Modbus pasif** (AF_PACKET) hanya mencatat perintah tulis FC 5, 6, 15, 16. ACK TCP kosong diabaikan agar perintah tulis berikutnya tidak dianggap retransmisi (regresi yang ditemukan saat uji lab 6 Nov).
- **Event disimpan satu per satu dalam satu transaksi** agar ID setiap event diketahui pasti dan bisa diteruskan ke mesin deteksi (Fase 1b).
- **Image lab memakai Ubuntu 24.04** (PHP 8.3 dan Python 3.12 bawaan, nginx 1.24) untuk semua container, sehingga hanya satu image dasar yang perlu ditarik.

## Keputusan teknis Fase 1b

- **Deteksi berjalan di job antrean** (`ProcessEvents`) yang dipicu setiap batch event dari agent. Worker antrean di lab hanya satu proses, sehingga batch diproses berurutan dan korelasi tidak saling balapan.
- **Jendela waktu aturan ambang memakai waktu kejadian event** (`occurred_at`), bukan waktu tiba di Core. Event yang tertahan di antrean agent lalu dikirim ulang tetap dihitung di jendela yang benar.
- **Aturan pola menghasilkan satu deteksi per event yang cocok** (event = bukti), tetapi skor menghitung tiap aturan sekali. Aturan ambang menghasilkan satu deteksi per (aturan, satuan, IP) per jendela.
- **Pola web dicocokkan setelah URL-decode dua kali**, agar `%27`, `%2527`, dan `+` tetap tertangkap.
- **sqlmap ikut memicu R05 (XSS) dan R06 (LFI).** Request "heuristik WAF/IPS" bawaan sqlmap memuat `<script>` dan `../../../etc/passwd`. Ini deteksi yang sah, bukan false positive, dan buktinya bisa dibuka di Detail Event.
- **Skor dibulatkan ke bilangan bulat terdekat** setelah dikali pengali, misalnya 142,5 menjadi 143. Rincian di layar menampilkan rumus lengkapnya.
- **Daftar putih IP disimpan di Pengaturan** (`ip_whitelist`) dan bisa diubah Admin di halaman Aturan Deteksi. Mendukung IP tunggal dan CIDR.

## Cadangan R01 untuk kernel tanpa NFLOG (6 Nov)

Atas permintaan pemilik proyek, karena laptop demo memakai Windows 11 + Docker Desktop (WSL2).

- Agent memakai mode firewall `auto`: coba NFLOG dulu. Bila kernel menolak aturan `log group` atau socket NFLOG tidak tersedia, ruleset nftables dimuat ulang **tanpa** aturan log, sehingga blokir tetap jalan. Port tertutup lalu dicatat lewat raw socket (AF_PACKET, pustaka standar): paket TCP SYN tanpa ACK ke port yang tidak LISTEN, dengan batas laju yang sama (400/detik, burst 800).
- Raw socket melihat paket sebelum firewall. Karena itu agent mengabaikan IP yang sedang ia blokir, padanan aturan nftables yang memeriksa blokir sebelum log.
- `uji-kernel.bat` / `run_spike.sh` menguji kedua cara dan menyimpulkan "SIAP DEMO" beserta modenya. `cek-lab` menampilkan `firewall=ok(nflog)` atau `ok(raw socket)`.

## Perbaikan presisi waktu (ditemukan saat uji cadangan di lab, 6 Nov)

- Cast `datetime:Y-m-d H:i:s.v` dibaca Laravel sebagai `custom_datetime`, sehingga milidetik terpotong saat disimpan lewat Eloquent. Semua model kini memakai cast `datetime` dengan `$dateFormat` berpresisi milidetik.
- Query builder memformat batas tanggal tanpa milidetik, sehingga event dalam detik yang sama bisa keluar dari jendela waktu aturan ambang (nmap memindai ratusan port dalam < 1 detik). Semua batas jendela deteksi dan korelasi kini diikat sebagai teks bermilidetik (`App\Support\DbTime`). Test regresi: 20 port dalam 0,1 detik tetap memicu R01, 10 login gagal dalam 0,1 detik tetap memicu R07.
