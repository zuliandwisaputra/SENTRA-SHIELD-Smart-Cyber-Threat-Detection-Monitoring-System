# Naskah narasi video demo SENTRA SHIELD

Bagian pertama dokumen ini mencatat **narasi final** yang sudah direkam dan dipasang di video (8 November 2026). Bagian sesudahnya adalah naskah awal yang dipakai sebagai panduan merekam.

## Narasi final yang terpasang

Pembicara: Zulian Dwi Saputra (tim Claudex404). Sumber: 11 berkas suara dari HP (AAC/M4A), diolah dengan `video/rekam/pasang-narasi.cjs`:

- diubah ke WAV 48 kHz mono 24-bit;
- dengung dikurangi: high-pass 80 Hz (dengung listrik 50 Hz), notch sempit di 100 dan 150 Hz, pengurang derau FFT ringan;
- hening di awal dan akhir dipotong (ambang −45 dB, sisa 0,12 detik);
- volume disamakan dengan loudnorm dua tahap ke −16 LUFS, puncak −1,5 dBFS (hasil: −16,3 sampai −16,8 LUFS).

Kecepatan suara **tidak diubah** (0%). Durasi tiap adegan mengikuti panjang suara: jeda 0,4 detik, lalu narasi, lalu ekor singkat. Total video **3:45**. Adegan 5 diberi ekor 5 detik untuk menampilkan Penjaga Situs (tiga varian berdampingan) setelah narasinya selesai.

| Adegan | Waktu di video | Durasi adegan (dtk) | Durasi suara (dtk) |
| --- | --- | --- | --- |
| 01-intro | 0:00.0–0:17.5 | 17,5 | 15,7 |
| 02-masalah | 0:17.5–0:39.8 | 22,3 | 20,7 |
| 03-arsitektur | 0:39.8–1:15.8 | 36,0 | 34,3 |
| 04-deteksi | 1:15.8–1:38.3 | 22,5 | 20,8 |
| 05-serangan-lanjut | 1:38.3–2:08.0 | 29,7 | 24,3 |
| 06-respons | 2:08.0–2:28.5 | 20,6 | 18,7 |
| 07-lapsit | 2:28.5–2:46.2 | 17,7 | 15,9 |
| 08-ketahanan | 2:46.2–3:06.2 | 20,0 | 18,2 |
| 09-hak-akses | 3:06.2–3:17.1 | 10,9 | 8,9 |
| 10-angka | 3:17.1–3:31.1 | 13,9 | 11,7 |
| 11-penutup | 3:31.1–3:45.1 | 14,0 | 11,4 |

### Cara menyelaraskan gambar dengan suara

Suara ditranskripsi dengan Whisper (model *medium*, bahasa Indonesia) untuk mendapat waktu tiap kata (`video/src/data/narasi-kata.json`). Waktu kata itu dipakai untuk:

- **Teks layar.** Isinya ucapan narasi itu sendiri (sudah dikoreksi), muncul tepat saat diucapkan.
- **Visual.** Pergantian bagian, sorotan, dan zoom jatuh pada kata yang membicarakannya. Contoh: kotak Agent/Core/Command muncul saat disebut; perubahan Tingkat Siaga Aman → Siaga di Beranda jatuh tepat pada "tingkat siaga naik"; angka 946 muncul saat "skor 946"; kartu kelayakan muncul satu per satu sesuai ucapan.
- **Kecepatan footage.** Kecepatan diatur per potongan, dengan label "Dipercepat N×" di layar: SQL injection/webshell 3×, Modbus/judol 2×, usulan Analis 2×, navigasi HP Komandan 6×, Sensor Buta 5×, Uji Kesiapan 16×, pembuatan LAPSIT 1,5×.
- **Tetap 1×.** Nmap, hydra, dan rentang dari klik Setujui sampai TERPUTUS tidak dipercepat, sehingga penghitung 2,46 detik berjalan dengan waktu asli.
- **Gambar ditahan.** Di beberapa tempat dipakai frame asli dari rekaman atau tangkapan layar asli dengan label "dijeda"/"Tangkapan layar asli": Attack Story awal, kutipan [EV-n], rincian skor 946, dan dial Uji Kesiapan.

### Kecocokan ucapan dengan layar

