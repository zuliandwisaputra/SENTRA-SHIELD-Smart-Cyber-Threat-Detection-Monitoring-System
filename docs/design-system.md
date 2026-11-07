# Sistem desain SENTRA SHIELD

Pegangan tampilan Core. Satu sumber token: variabel CSS di `core/resources/css/app.css`, dipetakan ke Tailwind di `core/tailwind.config.js`. Komponen Blade ada di `core/resources/views/components/` (`ui/` untuk komponen baru).

## Arah

Layar ruang komando, bukan template admin. Ciri yang dijaga:

- **Mode gelap permanen.** Latar hampir hitam kebiruan, garis tipis, tanpa bayangan pada panel.
- **Satu angka atau status terpenting per layar**, cukup besar untuk dibaca dari proyektor. Contohnya Tingkat Siaga keseluruhan di Beranda, Skor Risiko di Detail Insiden, dan cakupan di Uji Kesiapan.
- **Warna status punya arti tetap.** Hijau, kuning, oranye, dan merah hanya dipakai untuk status. Aksen biru "radar" dipakai untuk interaksi (tautan, tombol utama, fokus).
- **Data teknis tampil apa adanya**, dalam huruf monospace: IP, hash, `[EV-n]`, kode aturan, teknik ATT&CK.
- **Gerak secukupnya dan bermakna**: denyut Live, baris feed baru, angka KPI yang berubah, sapuan radar di layar masuk.

Yang sengaja dihindari:

- gradien ungu-biru dan glassmorphism tebal;
- ikon emoji dan bayangan tebal;
- angka hiasan, karena semua angka berasal dari data asli;
- logo, lambang, atau nama resmi TNI AD/PUSSIBERAD. Tanda SENTRA SHIELD (`x-application-logo`) adalah perisai dengan radar rancangan sendiri.

## Asal rekomendasi

Rekomendasi dicari dengan skill **ui-ux-pro-max** (MIT, dipasang di `.claude/skills/ui-ux-pro-max`, dipakai saat pengembangan saja). Kueri: *"dashboard pusat komando keamanan siber militer (SOC), mode gelap, data padat, dipakai operator dan komandan"*, dengan pengaturan `--design-system --density 8 --motion 3 --variance 4`.

| Temuan skill | Dipakai? | Catatan |
|---|---|---|
| Gaya *Data-Dense Dashboard* + *Dark Mode (OLED)* | Ya | Grid rapat, kartu KPI, tabel padat dengan header lengket, padding 12–16 px. |
| Pola *Real-Time / Operations*: status berwarna hijau/kuning/merah, label "live" hanya bila sumbernya benar-benar aktif dan ada waktu pembaruan | Ya | Indikator Live di menu membedakan WebSocket (hijau berdenyut) dan polling (kuning). |
| Tipografi *Dashboard Data*: Fira Code + Fira Sans | Ya | Ditambah Fira Sans Condensed untuk judul dan angka besar. Dibundel lokal, bukan Google Fonts. |
| Grafik: *Line with highlights* untuk anomali; garis/marker, bukan warna saja | Ya | Grafik event per menit. Lonjakan ditandai bentuk dan teks. |
| UX: skeleton saat memuat, fokus terlihat, `prefers-reduced-motion`, target sentuh ≥44 px, tanpa emoji sebagai ikon | Ya | Lihat bagian Aksesibilitas. |
| Gaya *Cyberpunk UI*: hijau Matrix `#00FF41`, glitch, scanline, neon glow | **Tidak** | Bertentangan dengan arah "serius, bukan sci-fi". Hijau disimpan untuk status Aman agar maknanya tidak kabur. |
| Efek *scroll reveal* (GSAP) | **Tidak** | Menambah pustaka. Dashboard tidak bercerita lewat gulir. |

## Warna

Nilai disimpan sebagai triplet RGB agar modifier opasitas Tailwind bekerja (`bg-awas/15`). Kontras dihitung terhadap panel `#0C121C`.

