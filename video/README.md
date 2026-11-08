# Video demo SENTRA SHIELD (Remotion)

Video demo untuk juri Kartika Cyber Hackathon 2026. Tujuannya: setelah menonton, juri paham cara kerja SENTRA dari serangan sampai blokir.

Status: **render final dengan narasi** (3:45). Narasi suara Zulian Dwi Saputra (tim Claudex404) sudah dipasang; durasi tiap adegan mengikuti panjang suara, dan visual serta teks layar mengikuti waktu tiap kata. Detail narasi, sinkronisasi, dan koreksi transkripsi: [`docs/naskah-video.md`](../docs/naskah-video.md). Berkas MP4 final tidak di-commit.

## Spesifikasi keluaran

| Hal | Nilai |
| --- | --- |
| Rasio, ukuran | 16:9, 1920 x 1080 |
| Frame rate | 60 fps |
| Durasi | 3:45, mengikuti panjang narasi (target awal 4–5 menit) |
| Format | MP4 H.264, target di bawah 400 MB |
| Audio | Narasi suara pembicara (−16 LUFS). Tanpa musik dan tanpa efek suara |

## Aturan isi

1. Semua bagian yang menampilkan aplikasi adalah **rekaman asli** dari lab (lihat bagian Footage). Tidak ada tiruan UI.
2. Animasi Remotion hanya untuk intro, penjelasan masalah, diagram arsitektur, angka, dan penutup.
3. Semua angka di video berasal dari pengukuran saat perekaman, disimpan di `src/data/rekaman.json`.
4. Gaya Olive Drab / Ops Darat (`../docs/design-system.md`): font stensil dan kondensasi yang sama, disimpan lokal di `public/fonts/` (OFL).
5. Tanpa logo atau lambang resmi TNI AD/PUSSIBERAD. Label DATA LATIHAN dari aplikasi tetap terlihat di footage.

## Struktur

```
video/
  src/
    Root.tsx            komposisi SentraDemo (1920x1080, 60 fps, 5:00)
    Video.tsx           urutan 11 adegan + slot narasi per adegan
    adegan/             A01Intro ... A11Penutup, daftar.ts (urutan dan durasi), Bingkai.tsx
    komponen/           Footage (kamera, sorotan, tanda klik, bingkai HP), Terminal (keluaran asli), dasar (panel, keterangan, stempel, logo)
    tema.ts, fonts.ts   token warna/huruf dan font lokal
    data/rekaman.json   transkrip terminal, penanda waktu, sampel layar, angka hasil ukur
    data/akses.json     penanda footage hak akses (Operator vs Analis)
    data/identitas.ts   nama tim, link repo (isi NAMA_TIM sebelum render final)
  public/
    fonts/              Saira Stencil One, Saira Condensed, Fira Code (+ lisensi OFL)
    narasi/             taruh rekaman suara per adegan di sini (lihat docs/naskah-video.md)
    rekaman/            footage hasil rekam (tidak di-commit)
  rekam/
    rekam.sh            reset lab dari nol, rekam, footage hak akses, konversi MP4
    rekam.cjs           skenario perekaman Playwright + serangan sungguhan + pengukuran
    rekam-akses.cjs     footage Operator Kodim A vs Analis Kodam pada lab yang sama
    pratinjau.cjs       render gambar diam di detik tertentu
  .agents/skills/       Remotion Agent Skills resmi (dipasang dengan npx remotion skills add)
```

## Footage asli

`rekam/rekam.sh` melakukan semuanya dalam satu kali jalan:

1. Lab dihapus total (`docker compose down -v`, termasuk database) lalu dinyalakan ulang. Ditunggu sampai 3 agent online.
2. Browser direkam dengan Playwright `recordVideo`:
   - **Analis** (`analis@sentra.lab`) di desktop, viewport dan video 1920 x 1080.
   - **Komandan** (`komandan@sentra.lab`) di viewport HP (emulasi iPhone 13, 390 x 844).
