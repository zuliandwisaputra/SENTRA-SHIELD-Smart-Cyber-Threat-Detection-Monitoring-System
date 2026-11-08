# Naskah dan storyboard video demo SENTRA SHIELD, versi 2

Status: **disetujui** (suara A, naskah apa adanya). Lab direkam ulang dari nol pada 8 November 2026 pukul 19:16 WIB setelah perbaikan tampilan IP di HP, jadi semua angka di bawah ini berasal dari rekaman ulang itu. Teks narasi final (dengan angka) dihasilkan oleh `video/rekam/tts/susun-naskah.py` ke `video/src/data/naskah.json`.

Target durasi **8:30–9:00** (maksimal 10:00). Durasi akhir tiap adegan mengikuti panjang suara TTS.

## Yang berubah dari versi 1

| Masalah versi 1 | Perbaikan di versi 2 |
| --- | --- |
| Narasi berdengung, banyak suara kecil lolos | Satu suara AI pria bahasa Indonesia (TTS), konsisten dari awal sampai akhir |
| Video terasa datar | Efek suara prosedural buatan sendiri, ducking di bawah narasi, ambient sangat pelan (opsional) |
| Kurang detail untuk orang awam | Adegan analogi pos jaga, pola tiga bagian di setiap langkah demo, kartu "APA ITU?", layar terbagi PENYERANG vs PERTAHANAN, penjelasan visual skor/kampanye/Penjaga Situs/rantai audit, momen kunci diperlambat, rekap 30 detik |

Aturan yang tetap berlaku:

- Semua tampilan aplikasi adalah rekaman asli 8 November 2026 pukul 19:16 WIB (lab dari nol).
- Semua angka berasal dari rekaman itu (`video/src/data/rekaman.json`).
- Label DATA LATIHAN selalu terlihat.
- Bagian yang dipercepat diberi label "Dipercepat N×".
- Gaya visual Olive Drab / Ops Darat.
- Tanpa logo atau lambang resmi TNI AD/PUSSIBERAD.

## Suara narasi (TTS)

- **Mesin:** VoxCPM2 (OpenBMB). Lisensi Apache-2.0, boleh dipakai komersial. Mendukung bahasa Indonesia dan berjalan lokal di sesi ini (CPU, ±6–7 detik proses per detik suara). Cara pasang: `video/rekam/tts/README.md`.
- **Suara:** dibuat dengan *voice design* dari deskripsi teks dan tidak menyalin suara orang tertentu. Deskripsi yang dipakai: *"Male narrator, baritone, documentary style, steady and warm"*. Contoh yang disetujui menjadi referensi suara, lalu semua adegan dibuat dengan kloning dari referensi itu agar suaranya sama dari awal sampai akhir.
- **Contoh 20 detik** (dikirim bersama dokumen ini, dibuat oleh `video/rekam/tts/contoh.py`):

  | Varian | Durasi | Nada dasar (median, rentang p10–p90) | Transkrip Whisper |
  | --- | --- | --- | --- |
  | A | 21,9 dtk | 119 Hz (95–153 Hz), intonasi lebih hidup | Semua istilah kamus terbaca benar |
  | B | 22,9 dtk | 99 Hz (90–107 Hz), lebih berat dan datar | Semua istilah kamus terbaca benar |

  Varian ketiga dibuang karena model menambahkan kata-kata ngawur di akhir.
- **Pemeriksaan tiap potongan:** nada dasar harus di rentang pria, dan transkrip Whisper harus cocok dengan naskah. Potongan yang tidak cocok dibuat ulang.
- **Pengolahan:** high-pass 60 Hz, potong hening di awal/akhir, loudnorm −16 LUFS (puncak ≤ −1,5 dBFS). Suara sintetis tidak membawa dengung atau derau ruangan; jeda antarkalimat terukur sekitar −75 dBFS.
- **Keterangan di penutup:** "Narasi: suara sintetis (TTS)".
- Narasi lengkap baru dibuat setelah contoh dan naskah disetujui.

### Kamus pelafalan

Teks layar (subtitle) memakai ejaan asli. TTS membaca kolom "Dibaca TTS sebagai".