Semua angka yang diucapkan cocok dengan rekaman: 13 aturan, skor 946, 2,46 detik, 29 detik, 11 dari 11. Klaim lain juga sesuai dengan yang tampil. Catatan kecil:

- Adegan 2: diucapkan "ribuan peringatan", layar menampilkan angka asli **1.020 event** (sedikit di atas seribu).
- Adegan 4: diucapkan "ratusan kejadian dirangkum jadi satu insiden", layar menampilkan **933 event → 1 insiden**. Ini sejalan.
- Adegan 11: hanya peta jalan yang diucapkan. Panel Batasan tetap tampil di samping, tanpa narasi.

### Koreksi transkripsi di teks layar

Whisper salah dengar di beberapa kata. Teks layar memakai koreksi berikut (mohon dicek):

| Adegan | Transkripsi mentah | Di teks layar |
| --- | --- | --- |
| 01 | "Julian Duisa Putra", "Respon Ancaman Cyber" | "Zulian Dwi Saputra", "Respons Ancaman Siber" |
| 02 | "tim keamanan saya berkusus" | "tim keamanan siber khusus" |
| 04 | "menebak ke atasan di Kodim-A", "detail incident" | "menebak kata sandi di Kodim A", "Detail Insiden" |
| 05 | "Penyerangnya sama", "penyusup judi online", "Insidenya" | "Penyerang yang sama", "penyusupan judi online", "Insidennya" |
| 06 | "Sekarang Respon", "menyutujui" | "Sekarang, respons.", "menyetujui" |
| 10 | "satu script" | "satu skrip" |
| 11 | "disatuan" | "di satuan" |

Berkas suara tidak di-commit (`video/public/narasi/*.wav` ada di `.gitignore`). Untuk memasang ulang dari berkas HP:

```bash
cd video
node rekam/pasang-narasi.cjs <folder berisi intro.m4a, masalah.m4a, ...>
```

## Naskah awal (panduan merekam)

## Cara merekam dan memasang narasi

1. Rekam satu berkas per adegan. Bacalah dengan tempo santai, sekitar 130–150 kata per menit. Naskah tiap adegan sudah dibuat sedikit lebih pendek dari durasinya.
2. Format yang disarankan: WAV, 48 kHz, mono. MP3 atau M4A juga bisa. Tanpa musik latar.
3. Beri nama berkas sesuai kolom **Berkas**, lalu taruh di `video/public/narasi/`. Contoh: `video/public/narasi/04-deteksi.wav`.
4. Narasi diputar mulai detik pertama adegannya. Jangan lebih panjang dari durasi adegan; sisakan sekitar setengah detik di akhir.
5. Periksa di Remotion Studio (`cd video`, lalu `npm run dev`), lalu render ulang. Adegan yang belum punya berkas narasi tetap berjalan tanpa suara.

Teks di layar (keterangan besar berbahasa Indonesia) sudah ada di video, jadi narasi tidak wajib dibaca kata per kata sama dengan teks layar.

## Ringkasan adegan

| No | Waktu | Durasi | Adegan | Berkas |
| --- | --- | --- | --- | --- |
| 1 | 0:00–0:20 | 20 dtk | Intro | `01-intro.wav` |
| 2 | 0:20–0:50 | 30 dtk | Masalah | `02-masalah.wav` |
| 3 | 0:50–1:30 | 40 dtk | Arsitektur | `03-arsitektur.wav` |
| 4 | 1:30–2:10 | 40 dtk | Demo deteksi | `04-deteksi.wav` |
| 5 | 2:10–2:50 | 40 dtk | Serangan lanjut | `05-serangan-lanjut.wav` |
| 6 | 2:50–3:20 | 30 dtk | Respons berjenjang | `06-respons.wav` |
| 7 | 3:20–3:40 | 20 dtk | LAPSIT | `07-lapsit.wav` |
| 8 | 3:40–4:10 | 30 dtk | Ketahanan | `08-ketahanan.wav` |
| 9 | 4:10–4:25 | 15 dtk | Hak akses | `09-hak-akses.wav` |
| 10 | 4:25–4:45 | 20 dtk | Angka hasil uji + kelayakan | `10-angka.wav` |
| 11 | 4:45–5:00 | 15 dtk | Penutup | `11-penutup.wav` |

## 1. Intro (0:00–0:20, 20 detik)

**Di layar:** tanda SENTRA SHIELD, "Pusat Komando Deteksi & Respons Ancaman Siber", lalu stempel NYATA, TERUKUR, SIAP PAKAI.