3. Serangan sungguhan dijalankan dari container `attacker` (172.30.0.66) dengan skrip di `lab/attacker/skenario/`: nmap ke Kodim A, hydra, nmap ke Kodim B, sqlmap, webshell, tulis Modbus ke PLC, injeksi judi online ber-cloaking.
4. Setiap baris keluaran terminal disimpan apa adanya beserta waktunya (`stdbuf` agar per baris). Kode warna ANSI dibuang.
5. Saat respons, penyerang terus membuka portal Kodim A tiap ±0,5 detik. Analis mengusulkan blokir, Komandan menyetujui dari HP, lalu terminal penyerang mencetak pesan `TERPUTUS` ketika permintaan pertama gagal.
6. Lalu LAPSIT (PDF diunduh), Sensor Buta (agent Kodim B dimatikan lalu dihidupkan), Uji Kesiapan, dan Verifikasi Rantai audit.
7. Angka diambil dari basis data lab setelah rekaman selesai.

Berkas yang dihasilkan:

| Berkas | Isi | Di-commit |
| --- | --- | --- |
| `public/rekaman/analis-desktop.webm` | Rekaman layar Analis, 1920 x 1080, 25 fps (VP8, bawaan Playwright) | Tidak |
| `public/rekaman/komandan-hp.webm` | Rekaman layar Komandan, 390 x 844 | Tidak |
| `public/rekaman/akses-operator.webm`, `akses-analis.webm` | Beranda Operator Kodim A dan Analis Kodam, direkam bersamaan setelah rekaman utama | Tidak |
| `public/rekaman/*.mp4` | Salinan H.264 dari tiap WebM (keyframe tiap 1 detik) yang dipakai Remotion | Tidak |
| `public/rekaman/stills/*.png` | Tangkapan layar di momen penting. HP pada skala 3x agar tetap tajam saat diperbesar | Tidak |
| `public/rekaman/lapsit.pdf` | LAPSIT asli yang diunduh Analis | Tidak |
| `src/data/rekaman.json` | Transkrip terminal, penanda waktu, sampel layar, angka | Ya |

Footage tidak di-commit karena besar. Footage hanya ada di mesin tempat perekaman. Untuk membuat ulang (Linux/WSL dengan Docker, Node.js, Playwright, ffmpeg, poppler-utils):

```bash
cd video
SENTRA_DC="docker compose -f ../lab/docker-compose.yml" ./rekam/rekam.sh
```

Rekaman ulang menghasilkan angka baru. Video harus selalu memakai `src/data/rekaman.json` dari rekaman yang sama dengan footage-nya.

### Isi `src/data/rekaman.json`

- `video.analis.mulai`, `video.komandan.mulai`: waktu (epoch ms) detik ke-0 tiap video. Posisi suatu kejadian di video = `t - mulai`.
- `terminal[]`: per perintah: `perintah`, `container`, `mulai`, `selesai`, `kode`, dan `baris[]` (`t`, `teks`).
- `penanda[]`: kejadian penting (`video`, `id`, `ket`, `t`), dengan `kotak`/`klik` berisi posisi elemen di layar (piksel viewport) untuk sorotan.
- `sampel.analis[]`, `sampel.komandan[]`: setiap perubahan yang terlihat di layar (Tingkat Siaga, skor, jumlah tahap, kartu Beranda, indikator Live).
- `ukur`: angka hasil ukur saat perekaman. `db`: angka dari basis data lab.
- `galat[]`: masalah selama perekaman. Setiap isinya dijelaskan di bagian Angka di video.

## Angka di video

### Rekaman yang dipakai

- Direkam 8 November 2026, 09:41–09:50 WIB, dari lab yang di-reset ke nol. Skrip: `rekam/rekam.cjs` versi commit `fd7286c`. (Field `git` di JSON berisi `5750477` karena commit dibuat 20 detik setelah perekaman dimulai; isi skripnya sama.)
- Panjang footage: Analis 8:42 (1920 x 1080, 25 fps, 55 MB), Komandan 8:43 (390 x 844, 14 MB). Video final memotong bagian yang perlu saja.
- Sinkronisasi: detik ke-0 video = `video.*.mulai`. Akurasi sekitar ±0,5 detik: kartu Insiden berubah di frame 22,36 detik, sampel layar mencatatnya di 22,8 detik (sampel tiap 0,4 detik). Untuk momen penting, cocokkan ke frame.
- `galat` berisi 1 catatan: perekam menunggu Tingkat Siaga berubah setelah nmap, padahal insiden pemindaian berkeparahan Rendah memang tidak menaikkan Tingkat Siaga (tetap Aman, yang berubah kartu Insiden terbuka). Ini kesalahan perekam, bukan aplikasi. Perekam sudah diperbaiki untuk rekaman berikutnya; angkanya diambil dari frame video.