| Istilah | Dibaca TTS sebagai | Catatan |
| --- | --- | --- |
| SENTRA SHIELD | Sentra Syild | "shield" dibaca Inggris |
| Kodim | Ko-dim | |
| Kodam | Ko-dam | |
| MITRE ATT&CK | Maiter Atek | nama kerangka MITRE ATT&CK |
| SHA-256 | Sya dua lima enam | |
| LAPSIT | Lap-sit | Laporan Situasi |
| nftables | en ef tebels | firewall Linux |
| Modbus | Mod-bas | |
| PLC | pe el se | |
| SQL injection | es kyu el injeksyen | |
| webshell | web syel | |
| hydra | haidra | alat penebak kata sandi |
| nmap | en-map | alat pemindai port |
| Googlebot | gugel-bot | |
| agent | éjen | |
| brute force | brut fors | |
| heartbeat | hart-bit | |
| hash | hesy | |
| Attack Story | Atek Stori | |
| IP | ai pi | |
| angka desimal | dua koma empat enam, empat koma lima | ditulis sebagai kata agar tidak dibaca "titik" |

## Efek suara (SFX) dan musik

Semua dibuat prosedural (sintesis dengan kode), tanpa berkas berhak cipta.

| Bunyi | Kapan | Bentuk |
| --- | --- | --- |
| Klik mouse | Setiap tanda klik di footage | Klik pendek bertekstur |
| Teleprinter | Setiap baris terminal muncul, teks kartu "APA ITU?" mengetik | Ketukan mekanis cepat, volume rendah |
| Bip peringatan | Tingkat Siaga naik, insiden baru, agent BUTA | Dua nada naik, singkat |
| Stempel | Cap muncul (NYATA, KRITIS, SEGEL SHA-256, OFFLINE) | Hentakan rendah + desis kertas |
| Whoosh | Pergantian adegan | Desis noise disapu cepat |
| Ping radar | Intro, analogi, peta operasi, peta kampanye | Nada sinus dengan gema |
| "Putus" | Saat TERPUTUS | Nada turun + hum yang terputus |
| Sukses | 11/11 Uji Kesiapan, "Rantai utuh" | Tiga nada naik |
| Ambient (opsional) | Sepanjang video | Pad rendah sangat pelan |

**Ducking:** saat narasi berbicara, SFX turun sekitar 8 dB dan ambient sekitar 12 dB. SFX tidak pernah lebih keras dari narasi.

## Pola visual yang dipakai berulang

- **Pola tiga bagian.** Setiap langkah demo memakai tiga label bernomor di pojok kiri atas: **01 APA YANG TERJADI** → **02 APA YANG DILAKUKAN SENTRA** → **03 KENAPA PENTING**. Label aktif menyala sesuai kalimat narasi.
- **Kartu "APA ITU?"** Lower-third di kiri bawah, di atas subtitle, tampil 5–6 detik saat istilah teknis pertama kali muncul. Kartu memuat istilah dan satu kalimat penjelasan.
- **Layar terbagi.** PENYERANG (terminal asli, kiri, bingkai merah) vs PERTAHANAN (dashboard asli, kanan, bingkai hijau).
- **Subtitle.** Penuh dan sinkron dengan narasi per kata, 52 px, di bawah tengah.
- **Momen kunci diperlambat** (gambar ditahan, zoom pelan, footage 1×): Attack Story, rincian skor, persetujuan Komandan, TERPUTUS, Uji Kesiapan.

## Storyboard dan naskah

Durasi per adegan adalah perkiraan. Teks narasi ditulis dengan ejaan asli dan sekaligus menjadi subtitle. TTS membacanya setelah melewati kamus pelafalan. Angka sudah ditulis sebagai kata agar dibaca wajar.

### 01. Pembuka (≈ 0:00–0:15)

**Visual:** tanda SENTRA SHIELD tergambar, judul, tiga stempel NYATA · TERUKUR · SIAP PAKAI.

**SFX:** ping radar, tiga stempel.

**Narasi:**
> Ini SENTRA SHIELD, pusat komando deteksi dan respons ancaman siber untuk satuan. Dalam beberapa menit ke depan, kita lihat bagaimana satu serangan sungguhan dideteksi, dijelaskan, lalu dihentikan, sampai penyerang terputus.

