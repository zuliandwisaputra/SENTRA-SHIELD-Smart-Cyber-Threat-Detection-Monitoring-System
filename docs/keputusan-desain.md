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