### Permukaan dan garis

| Token | Hex | Kelas | Pakai untuk |
|---|---|---|---|
| `--base` | `#070B12` | `bg-base` | Latar halaman, isi input |
| `--panel` | `#0C121C` | `bg-panel`, `.panel` | Panel/kartu utama |
| `--raised` | `#111A27` | `bg-raised` | Hover, dropdown, kartu dalam panel |
| `--inset` | `#16212F` | `bg-inset` | Sumur, chip, baris aktif |
| `--line` | `#1D2938` | `border-line` | Garis pemisah |
| `--line-strong` | `#2C3C51` | `border-line-strong` | Garis tegas, ring lencana netral |
| `--line-control` | `#5B6F8A` | `border-line-control` | Batas input/checkbox (3,6:1, lolos aturan 3:1 komponen) |

### Teks dan aksen

| Token | Hex | Kontras | Pakai untuk |
|---|---|---|---|
| `--ink` | `#E7EDF5` | 15,9:1 | Teks utama, angka |
| `--ink-2` | `#A9B6C8` | 9,1:1 | Teks sekunder |
| `--ink-3` | `#8492A8` | 6,0:1 (5,2:1 di `inset`) | Label, keterangan, waktu |
| `--accent` | `#4CC4EC` | 9,3:1 | Tautan, tombol utama, fokus, sapuan radar |
| `--accent-strong` | `#7AD3F2` | — | Hover aksen |
| `--accent-ink` | `#04121A` | 9,4:1 di atas aksen | Teks pada tombol utama |

Skala `gray` Tailwind dipetakan ulang ke netral kebiruan yang sama, sehingga halaman lama ikut serasi dan teks `gray-400`/`gray-500` tetap lolos AA.

### Status: severity = Tingkat Siaga

Satu skala empat tingkat dipakai di semua tempat. Severity deteksi/insiden dan Tingkat Siaga satuan berbagi warna:

| Tingkat Siaga | Severity | Token | Hex | Kontras teks | Ikon | Pembeda tanpa warna |
|---|---|---|---|---|---|---|
| Aman | Rendah | `--aman` | `#3DD68C` | 10,0:1 | `shield-check` | Teks + ikon / meter 1 batang |
| Waspada | Sedang | `--waspada` | `#F2C94C` | 11,8:1 | `eye` | Teks + ikon / meter 2 batang |
| Siaga | Tinggi | `--siaga` | `#F59A4E` | 8,6:1 | `triangle-alert` | Teks + ikon / meter 3 batang |
| Awas | Kritis | `--awas` | `#F26462` | 6,1:1 | `siren` | Teks + ikon / meter 4 batang |

Aturan pemakaian:

- **Lencana** memakai latar tint 10–15 % dan teks berwarna status (kontras 5,2–8,9:1). Kelasnya ada di enum (`AlertLevel::badgeClass()`, `Severity::badgeClass()`, `ActionStatus::badgeClass()`, `AgentStatus::badgeClass()`), jadi warna satu tingkat selalu sama di semua halaman.
- **Ubin status padat** (Tingkat Siaga keseluruhan) memakai latar warna penuh dengan teks gelap `#07101A` (6,2–12:1).
- **Warna tidak pernah jadi satu-satunya pembawa arti.** Selalu ada teks, ditambah ikon (Tingkat Siaga) atau meter batang (severity).
- Kuning juga dipakai untuk penanda **DATA LATIHAN**, dengan pola garis miring agar tidak tertukar dengan status Waspada.

## Tipografi

Semua huruf dibundel lokal lewat `@fontsource` (OFL-1.1, subset latin). Tidak ada unduhan dari internet.