### 02. Analogi: pos jaga markas (≈ 0:15–1:00)

**Visual:** ilustrasi animasi sederhana (ikon generik, bukan lambang resmi). Setiap unsur pos jaga muncul lalu "berubah label" menjadi bagian SENTRA:

- penjaga gerbang → **Agent**;
- posko → **Core**;
- papan siaga (Aman/Waspada/Siaga/Awas) → **Tingkat Siaga**;
- komandan memberi perintah → **persetujuan blokir**;
- buku jaga berantai → **Audit Log**.

**SFX:** ping radar di awal, klik kecil setiap pemetaan, stempel di akhir.

**Narasi:**
> Cara paling mudah memahami SENTRA: bayangkan pos jaga di sebuah markas. Di setiap gerbang ada penjaga yang mencatat siapa yang datang. Di SENTRA, penjaga itu disebut agent, program kecil yang dipasang di komputer setiap satuan. Semua laporan penjaga dikirim ke posko. Posko SENTRA disebut Core. Ia membaca laporan, mengenali pola serangan, dan menilai seberapa berbahaya. Hasilnya tampil di papan siaga, yaitu Tingkat Siaga: Aman, Waspada, Siaga, atau Awas. Kalau perlu tindakan, petugas mengusulkan, dan hanya komandan yang boleh memberi perintah. Setiap kejadian ditulis di buku jaga yang tidak bisa dihapus diam-diam, yaitu audit log.

### 03. Masalah (≈ 1:00–1:27)

**Visual:** lima kartu masalah bergantian (seperti v1), termasuk angka asli 1.020 event dan dua versi portal (pengunjung biasa vs Googlebot).

**SFX:** bip pada tiap kartu.

**Narasi:**
> Kenapa SENTRA dibutuhkan? Satuan setingkat Kodim jarang punya tim keamanan siber sendiri, sehingga catatan komputer menumpuk tanpa pernah dibaca. Alat keamanan biasa membanjiri petugas dengan ribuan peringatan mentah. Penyerang bisa menyerang beberapa satuan sekaligus, bahkan mematikan sensor lebih dulu. Dan situs resmi bisa disusupi iklan judi online yang hanya muncul di Google, sehingga pengelolanya tidak sadar.

### 04. Arsitektur dan lab (≈ 1:27–2:03)

**Visual:** diagram Agent → Core → Command (seperti v1), lalu topologi lab, lalu stempel OFFLINE.

**SFX:** whoosh, ping radar pada topologi, stempel.

**Narasi:**
> Secara teknis, SENTRA punya tiga bagian. Agent di setiap satuan membaca catatan web, login SSH, firewall, perubahan file, dan perintah ke mesin industri, lalu mengirimnya ke pusat setiap detik lewat jalur terenkripsi. Core di pusat menjalankan 13 aturan deteksi, merangkai serangan, dan memberi skor. Command adalah layar untuk operator, analis, dan komandan, termasuk di HP. Untuk demo ini kami membangun lab: dua satuan latihan, Kodim A dan Kodim B, sebuah mesin industri PLC, dan satu komputer penyerang di jaringan terpisah. Semuanya berjalan tanpa internet, di satu laptop.

### 05. Demo 1: pemindaian dan tebak kata sandi (≈ 2:03–2:45)

**Visual:** layar terbagi. Kiri PENYERANG: terminal nmap lalu hydra (asli, 1×). Kanan PERTAHANAN: Beranda Analis (asli, 1×). Momen insiden muncul diputar ulang 1× dengan penghitung asli (3,6 detik setelah nmap dimulai); Tingkat Siaga naik Aman → Siaga. Pola tiga bagian aktif.

**Kartu APA ITU?:**
- *Pemindaian port:* mengetuk semua "pintu" sebuah komputer untuk mencari yang terbuka.
- *Brute force:* menebak kata sandi berulang-ulang sampai cocok.

**SFX:** teleprinter untuk baris terminal, bip saat insiden muncul dan saat Tingkat Siaga naik.