**Narasi** (±45 kata):

> Ini SENTRA SHIELD, pusat komando deteksi dan respons ancaman siber untuk satuan.
> Nyata: setiap deteksi berasal dari serangan sungguhan di lab.
> Terukur: sistem menguji dirinya sendiri.
> Siap pakai: satu klik, berjalan offline.
> Semua tampilan aplikasi di video ini adalah rekaman asli.

## 2. Masalah (0:20–0:50, 30 detik)

**Di layar:** lima masalah bergantian, termasuk angka 1.020 event dan dua tampilan portal (pengunjung biasa vs Googlebot).

**Narasi** (±65 kata):

> Satuan setingkat Kodim jarang punya analis siber. Log tersebar dan tidak pernah dibaca.
> Alat biasa membanjiri operator dengan alert mentah. Di lab kami, satu penyerang menghasilkan lebih dari seribu event dalam lima menit.
> Serangan ke beberapa satuan sekaligus tidak terlihat bila dipantau terpisah.
> Penyerang juga mematikan sensor lebih dulu.
> Dan situs satuan bisa disusupi judi online yang hanya terlihat oleh Google.

## 3. Arsitektur (0:50–1:30, 40 detik)

**Di layar:** diagram Agent → Core → Dashboard dan HP Komandan; lalu topologi lab; lalu stempel OFFLINE dan TANPA CLOUD.

**Narasi** (±80 kata):

> Arsitekturnya tiga lapis. Agent ringan di tiap satuan membaca log web, SSH, firewall, integritas file, dan Modbus, lalu mengirimnya ke Core setiap detik.
> Core memeriksa dengan tiga belas aturan, merangkai serangan menjadi Attack Story, memberi skor, lalu menampilkannya live di dashboard dan HP Komandan.
> Perintah balik ke agent hanya dari daftar tetap: blokir, buka blokir, dan uji.
> Di lab, Kodim A dengan PLC-nya dan Kodim B diserang dari mesin terpisah dengan satu IP tetap.
> Semuanya berjalan offline, tanpa cloud.

## 4. Demo deteksi (1:30–2:10, 40 detik)

**Di layar:** terminal nmap dan hydra (asli) di kiri, Beranda Analis (rekaman asli) di kanan; lalu Detail Insiden dengan Attack Story dan panel 933 event → 1 insiden.

**Narasi** (±75 kata):

> Demo dimulai. Penyerang memindai port Kodim A dengan nmap. Dua setengah detik kemudian, insiden muncul di Beranda tanpa muat ulang.
> Lalu brute force SSH dengan hydra, seratus dua puluh delapan percobaan. Tingkat Siaga naik sendiri, dan begitu login berhasil, menjadi Awas.
> Di Detail Insiden, serangan tersusun per tahap, lengkap dengan teknik MITRE ATT&CK.
> Sembilan ratus tiga puluh tiga event mentah menjadi satu insiden yang bisa dijelaskan.

## 5. Serangan lanjut (2:10–2:50, 40 detik)

**Di layar:** nmap ke Kodim B dan peta operasi; halaman Kampanye; terminal sqlmap, webshell, Modbus, judol sambil Attack Story terisi (dipercepat 2×); rincian skor 946; Penjaga Situs dengan tiga varian.

**Narasi** (±80 kata):

> IP yang sama lalu memindai Kodim B. SENTRA langsung mengaitkannya menjadi Kampanye lintas satuan, dan skor tiap insiden dikali satu koma tiga.
> Penyerang melanjutkan: SQL injection, mengunggah webshell yang tertangkap pemantau integritas file, menulis perintah Modbus ke PLC, lalu menyisipkan judi online ber-cloaking.
> Attack Story naik ke tahap Dampak. Skornya 946, Kritis, dengan rumus yang terbuka.
> Penjaga Situs membuka portal tiga kali: versi Googlebot dan referer Google berisi judi, browser biasa tetap normal.

## 6. Respons berjenjang (2:50–3:20, 30 detik)

**Di layar:** Analis desktop di kiri, HP Komandan di tengah, penghitung detik asli di kanan, terminal penyerang di bawah. Lalu tiga kartu: Analis 09:46:38, Komandan 09:46:52, Agent 09:46:54.

**Narasi** (±50 kata):

