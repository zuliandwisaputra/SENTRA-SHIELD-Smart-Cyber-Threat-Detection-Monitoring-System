# Video demo SENTRA SHIELD (Remotion)

Video demo untuk juri Kartika Cyber Hackathon 2026. Tujuannya: setelah menonton, juri paham cara kerja SENTRA dari serangan sampai blokir.

Status: **persiapan**. Proyek dan footage asli sudah siap; adegan dibuat setelah storyboard diterima. Belum ada render final.

## Spesifikasi keluaran

| Hal | Nilai |
| --- | --- |
| Rasio, ukuran | 16:9, 1920 x 1080 |
| Frame rate | 60 fps |
| Durasi | 4 sampai 5 menit |
| Format | MP4 H.264, target di bawah 400 MB |
| Audio | Tanpa musik berhak cipta. Hanya hening, atau efek suara buatan sendiri |

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
    Root.tsx          komposisi SentraDemo (1920x1080, 60 fps); saat ini penanda sementara
    tema.ts           token warna dan huruf (sama dengan Core)
    fonts.ts          memuat font lokal lewat @remotion/fonts
    data/rekaman.json transkrip terminal, penanda waktu, sampel layar, dan angka hasil ukur
  public/
    fonts/            Saira Stencil One, Saira Condensed, Fira Code (+ lisensi OFL)
    rekaman/          footage hasil rekam (tidak di-commit, lihat di bawah)
  rekam/
    rekam.sh          reset lab dari nol lalu jalankan perekam
    rekam.cjs         skenario perekaman Playwright + serangan sungguhan + pengukuran
  .agents/skills/     Remotion Agent Skills resmi (dipasang dengan npx remotion skills add)
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
- `galat[]`: masalah selama perekaman (harus kosong untuk rekaman yang dipakai).

## Angka di video

ANGKA_REKAMAN

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

Render final dilakukan setelah storyboard disetujui.