**Narasi:**
> Demo dimulai. Semua tampilan aplikasi adalah rekaman asli dari lab. Apa yang terjadi: penyerang memindai port Kodim A dengan nmap, lalu dengan hydra mencoba 128 kombinasi nama pengguna dan kata sandi. Apa yang dilakukan SENTRA: 3,6 detik setelah pemindaian dimulai, insiden baru muncul di layar, tanpa perlu dimuat ulang. Insiden adalah satu berkas kasus yang mengumpulkan semua jejak dari penyerang yang sama. Begitu percobaan login menumpuk, Tingkat Siaga naik dari Aman ke Siaga. Kenapa ini penting: petugas tidak perlu membaca ratusan baris catatan; layar memberi tahu sendiri saat ada bahaya.

### 06. Demo 2: satu insiden, satu cerita (≈ 2:45–3:15)

**Visual:** Detail Insiden (asli, ditahan dan diperbesar pelan, momen kunci). Panel hitungan 805 + 128 = 933 event → 1 insiden. Zoom ke tahap Pengintaian → Akses Awal dan kode T1046 / T1110.001.

**Kartu APA ITU?:** *MITRE ATT&CK:* kamus internasional teknik serangan siber; setiap teknik punya kode, misalnya T1046 untuk pemindaian.

**SFX:** teleprinter saat angka menghitung, klik pada sorotan.

**Narasi:**
> Apa yang dilakukan SENTRA berikutnya: 933 catatan mentah dari penyerang ini dirangkum menjadi satu insiden. Di Detail Insiden, serangannya disusun sebagai Attack Story, tahap demi tahap, dari pengintaian sampai akses awal. Tahapnya mengikuti urutan serangan pada umumnya: mengintai, masuk, bertahan, lalu merusak. Setiap langkah diberi kode teknik dari MITRE ATT&CK. Kenapa ini penting: analis langsung melihat cerita serangannya, bukan tumpukan peringatan.

### 07. Demo 3: kampanye lintas satuan (≈ 3:15–3:39)

**Visual:** animasi peta sederhana (penyerang → Kodim A 19:16:50 → Kodim B 19:18:29, garis menyatu menjadi "Kampanye #1"). Lalu footage asli peta operasi (2 satuan sasaran) dan halaman Kampanye.

**SFX:** ping radar di peta, bip saat garis kedua muncul.

**Narasi:**
> Apa yang terjadi: dengan alamat IP yang sama, penyerang lalu memindai Kodim B. Apa yang dilakukan SENTRA: dua serangan di dua satuan itu langsung dikaitkan menjadi satu kampanye lintas satuan, dan peta operasi menunjuk keduanya. Kenapa ini penting: serangan terkoordinasi terlihat utuh dari pusat, tidak terpecah per satuan.

### 08. Demo 4: penyerang masuk lebih dalam (≈ 3:39–4:11)

**Visual:** layar terbagi. Kiri: terminal sqlmap, webshell, Modbus, judol (asli). Kanan: Detail Insiden; Attack Story terisi sampai tahap Dampak (asli, dipercepat 2–3× dengan label, melambat saat tahap baru muncul).

**Kartu APA ITU?:**
- *SQL injection:* menyelipkan perintah database lewat kolom isian situs.
- *Webshell:* pintu belakang berupa file yang ditanam di server web.
- *PLC dan Modbus:* PLC adalah komputer pengendali mesin industri; Modbus adalah bahasa perintahnya.
- *Cloaking judi online:* situs menampilkan isi berbeda, normal untuk manusia tetapi judi untuk Google.

**SFX:** teleprinter, bip setiap tahap baru, stempel "TAHAP 4: DAMPAK".

**Narasi:**
> Apa yang terjadi: penyerang menyelipkan perintah ke portal lewat SQL injection, menanam webshell, mengirim perintah tulis ke mesin PLC, lalu menyisipkan iklan judi online yang hanya tampil untuk Google. Apa yang dilakukan SENTRA: setiap langkah tertangkap dan masuk ke cerita yang sama. Webshell ketahuan karena agent mengawasi perubahan file di server, dan perintah ke PLC tertangkap oleh sensor Modbus. Attack Story naik sampai tahap Dampak. Kenapa ini penting: yang diserang bukan hanya situs web, tetapi juga mesin fisik, dan SENTRA mengawasi keduanya.

