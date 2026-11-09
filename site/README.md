# site/ — Landing page (link karya)

Halaman statis untuk link karya (F15, keputusan B8: tanpa VPS, landing page + video + screenshot). Tidak memuat font, CDN, atau skrip dari luar; bisa dibuka langsung dengan klik dua kali `index.html`. Gayanya sama dengan aplikasi (Olive Drab / Ops Darat, lihat `docs/design-system.md`).

- `index.html`: seluruh halaman (HTML + CSS dalam satu file).
- `fonts/`: Saira Stencil One, Saira Condensed, dan Fira Code (subset latin, SIL Open Font License 1.1; teks lisensi ikut di folder ini).
- `img/`: tangkapan layar asli dari lab setelah skenario serangan lengkap, berlabel DATA LATIHAN.

## Memasang video

Video demo sudah terpasang: `data-youtube="ekRmZRPW1-4"` di `index.html` (https://youtu.be/ekRmZRPW1-4). Pemutar disematkan lewat `youtube-nocookie.com`; tanpa JavaScript, kotak video menampilkan tautan ke YouTube. Untuk mengganti video, ubah ID itu (bagian setelah `youtu.be/` pada link) dan kedua tautan `youtu.be` di bawahnya. `img/video-demo.jpg` adalah thumbnail video yang dipakai README utama.

## Menerbitkan ke GitHub Pages

1. Pastikan perubahan sudah ada di branch `main`.
2. Di GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions** (sekali saja).
3. **Actions → Landing page → Run workflow**. Setelah selesai, alamatnya muncul di ringkasan workflow, biasanya `https://zuliandwisaputra.github.io/SENTRA-SHIELD-Smart-Cyber-Threat-Detection-Monitoring-System/`.

Setiap perubahan di `site/` pada branch `main` diterbitkan ulang otomatis.

## Memperbarui tangkapan layar

Ambil dari lab yang sudah menjalankan `jalankan-demo` (data asli dari serangan lab). Simpan sebagai JPEG lebar ±1600 px di `img/` dengan nama yang sama.
