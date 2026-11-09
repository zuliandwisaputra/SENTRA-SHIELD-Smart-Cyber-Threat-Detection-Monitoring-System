# Video demo SENTRA SHIELD (Remotion)

Video demo untuk juri Kartika Cyber Hackathon 2026. Tujuannya: setelah menonton, juri paham cara kerja SENTRA dari serangan sampai blokir.

Status: **versi 2** (render final 1080p 60 fps). Naskah dan storyboard: [`docs/naskah-video-v2.md`](../docs/naskah-video-v2.md). Versi 1 (3:45, narasi suara pembicara) ada di riwayat git dan [`docs/naskah-video.md`](../docs/naskah-video.md). Berkas MP4 final tidak di-commit.

## Spesifikasi keluaran

| Hal | Nilai |
| --- | --- |
| Rasio, ukuran | 16:9, 1920 x 1080 |
| Frame rate | 60 fps |
| Durasi | 8:59,6 (mengikuti panjang narasi; target 8–9 menit, maksimal 10 menit) |
| Format | MP4 H.264 + AAC |
| Audio | Narasi suara sintetis (TTS, VoxCPM2) −16 LUFS; efek suara dan musik ambient prosedural buatan sendiri, selalu diredam (ducking) di bawah narasi |

## Aturan isi

1. Semua bagian yang menampilkan aplikasi adalah **rekaman asli** dari lab (lihat bagian Footage). Tidak ada tiruan UI.
2. Animasi Remotion hanya untuk penjelasan (intro, analogi, masalah, arsitektur, persamaan skor, rantai audit, rekap, angka, penutup). Kartu penjelasan memakai data asli dari rekaman.
3. Semua angka di video berasal dari pengukuran saat perekaman, disimpan di `src/data/rekaman.json`.
4. Gaya Olive Drab / Ops Darat (`../docs/design-system.md`): font stensil dan kondensasi yang sama, disimpan lokal di `public/fonts/` (OFL).
5. Tanpa logo atau lambang resmi TNI AD/PUSSIBERAD. Label DATA LATIHAN dari aplikasi tetap terlihat di footage, dan bagian yang dipercepat diberi label "Dipercepat N×".
6. Narasi memakai suara sintetis (TTS) dan video mencantumkan "Narasi: suara sintetis (TTS)" di penutup. Tanpa musik berhak cipta.

## Struktur