### 09. Demo 5: cara skor dihitung (≈ 4:11–4:42)

**Visual:** animasi persamaan dengan angka asli (momen kunci, perlahan):

- chip bobot 11 aturan dijumlahkan menjadi **425**;
- **+ 60** (20 × (4 tahap − 1));
- **× 1,5** (aset mesin industri);
- **× 1,3** (kampanye);
- **= 946 KRITIS**.

Lalu bukti aslinya: panel Perhitungan di aplikasi (TOTAL 946, rumus `(425 + 60) x 1.5 x 1.3 = 946`) dan baris yang sama di PDF LAPSIT halaman 2.

**SFX:** klik tiap chip, stempel KRITIS.

**Narasi:**
> Seberapa berbahaya insiden ini? SENTRA menghitung skor dengan rumus terbuka. Bobot 11 aturan yang terpicu dijumlahkan: 425. Ditambah 60 karena serangan mencapai 4 tahap. Lalu dikali 1,5 karena mengenai mesin industri, dan dikali 1,3 karena bagian dari kampanye. Hasilnya 946, Kritis. Setiap angkanya bisa ditelusuri.

### 10. Demo 6: Penjaga Situs, tiga versi halaman (≈ 4:42–5:08)

**Visual:** tiga kartu halaman berdampingan:

- pengunjung biasa: portal normal, kemiripan 100%;
- Googlebot: "SLOT GACOR…", kemiripan 7%, 8 kata judi;
- datang dari Google: idem.

Lalu footage asli tiga varian di Penjaga Situs.

**SFX:** whoosh antar kartu, bip pada versi yang ditandai.

**Narasi:**
> Bagaimana dengan judi online tadi? Penjaga Situs membuka halaman yang sama tiga kali: sebagai pengunjung biasa, sebagai Googlebot, dan sebagai pengunjung yang datang dari Google. Versi biasa tetap normal, tetapi dua versi lainnya hanya 7% mirip dan berisi 8 kata judi. SENTRA menandainya sebagai cloaking judi online. Inilah sebabnya pengelola situs sering terlambat sadar: dari browser mereka, semuanya tampak normal.

### 11. Demo 7: respons berjenjang (≈ 5:08–5:49)

**Visual:** layar terbagi, momen kunci, 1×:

- kiri PENYERANG: terminal yang membuka portal tiap 0,5 detik, baris hijau "tersambung";
- kanan PERTAHANAN: Analis mengusulkan (desktop), lalu HP Komandan;
- klik Setujui → penghitung detik asli → **TERPUTUS** (gambar ditahan 2 detik, zoom ke baris merah);
- tiga kartu: Analis 19:20:13 → Komandan 19:20:27 → Agent 19:20:30.

**Kartu APA ITU?:** *nftables:* firewall bawaan Linux tempat agent memasang aturan blokir.

**SFX:** klik saat Usulkan dan Setujui, bip saat usulan masuk HP, bunyi "putus" tepat di TERPUTUS.

**Narasi:**
> Saatnya bertindak. Apa yang terjadi: analis mengusulkan blokir IP penyerang selama satu jam. Usulan masuk ke HP Komandan. Selama belum disetujui, penyerang masih bisa membuka portal. Apa yang dilakukan SENTRA: Komandan menyetujui. Perintah dikirim ke agent, dan agent memblokir penyerang di firewall nftables. 3,19 detik setelah tombol Setujui ditekan, koneksi penyerang terputus. Perintah ke agent hanya boleh dari daftar tetap, yaitu blokir, buka blokir, dan uji, sehingga tidak bisa disalahgunakan. Kenapa ini penting: yang mengusulkan tidak bisa menyetujui sendiri. Keputusan tetap di tangan komandan, sesuai rantai komando.

### 12. Demo 8: LAPSIT (≈ 5:49–6:10)

**Visual:** klik Buat LAPSIT, kutipan [EV-n], Unduh PDF, kaki halaman dengan SHA-256 (asli), stempel SEGEL SHA-256.

**Kartu APA ITU?:** *Hash SHA-256:* sidik jari digital sebuah berkas; berubah satu huruf saja, sidik jarinya berubah total.

**SFX:** klik, teleprinter, stempel.