### Angka hasil ukur dan perbandingan dengan README utama

| Hal | Rekaman ini | README utama | Sumber |
| --- | --- | --- | --- |
| Serangan ke Kodim A | 1.020 event dari 172.30.0.66 (termasuk percobaan akses portal saat respons) → 1 insiden, 11 aturan, 4 tahap, skor **946 Kritis** | ±970 event → 1 insiden, 11 aturan, 4 tahap, skor 946 | `db.insiden`, `db.deteksiPerAturan`, kueri event |
| nmap mulai → insiden tampil di Beranda tanpa muat ulang | **2,5 detik** | event tampil ±2 detik | frame video + `penanda` |
| nmap ke Kodim B → peta menampilkan 2 satuan sasaran (Kampanye #1) | **1,8 detik** | – | `ukur.nmapBKeDuaSatuanDiBerandaMs` |
| Komandan klik Setujui → penyerang terputus | **≤ 2,5 detik**: permintaan sukses terakhir 1,9 detik, permintaan gagal pertama 2,5 detik setelah klik | 2,7–4,0 detik | `ukur.portal` (jam di terminal penyerang) |
| Komandan klik Setujui → status Dieksekusi di layar Analis tanpa muat ulang | **2,9 detik** | – | `ukur.setujuKeDieksekusiDiLayarAnalisMs` |
| LAPSIT terbit (template; Ollama tidak tersedia di lab rekaman) | **0,7 detik**, PDF ber-hash SHA-256 | Template ±2 detik | `ukur.lapsitMs`, `ukur.lapsit` |
| Agent Kodim B dimatikan → BUTA di Beranda | **29,2 detik**; insiden Sensor Buta (Tinggi, skor 96) dibuat 28,4 detik setelah dimatikan | ±40 detik | `ukur.sensorMatiKeButaMs`, `db.insiden` |
| Agent dihidupkan → kembali 3/3 online | **3,7 detik** | – | `ukur.sensorHidupKeOnlineMs` |
| Uji Kesiapan Kodim A | **11/11** (100%), rata-rata waktu deteksi **4,5 detik** (4.532 ms), selesai dalam 69 detik, **0** insiden dari event uji | 11/11, rata-rata 4,2–4,7 detik, tanpa insiden palsu | `db.ujiKesiapan`, `db.ujiKesiapanHasil`, `db.insidenDariEventUji` |
| Penjaga Situs | Varian Googlebot dan Referer Google **ditandai** (kemiripan 6,8%, 8 kata judi); browser biasa 100% sama | – | `db.penjagaSitus` |
| Audit log | **Rantai utuh**, 21 baris diperiksa saat rekaman (22 baris setelah rekaman selesai) | – | `ukur.auditTeks`, `db.auditVerifikasi` |

Perbedaan dengan README utama dan sebabnya:

- **Waktu putus lebih pendek (≤ 2,5 vs 2,7–4,0 detik).** Metodenya berbeda. Pengukuran lama mencatat waktu setelah `curl` gagal, termasuk batas tunggu 2 detik. Rekaman ini memakai jam mulai permintaan gagal pertama yang dicetak terminal penyerang. Blokir aktif di antara 1,9 dan 2,5 detik setelah klik Setujui.
- **Sensor Buta lebih cepat (29 vs ±40 detik).** Batasnya tetap heartbeat hilang lebih dari 30 detik. Heartbeat terakhir terkirim sebelum agent dimatikan, jadi alarm muncul kurang dari 30 detik setelah perintah stop.
- **LAPSIT template lebih cepat (0,7 vs ±2 detik).** Lab rekaman tanpa Ollama, sehingga langsung memakai template. LAPSIT menyebut hal itu di dokumennya.
- **Jumlah event** sedikit lebih besar karena ikut menghitung percobaan akses portal penyerang selama respons.

### Peta footage

Waktu di footage mentah (menit:detik).

| Video Analis | Video HP | Sumber | Kejadian |
| --- | --- | --- | --- |
| 0:07.7 |  | Analis | Beranda Komando sebelum serangan |
| 0:13.4 | 0:13.4 | Komandan (HP) | Beranda Komando di HP |
| 0:19.9 |  | Terminal penyerang | nmap ke Kodim A |
| 1:23.7 |  | Terminal penyerang | hydra brute force SSH ke Kodim A |
| 1:37.2 |  | Analis | Arus event live saat brute force |
| 1:54.3 |  | Analis | Beranda saat brute force berjalan |
| 2:58.1 |  | Terminal penyerang | nmap ke Kodim B |
| 3:03.0 |  | Analis | Peta operasi: dua satuan sasaran dari IP yang sama |
| 3:11.8 |  | Analis | Buka kampanye |
| 3:15.3 |  | Analis | Kampanye lintas satuan |
| 3:26.5 |  | Analis | Buka insiden Kodim A |
| 3:29.8 |  | Analis | Detail Insiden: tahap Pengintaian dan Akses Awal |
| 3:33.2 |  | Terminal penyerang | sqlmap ke portal Kodim A |
| 3:42.1 |  | Terminal penyerang | Unggah webshell ke portal Kodim A |
| 3:49.7 |  | Terminal penyerang | Perintah tulis Modbus ke PLC |
| 3:54.6 |  | Terminal penyerang | Injeksi judi online ber-cloaking ke portal Kodim A |
| 4:01.1 |  | Analis | Attack Story lengkap, skor Kritis |
| 4:05.9 |  | Analis | Rincian skor dengan rumus terbuka |
| 4:11.8 |  | Analis | Event bukti mentah |
| 4:16.9 |  | Terminal Core | Core: Penjaga Situs memeriksa portal |
| 4:21.8 |  | Analis | Penjaga Situs: versi Googlebot berisi judi |
| 4:26.5 |  | Analis | Perbandingan varian browser vs Googlebot |
| 4:33.4 |  | Terminal penyerang | Penyerang terus membuka portal Kodim A |
| 4:39.2 |  | Analis | Panel Tindakan respons |
| 4:44.0 |  | Analis | Analis mengusulkan blokir IP |
| 4:45.1 |  | Analis | Usulan blokir terkirim ke Antrean Persetujuan |
| 4:50.2 | 4:50.1 | Komandan (HP) | Menu Antrean Persetujuan |
| 4:53.7 | 4:53.6 | Komandan (HP) | Antrean Persetujuan di HP Komandan |
| 4:57.7 | 4:57.7 | Komandan (HP) | Komandan menyetujui dari HP |
| 4:58.6 | 4:58.6 | Komandan (HP) | Perintah dikirim ke agent |
| 5:06.6 |  | Analis | Status tindakan Dieksekusi tanpa muat ulang |
| 5:13.0 | 5:13.0 | Komandan (HP) | Menu Beranda |
| 5:21.1 |  | Analis | Beranda: blokir aktif |
| 5:29.1 |  | Analis | Riwayat tindakan: pengusul, pemutus, hasil agent |
| 5:37.7 |  | Analis | Panel LAPSIT |
| 5:38.3 |  | Analis | Analis membuat LAPSIT |
| 5:42.8 |  | Analis | LAPSIT terbit dengan sitasi bukti |
| 5:47.9 |  | Analis | Unduh PDF LAPSIT |
| 5:58.1 |  | Terminal lab | Agent Kodim B dimatikan |
| 6:27.3 |  | Analis | Agent Kodim B BUTA |
| 6:36.4 |  | Analis | Insiden Sensor Buta di daftar |
| 6:39.8 |  | Terminal lab | Agent Kodim B dihidupkan kembali |
| 6:52.5 |  | Analis | Jalankan Uji Kesiapan |
| 8:07.1 |  | Analis | Matriks Uji Kesiapan terisi |
| 8:11.9 |  | Analis | Matriks skenario |
| 8:23.5 |  | Analis | Verifikasi Rantai audit |
| 8:25.9 |  | Analis | Rantai audit utuh |
| 8:36.3 |  | Analis | Beranda akhir |

### Catatan untuk storyboard

- Di HP (390 px), Antrean Persetujuan sempat memecah IP menjadi `172.30.0.6` / `6`. Cacat ini sudah diperbaiki di Core (commit `6464cb1`, juga di-merge ke branch ini). Footage video tetap dari rekaman 8 November sebelum perbaikan, atas pilihan pemilik proyek, agar angka di narasi tetap cocok dengan footage.
- Banner hydra asli memuat kalimat "Please do not use in military or secret service organizations...". Panel terminal di adegan 4 tidak menampilkan baris banner itu; baris lain tampil apa adanya, tanpa diubah.
- Nmap mencetak jam UTC (`02:42 UTC`); dashboard dan terminal akses portal memakai WIB. Keduanya keluaran asli.
- LAPSIT di footage dibuat oleh template (bukan LLM) dan dokumennya mengatakan begitu.

## Lisensi Remotion

Diperiksa pada 8 November 2026 untuk Remotion **4.0.541** (versi dikunci persis di `package.json`).

Sumber: berkas lisensi yang ikut terpasang, `node_modules/remotion/LICENSE.md`. Halaman daring (`remotion.dev/docs/license`, FAQ di `remotion.pro/faq`) tidak bisa dibuka dari lingkungan perekaman karena jaringannya dibatasi, jadi belum ikut diperiksa.

Isi yang relevan:

- Ada dua lisensi: **Free License** dan **Company License**.
- Free License berlaku bagi: perorangan; organisasi for-profit dengan paling banyak 3 karyawan; organisasi non-profit; atau yang masih mengevaluasi dan belum memakai secara komersial.
- Pemegang Free License boleh memakai Remotion secara non-komersial maupun komersial untuk membuat video dan gambar, serta mengubahnya untuk kebutuhan sendiri.
- Yang dilarang: menyalin atau mengubah kode Remotion untuk dijual, disewakan, atau dilisensikan ulang sebagai turunan Remotion.
- Company License wajib bagi organisasi yang tidak termasuk kelompok Free License.
- Berkas lisensi tidak menyebut kewajiban watermark atau atribusi di dalam video.
- Berkas lisensi menyebut lisensi akan sedikit berubah di Remotion 5.0 (github.com/remotion-dev/remotion/pull/3750). Proyek ini memakai 4.x.

Kesimpulan: membuat video demo untuk kompetisi sebagai perorangan atau tim perorangan (bukan atas nama perusahaan dengan lebih dari 3 karyawan) termasuk **Free License**, tanpa biaya. Bila tim mewakili perusahaan yang lebih besar, perlu Company License. Untuk kasus di luar itu, periksa FAQ resmi di https://www.remotion.pro/faq.

## Perintah

```bash
npm i                 # pasang dependensi
npm run dev           # buka Remotion Studio untuk pratinjau
npm run lint          # eslint + tsc
```

Gambar diam di titik pratinjau bawaan (atau detik tertentu):

```bash
node rekam/pratinjau.cjs out/pratinjau
```

Render final, 1920 x 1080, 60 fps, H.264 + AAC. Langkah kedua mengubah piksel rentang penuh (yuvj420p, keluaran Remotion dari frame JPEG) ke yuv420p standar agar warnanya sama di semua pemutar:

```bash
npx remotion render SentraDemo out/render.mp4 --codec=h264 --crf=18 --audio-codec=aac
ffmpeg -i out/render.mp4 -vf "scale=in_range=pc:out_range=tv,format=yuv420p" -c:v libx264 -preset slow -crf 17 -c:a copy -movflags +faststart out/SENTRA-SHIELD-Demo-1080p.mp4
```

Bila Remotion tidak bisa mengunduh Chrome Headless Shell (jaringan dibatasi), tambahkan `--browser-executable=<path chrome-headless-shell>`; untuk `pratinjau.cjs` pakai variabel `REMOTION_CHROME`. Folder `out/` tidak di-commit.

## Narasi

Rekaman suara dari HP (`.m4a`) dipasang dengan satu perintah:

```bash
node rekam/pasang-narasi.cjs <folder berisi intro.m4a, masalah.m4a, ...>
```

Skrip ini mencocokkan nama berkas dengan id adegan ("serangan lanjut" → `05-serangan-lanjut`). Setiap berkas diubah ke WAV 48 kHz mono, dengungnya dikurangi (high-pass 80 Hz, notch 100/150 Hz, denoise FFT), hening di awal/akhirnya dipotong, lalu volumenya disamakan ke −16 LUFS. Hasilnya ada di `public/narasi/<id>.wav` (tidak di-commit) dan durasinya di `src/data/narasi.json`. Durasi adegan dihitung otomatis dari durasi narasi (`src/adegan/daftar.ts`).

Waktu tiap kata (`src/data/narasi-kata.json`, hasil Whisper) dipakai adegan untuk menempatkan visual dan teks layar. Bila narasi direkam ulang dengan kalimat berbeda, transkripsi ulang lalu sesuaikan indeks kata di tiap adegan.