| Peran | Huruf | Kelas | Ukuran tipikal |
|---|---|---|---|
| Teks UI | Fira Sans 400/500/600/700 | `font-sans` | 14 px (tabel, form), 16 px (paragraf) |
| Judul, label kapital, angka besar | Fira Sans Condensed 500/600/700 | `font-display`, `.panel-title`, `.label-caps`, `.num` | Label 12 px kapital + tracking .1em. Judul panel 15 px. Judul halaman 22–24 px. KPI 44–48 px. Status utama 56–72 px. |
| Data teknis | Fira Code 400/500/600 | `font-mono`, `.data`, `.chip` | 0,92 em dari teks sekitarnya |

Angka memakai `tabular-nums` agar kolom dan angka yang berubah tidak bergoyang. Judul `h1`–`h3` memakai `text-wrap: balance`.

## Jarak, radius, bayangan

- **Jarak** mengikuti skala 4 px Tailwind. Dashboard rapat: padding panel 16–20 px (`p-4 sm:p-5`), celah grid 12–16 px, sel tabel 10×12 px.
- **Lebar halaman**: maksimal 1440 px (`max-w-[1440px]`), dengan gutter 16/24/32 px.
- **Radius**: `rounded-chip` 3 px (lencana, chip), `rounded-control` 6 px (tombol, input), `rounded-panel` 8 px (panel, kartu).
- **Bayangan** hanya untuk lapisan yang melayang (dropdown, dialog): `shadow-overlay`. Panel dan kartu cukup bergaris.

## Ikon

- Sumber: Lucide (`lucide-static`, ISC), disalin sebagai SVG inline oleh `core/scripts/ikon.mjs` ke `components/icon.blade.php`. Hanya ikon yang dipakai yang ikut.
- Pemakaian: `<x-icon name="shield-check" class="size-4" />`. Stroke 1,75. Ukuran 14 px di lencana, 16 px di teks/tombol, 20 px di tombol besar.
- Ikon bersifat dekoratif (`aria-hidden`) secara bawaan. Bila ikon berdiri sendiri tanpa teks, beri `label="…"`.
- Menambah ikon: tambahkan namanya di `scripts/ikon.mjs`, lalu jalankan `node scripts/ikon.mjs`.

## Gerak

| Nama | Kelas | Durasi | Arti |
|---|---|---|---|
| denyut | `animate-denyut` (+ `--denyut` untuk warna) | 1,8 s berulang | Sesuatu hidup: Live, Core aktif |
| masuk | `animate-masuk` | 1,4 s sekali | Baris feed/event baru, dengan kilat aksen singkat |
| sorot | `animate-sorot` | 1,2 s sekali | Angka KPI yang baru berubah (`wire:key` memuat nilainya, jadi animasi diputar ulang hanya saat nilai berubah) |
| kilau | `.skeleton` | 1,6 s berulang | Memuat |
| sapu | `animate-sapu` | 9 s berulang | Sapuan radar di layar masuk (dekoratif) |

- Transisi hover 150 ms, kurva `ease-sentra` (`cubic-bezier(.2,.8,.2,1)`).
- Hanya 1–2 elemen per layar yang boleh bergerak terus-menerus.
- `prefers-reduced-motion: reduce` mematikan semua animasi dan transisi (`app.css`).

## Aksesibilitas

- Kontras teks minimal 4,5:1. Semua token teks di atas lolos AA, sebagian besar AAA.
- Fokus keyboard selalu terlihat: garis aksen 2 px, offset 2 px (`:focus-visible`).
- Warna tidak berdiri sendiri (lihat bagian Status). Grafik memakai bentuk/teks untuk anomali.
- Target sentuh di HP minimal 44 px. Tombol keputusan di Antrean Persetujuan memakai `size="lg"` (≥56 px), dengan jarak antar tombol ≥8 px.
- Status yang berubah langsung diumumkan lewat `role="status"` / `aria-live="polite"`. Kesalahan form memakai `role="alert"`.
- Tautan menu aktif memakai `aria-current="page"`. Lencana jumlah di menu punya `aria-label` ("3 menunggu").
- Tabel lebar menggulir di wadahnya sendiri. Halaman tidak pernah menggulir ke samping pada lebar 360 px.