**Narasi:**
> Setelah itu, analis membuat Laporan Situasi, atau LAPSIT, dengan satu klik. Laporan selesai dalam kurang dari satu detik. Laporan ini disusun dari data insiden, bukan dikarang, dan setiap temuan mengutip nomor bukti aslinya. PDF-nya disegel dengan sidik jari SHA-256, sehingga perubahan sekecil apa pun akan ketahuan.

### 13. Demo 9: Sensor Buta (≈ 6:10–6:34)

**Visual:** penghitung dimulai dari heartbeat terakhir yang dicatat Core (19:21:19 WIB); sensor dimatikan 19:21:27, BUTA 19:21:50, jadi 31 detik tanpa sinyal (footage dipercepat dengan label), kartu agent "1 agent BUTA", insiden Sensor Buta.

**Kartu APA ITU?:** *Heartbeat:* sinyal "saya masih hidup" yang dikirim agent secara rutin.

**SFX:** detak pelan yang berhenti, bip peringatan saat BUTA.

**Narasi:**
> Apa yang terjadi kalau penyerang mematikan sensor? Setiap agent mengirim sinyal hidup, atau heartbeat, secara berkala. Begitu sinyal dari Kodim B hilang lebih dari 30 detik, SENTRA menandai agent itu buta dan membuka insiden Sensor Buta. Di rekaman ini, tanda buta muncul 31 detik setelah sinyal terakhir. Ini penting, karena penyerang yang cerdas biasanya membutakan penjaga lebih dulu.

### 14. Demo 10: Uji Kesiapan (≈ 6:34–6:55)

**Visual:** klik Jalankan, matriks terisi (dipercepat dengan label), lalu ditahan pada dial 11/11 dan rata-rata 4,5 detik (momen kunci).

**SFX:** klik, bunyi sukses saat 11/11.

**Narasi:**
> Bagaimana kita tahu SENTRA benar-benar bekerja? Lewat Uji Kesiapan, SENTRA menjalankan 11 serangan tiruan yang aman ke komputernya sendiri. Serangan tiruan ini diberi tanda khusus, sehingga dihitung sebagai uji, bukan insiden. Hasilnya, 11 dari 11 terdeteksi, rata-rata 4,5 detik, dan tidak satu pun menjadi insiden palsu.

### 15. Demo 11: buku jaga berantai (≈ 6:55–7:19)

**Visual:** animasi rantai sidik jari: blok catatan 18 → 19 → 20 → 21, setiap blok memuat sidik jari blok sebelumnya. Satu blok diubah → sidik jarinya berubah → rantai putus (merah). Lalu footage asli klik Verifikasi Rantai → "Rantai utuh, 21 baris diperiksa".

**SFX:** klik antar blok, bunyi retak saat rantai putus (animasi), bunyi sukses saat "Rantai utuh".

**Narasi:**
> Terakhir, buku jaganya. Setiap catatan audit menyimpan sidik jari catatan sebelumnya, sehingga membentuk rantai. Kalau satu catatan diubah atau dihapus langsung di database, rantainya putus dan langsung ketahuan. Satu klik Verifikasi Rantai: 21 catatan diperiksa, rantai utuh.

### 16. Hak akses (≈ 7:19–7:31)

**Visual:** empat kartu peran, lalu Beranda Operator Kodim A (2/2 agent) vs Analis Kodam (3/3), asli.

**Narasi:**
> Hak akses mengikuti peran dan satuan. Operator Kodim A hanya melihat satuannya sendiri, 2 agent. Analis di pusat melihat semuanya, 3 agent. Dengan begitu, setiap orang hanya melihat dan melakukan apa yang menjadi tugasnya.

### 17. Angka dan kelayakan (≈ 7:31–7:47)

**Visual:** tabel angka asli (seperti v1) dan empat kartu kelayakan.

**Narasi:**
> Semua angka di video ini diukur dari rekaman lab yang sama. Dan SENTRA siap dipasang: satu klik untuk menyalakan, berjalan tanpa internet, cukup di mini-PC, dan agent dipasang dengan satu skrip.

### 18. Rekap 30 detik (≈ 7:47–8:17)

**Visual:** garis waktu dengan jam asli:

- 19:16:50 pemindaian;
- 19:16:53 insiden tampil (+3,6 detik);
- 19:16:57 tebak kata sandi;
- 19:18:29 Kodim B / kampanye;
- 19:19:04–19:19:24 SQL injection, webshell, PLC, judi;
- 19:19:47 skor 946;
- 19:20:13 usul;
- 19:20:27 setuju;
- 19:20:30 terputus (+3,19 detik);
- LAPSIT, Sensor Buta, Uji Kesiapan, rantai utuh.

**SFX:** ping radar, whoosh.

**Narasi:**
> Sekali lagi, alurnya. Penyerang memindai dan menebak kata sandi; SENTRA membuka insiden dalam hitungan detik. Serangan melebar ke satuan lain dan ke mesin industri; semuanya terangkai dalam satu cerita dengan skor yang terbuka. Analis mengusulkan, Komandan menyetujui dari HP, dan 3,19 detik kemudian penyerang terputus. Semuanya tercatat di buku jaga yang tidak bisa diubah.

### 19. Penutup (≈ 8:17–8:30)

**Visual:** peta jalan singkat, lalu tanda SENTRA SHIELD, stempel NYATA · TERUKUR · SIAP PAKAI, "Zulian Dwi Saputra · Tim Claudex404", link repo, "Narasi: suara sintetis (TTS)".

**SFX:** tiga stempel, ping radar akhir.

**Narasi:**
> Langkah berikutnya: uji coba di satuan nyata dan menambah protokol mesin industri lain. SENTRA SHIELD: nyata, terukur, siap pakai. Terima kasih.

## Catatan produksi

Hal-hal yang disesuaikan saat membuat video final, tanpa mengubah isi yang disetujui:

- **Angka mengikuti rekaman ulang.** Contoh: insiden tampil 3,6 detik setelah nmap dimulai (diukur dari frame video), dan penyerang terputus 3,19 detik setelah Setujui (diukur dari jam di terminal penyerang). Angka lain tetap sama: 128 percobaan, 933 catatan, skor 946, 7% / 8 kata judi, 11/11, rata-rata 4,5 detik, dan 21 catatan.
- **Sensor Buta.** Heartbeat dikirim tiap 10 detik, dan ambang BUTA adalah 30 detik sejak heartbeat *terakhir*. Di rekaman ulang, tanda BUTA tampil 23 detik setelah sensor dimatikan karena heartbeat terakhir sudah terkirim sekitar 9 detik sebelum sensor dimatikan. Supaya tidak membingungkan, kalimatnya menjadi "tanda buta muncul 31 detik setelah sinyal terakhir" (heartbeat terakhir 19:21:19, BUTA 19:21:50, dari audit log Core).
- **Subtitle memakai angka** ("3,19 detik"), sedangkan TTS mengucapkannya sebagai kata ("tiga koma satu sembilan detik") lewat kamus pelafalan.
- **Skor 946.** Tangkapan layar rincian skor di Detail Insiden diambil saat skor masih 858 (sebelum Penjaga Situs menambah deteksi judi). Karena itu bukti 946 diambil dari panel Perhitungan yang terlihat di halaman LAPSIT dan dari PDF LAPSIT.
- **Hak akses** memakai tangkapan layar asli Beranda kedua akun. Footage-nya sudah berpindah ke halaman Insiden saat kalimat itu diucapkan.
- **Bagian "kalau catatan diubah"** di adegan 15 adalah ilustrasi dan diberi label ILUSTRASI. Hash yang tampil adalah hash asli catatan audit 18–21 dari lab.

## Catatan durasi

Naskah berisi sekitar 1.100 kata. Pada tempo narasi 140–150 kata per menit, suaranya sekitar 7:20–7:50. Ditambah jeda visual, kartu "APA ITU?", dan momen kunci yang diperlambat (±50 detik), total video sekitar **8:15–8:45**. Perkiraan per adegan tercantum di setiap judul. Durasi akhir mengikuti panjang suara TTS.

Bila hasilnya lebih dari 9 menit, urutan pemangkasannya:

1. persingkat adegan 03 Masalah dan 17 Angka;
2. gabungkan 16 Hak akses ke 17.

Momen kunci tidak dipangkas.