```
video/
  src/
    Root.tsx            komposisi SentraDemo (1920x1080, 60 fps, durasi dari narasi)
    Video.tsx           urutan 19 adegan, narasi TTS per adegan, whoosh antar-adegan, ambient + ducking
    adegan/             S01Pembuka ... S19Penutup, daftar.ts (urutan dan durasi), Bingkai.tsx
    komponen/           Footage (kamera, sorotan, klik, bingkai HP), Terminal (keluaran asli),
                        Rangkaian (potongan footage + titik jangkar + tahan gambar),
                        v2 (subtitle satu baris, pola tiga bagian, kartu APA ITU?, layar terbagi, efek suara)
    data/rekaman.json   transkrip terminal, penanda waktu, sampel layar, angka hasil ukur dan basis data
    data/naskah.json    kalimat narasi per adegan (ejaan asli + angka dari rekaman)
    data/narasi-v2.json durasi narasi, waktu tiap kalimat dan kata (untuk subtitle dan sinkron gambar)
    data/narasi.ts      pada(id, "frasa"): detik saat frasa diucapkan; subtitle; faktor ducking
  public/
    fonts/              Saira Stencil One, Saira Condensed, Fira Code (+ lisensi OFL)
    rekaman/            footage hasil rekam (tidak di-commit)
    narasi-v2/          narasi TTS per adegan (tidak di-commit; dibuat ulang)
    sfx/                efek suara prosedural (tidak di-commit; dibuat ulang)
  rekam/
    rekam.sh            reset lab dari nol, rekam, footage hak akses, konversi MP4, PDF LAPSIT ke PNG
    rekam.cjs           skenario perekaman Playwright + serangan sungguhan + pengukuran + kueri basis data
    rekam-akses.cjs     footage Operator Kodim A vs Analis Kodam pada lab yang sama
    tts/                susun-naskah.py, kamus.py, narasi.py, suara-a.flac (lihat tts/README.md)
    sfx/buat-sfx.py     efek suara dan ambient prosedural
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

- Direkam ulang 8 November 2026, 19:16–19:24 WIB, dari lab yang di-reset ke nol, setelah perbaikan tampilan IP di HP (commit `6464cb1`). Skrip: `rekam/rekam.cjs` di commit `6a7a0db`.
- Panjang footage: Analis 7:35 (1920 x 1080, 25 fps), Komandan 7:36 (390 x 844).
- `rincianSkor`, `agentButa`, dan `auditRantai` diambil dari basis data lab yang sama segera setelah perekaman (lab belum di-reset), dengan kueri yang kini juga ada di `rekam.cjs`.
- Jeda nmap → insiden tampil diukur dari frame video (selisih piksel kartu Insiden Terbuka): 3,58 detik. Sampel layar tiap 0,4 detik mencatat 3,62 detik.

### Angka hasil ukur

| Hal | Rekaman ini | Sumber |
| --- | --- | --- |
| Serangan ke Kodim A | 1.021 event dari 172.30.0.66 → 1 insiden, 11 aturan, 4 tahap, skor **946 Kritis** = (425 + 60) × 1,5 × 1,3 | `db.insiden`, `db.rincianSkor`, `db.eventPenyerangPerSumber` |
| Sampai brute force selesai | 805 event firewall + 128 percobaan login SSH = **933** catatan → 1 insiden | `db.eventPenyerangPerSumber` |
| nmap mulai → insiden tampil di Beranda tanpa muat ulang | **3,6 detik** | frame video + terminal `nmap-kodim-a` |
| nmap ke Kodim B → peta menampilkan 2 satuan sasaran (Kampanye #1) | **2,3 detik** | `ukur.nmapBKeDuaSatuanDiBerandaMs` |
| Komandan klik Setujui → penyerang terputus | **≤ 3,19 detik**: permintaan sukses terakhir 2,67 detik, gagal pertama 3,19 detik setelah klik | `ukur.portal` (jam di terminal penyerang) |
| Setujui → status Dieksekusi di layar Analis tanpa muat ulang | **3,6 detik** | `ukur.setujuKeDieksekusiDiLayarAnalisMs` |
| LAPSIT (template; Ollama tidak tersedia di lab rekaman) | **0,63 detik**, PDF ber-hash SHA-256 | `ukur.lapsitMs` |
| Sensor Buta | **31 detik tanpa heartbeat** (heartbeat terakhir 19:21:19, BUTA 19:21:50); tampil di Beranda 23 detik setelah agent dimatikan | `db.agentButa`, `ukur.sensorMatiKeButaMs` |
| Agent dihidupkan → kembali 3/3 online | **3,6 detik** | `ukur.sensorHidupKeOnlineMs` |
| Uji Kesiapan Kodim A | **11/11**, rata-rata **4,5 detik**, selesai dalam 70 detik, **0** insiden dari event uji | `db.ujiKesiapan*`, `db.insidenDariEventUji` |
| Penjaga Situs | Googlebot dan Referer Google **ditandai** (kemiripan 7%, 8 kata judi); browser biasa 100% | `db.penjagaSitus` |
| Audit log | **Rantai utuh**, 21 baris diperiksa saat rekaman | `ukur.auditTeks`, `db.auditRantai` |
| Hak akses | Operator Kodim A 2/2 agent, Analis Kodam 3/3 agent | `src/data/akses.json` |

Catatan:

- Banner hydra asli memuat kalimat "Please do not use in military or secret service organizations...". Panel terminal tidak menampilkan baris banner itu; baris lain tampil apa adanya.
- Nmap mencetak jam UTC; dashboard dan terminal akses portal memakai WIB. Keduanya keluaran asli.
- LAPSIT di footage dibuat oleh template (bukan LLM) dan dokumennya mengatakan begitu.
- Posisi setiap kejadian di footage ada di `penanda[]` (`t - video.*.mulai`).

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

Urutan membuat video v2 dari nol (Linux/WSL dengan Docker, Node.js, Playwright, ffmpeg, poppler-utils, Python 3):

```bash
SENTRA_DC="docker compose -f ../lab/docker-compose.yml" ./rekam/rekam.sh
```

```bash
python3 rekam/tts/susun-naskah.py
```

```bash
venv-tts/bin/python rekam/tts/narasi.py
```

```bash
venv-tts/bin/python rekam/sfx/buat-sfx.py
```

Langkah 2 menyusun narasi dengan angka dari rekaman. Langkah 3 membuat narasi TTS dan memeriksa setiap kalimat dengan Whisper; kalimat yang sudah lulus disimpan dan tidak dibuat ulang (lihat `rekam/tts/README.md`). Langkah 4 membuat efek suara dan ambient.

Gambar diam untuk pemeriksaan (skala 0,5):

```bash
node rekam/pratinjau.cjs out/pratinjau --skala 0.5 120 245.5 nama=300
```

Render final, 1920 x 1080, 60 fps, H.264 + AAC (±30 menit di CPU 4 inti):

```bash
npx remotion render SentraDemo out/render-v2.mp4 --codec=h264 --crf=18 --audio-codec=aac --audio-bitrate=256k --concurrency=4
```

Langkah kedua mengubah piksel rentang penuh (yuvj420p) ke yuv420p standar dan menyamakan keras suara keseluruhan ke −16 LUFS. Pertama ukur campurannya (narasi mono yang dijadikan stereo membuatnya ±3 dB lebih keras):

```bash
ffmpeg -i out/render-v2.mp4 -vn -af loudnorm=I=-16:TP=-1.5:LRA=11:print_format=json -f null -
```

Lalu masukkan angka `input_i`, `input_tp`, `input_lra`, `input_thresh`, `target_offset` dari langkah tadi (mode linear, sehingga dinamikanya tidak berubah):

```bash
ffmpeg -i out/render-v2.mp4 -vf "scale=in_range=pc:out_range=tv,format=yuv420p" -c:v libx264 -preset medium -crf 17 -color_primaries bt709 -color_trc bt709 -colorspace bt709 -af "loudnorm=I=-16:TP=-1.5:LRA=11:measured_I=<input_i>:measured_TP=<input_tp>:measured_LRA=<input_lra>:measured_thresh=<input_thresh>:offset=<target_offset>:linear=true" -ar 48000 -c:a aac -b:a 256k -movflags +faststart out/SENTRA-SHIELD-Demo-v2-1080p.mp4
```

Pemeriksaan akhir (durasi, LUFS, frame tiap 5 detik, sinkron narasi vs subtitle lewat Whisper):

```bash
venv-tts/bin/python rekam/qa.py out/SENTRA-SHIELD-Demo-v2-1080p.mp4 out/qa
```

Thumbnail YouTube (1280 x 720, PNG < 2 MB; tangkapan layar asli Beranda dan HP Komandan, angka 3,19 dtk dari `rekaman.json`):

```bash
npx remotion still src/index.ts Thumbnail out/thumbnail-youtube.png
```

Bila Remotion tidak bisa mengunduh Chrome Headless Shell (jaringan dibatasi), tambahkan `--browser-executable=<path chrome-headless-shell>`; untuk `pratinjau.cjs` pakai variabel `REMOTION_CHROME`. Folder `out/` tidak di-commit.

## Narasi, efek suara, dan subtitle (v2)

- **Narasi:** satu suara pria sintetis (VoxCPM2, voice design lalu kloning dari `rekam/tts/suara-a.flac`). Setiap kalimat diperiksa: transkrip Whisper harus cocok dengan naskah dan nada dasar harus di rentang suara A; yang gagal dibuat ulang dengan seed lain. Per adegan: high-pass 60 Hz, potong hening, loudnorm −16 LUFS.
- **Sinkron:** waktu tiap kata dari Whisper diselaraskan ke kata naskah. Adegan memakai `pada(ID, "frasa")` untuk menempatkan gambar, sorotan, kartu, dan efek suara tepat saat frasa itu diucapkan. Footage diatur dengan titik jangkar (kejadian X tampil saat kata Y), kecepatan dihitung otomatis dan diberi label "Dipercepat N×".
- **Subtitle:** penuh, satu baris per potongan (maksimal ±50 karakter), dipotong di tanda baca bila memungkinkan.
- **Efek suara:** klik, teleprinter, bip, stempel, whoosh, ping radar, putus, sukses, detak, retak, dan ambient. Semuanya disintesis oleh `rekam/sfx/buat-sfx.py`. Saat narasi berbicara, efek suara turun ±8 dB dan ambient ±12 dB, dengan transisi halus 0,15 detik.
- `rekam/pasang-narasi.cjs` adalah alat versi 1 (narasi suara pembicara dari HP) dan tidak dipakai di v2.