## Komponen

### Kelas CSS (`app.css`, lapisan `components`)

| Kelas | Fungsi |
|---|---|
| `.panel`, `.panel-head`, `.panel-title` | Wadah bergaris dan kepalanya |
| `.label-caps` | Label kapital kecil (judul kolom, label KPI) |
| `.num` | Angka besar: Condensed, tabular |
| `.data` | Data teknis monospace di dalam kalimat |
| `.chip` | Chip monospace (kode aturan, teknik ATT&CK, `[EV-n]`) |
| `.link` | Tautan beraksen |
| `.tbl` | Tabel padat (header kapital kecil, hover baris) |
| `.skeleton` | Batang kerangka berkilau |
| `.latar-grid` | Grid tipis latar layar masuk |

### Komponen Blade

| Komponen | Props | Catatan |
|---|---|---|
| `<x-ui.panel>` | `title`, `subtitle`, `icon`, `headingId`, `flush`; slot `actions` | Wadah utama. `:flush="true"` untuk tabel/daftar tanpa padding. |
| `<x-ui.card>` | `tone` (aman/waspada/siaga/awas/accent), `href` | Kartu objek dalam daftar, dengan garis status di tepi kiri. |
| `<x-ui.kpi>` | `label`, `value`, `unit`, `icon`, `tone`, `href`; slot keterangan | Angka besar terbaca dari proyektor. Disorot saat nilai berubah. |
| `<x-ui.table>` | `caption`; slot `head` | Tabel `.tbl` dalam wadah gulir horizontal. |
| `<x-ui.button>` | `variant` (primary/secondary/danger/approve/ghost), `size` (sm/md/lg), `icon`, `href`, `type` | `lg` = target sentuh HP. `approve`/`danger` untuk keputusan Setujui/Tolak. |
| `<x-ui.badge>` | `tone` (neutral/accent/aman/waspada/siaga/awas/latihan), `icon` | Lencana umum. |
| `<x-alert-badge>` | `level` (AlertLevel), `size` (sm/lg) | Tingkat Siaga: ikon + teks. |
| `<x-severity-badge>` | `severity` (Severity) | Meter 4 batang + teks. |
| `<x-action-status>` | `status` (ActionStatus) | Status tindakan: ikon + teks. |
| `<x-ui.empty>` | `icon`, `title`; slot penjelasan | Keadaan kosong: menyebut apa yang akan muncul dan dari mana asalnya. |
| `<x-ui.skeleton>` | `lines` | Kerangka pemuatan. |
| `<x-icon>` | `name`, `label`, `stroke` | Ikon Lucide inline. |

Komponen bawaan Breeze (`x-primary-button`, `x-text-input`, `x-input-label`, `x-input-error`, `x-dropdown`, `x-modal`, `x-nav-link`) sudah memakai token yang sama.

### Contoh

```blade
<x-ui.panel title="Feed Live" icon="activity" :flush="true">
    <x-slot:actions><x-ui.badge tone="accent" icon="radio">Live</x-ui.badge></x-slot:actions>
    <x-ui.table caption="Event terbaru">
        <x-slot:head><tr><th>Waktu</th><th>Sumber</th><th>Severity</th></tr></x-slot:head>
        <tr><td class="data">10:42:07</td><td class="data">172.31.0.66</td><td><x-severity-badge :severity="$d->severity" /></td></tr>
    </x-ui.table>
</x-ui.panel>

<x-ui.kpi label="Insiden terbuka" :value="$terbuka" icon="siren" tone="awas" :href="route('incidents.index')">
    {{ $kritis }} kritis
</x-ui.kpi>

<x-ui.button variant="approve" size="lg" icon="check" class="w-full">Setujui</x-ui.button>
```