> Saatnya merespons. Analis mengusulkan blokir IP penyerang selama satu jam. Penyerang masih tersambung.
> Usulan masuk ke HP Komandan. Komandan menyetujui, dan dua koma empat enam detik kemudian koneksi penyerang terputus.
> Inilah two-person rule: yang mengusulkan tidak bisa menyetujui sendiri, dan setiap langkah tercatat.

## 7. LAPSIT (3:20–3:40, 20 detik)

**Di layar:** klik Buat LAPSIT, kutipan [EV-n] disorot, klik Unduh PDF, lalu kaki halaman PDF dengan SHA-256.

**Narasi** (±35 kata):

> Dengan satu klik, Laporan Situasi tersusun dari fakta insiden dalam kurang dari satu detik.
> Setiap temuan mengutip event buktinya.
> PDF-nya disegel hash SHA-256, sehingga perubahan sekecil apa pun ketahuan.

## 8. Ketahanan (3:40–4:10, 30 detik)

**Di layar:** agent Kodim B dimatikan, penghitung heartbeat sampai BUTA (dipercepat 4×); Uji Kesiapan sampai 11/11 (dipercepat 8×); Audit Log, Verifikasi Rantai, "Rantai utuh".

**Narasi** (±55 kata):

> Bagaimana jika penyerang mematikan sensor? Dua puluh sembilan detik tanpa heartbeat, agent ditandai buta dan insiden Sensor Buta muncul.
> SENTRA juga menguji dirinya: sebelas skenario aman, semua terdeteksi, rata-rata empat koma lima detik, tanpa insiden palsu.
> Terakhir, audit log berantai. Satu klik membuktikan tidak ada catatan yang diubah.

## 9. Hak akses (4:10–4:25, 15 detik)

**Di layar:** empat kartu peran, lalu Beranda Operator Kodim A (2/2 agent) berdampingan dengan Analis Kodam (3/3 agent).

**Narasi** (±30 kata):

> Ada empat peran: Operator, Analis, Komandan, dan Admin.
> Operator Kodim A hanya melihat satuannya: dua agent. Analis Kodam melihat semuanya: tiga agent.

## 10. Angka hasil uji dan kelayakan (4:25–4:45, 20 detik)

**Di layar:** tabel angka hasil ukur; empat kartu kelayakan: satu klik, offline, mini-PC, agent satu skrip.

**Narasi** (±40 kata):

> Semua angka ini diukur saat perekaman video ini, dari lab yang dinyalakan dari nol.
> Sistemnya siap dipasang: satu klik, offline, cukup di mini-PC, dan agent dipasang dengan satu skrip.

## 11. Penutup (4:45–5:00, 15 detik)

**Di layar:** batasan dan peta jalan; lalu tanda SENTRA SHIELD, nama tim, link repo dan landing page.

**Narasi** (±30 kata):

> Batasan kami akui terbuka: deteksi masih berbasis aturan, dan blokir masih di firewall host.
> Peta jalannya jelas.
> Terima kasih. Ini SENTRA SHIELD.

## Catatan penyesuaian storyboard

- **Rincian skor** dipindah dari adegan 4 ke akhir adegan 5. Footage rincian skor direkam setelah semua serangan, sehingga sudah menampilkan skor akhir 946. Menaruhnya di adegan 4 akan mendahului kejadian. Adegan 4 tetap menyorot skor yang sedang naik dan panel "933 event → 1 insiden".
- **Urutan di adegan 5** mengikuti urutan asli rekaman: SQL injection, webshell, Modbus, lalu judol, kemudian Penjaga Situs. Storyboard menaruh judol sebelum Modbus.
- **Bagian yang dipercepat** diberi label "Dipercepat N×" di layar: hydra 8×, serangan lanjut 2×, Sensor Buta 4×, Uji Kesiapan 8×. Angka detik di penghitung tetap waktu asli.
- **Tangkapan layar diam** dipakai di tiga tempat agar teks kecil terbaca saat diperbesar: Attack Story awal (adegan 4), kutipan [EV-n] (adegan 7), dial Uji Kesiapan (adegan 8). Ketiganya diambil oleh perekam yang sama di detik yang sama, dan diberi label "Tangkapan layar asli".
- **Nama tim** belum diisi. Isi `NAMA_TIM` di `video/src/data/identitas.ts` sebelum render final.
