# Menyalakan seluruh lab SENTRA SHIELD (build image bila perlu), menunggu
# 3 agent online, lalu membuka dashboard di browser.
. (Join-Path $PSScriptRoot '_umum.ps1')

Tulis-Judul 'SENTRA SHIELD - Menyalakan lab'
if (-not (Pastikan-Docker)) { Selesai 1 }

Tulis-Info 'Menyalakan container. Pertama kali bisa 5-15 menit (mengunduh dan membangun image).'
Tulis-Info 'Berikutnya hanya sekitar 30 detik. Jangan tutup jendela ini.'
$mulai = Get-Date
Compose up -d --build
if ($LASTEXITCODE -ne 0) {
    Tulis-Gagal 'docker compose up gagal. Baca pesan error di atas.'
    Tulis-Saran 'Lihat docs\panduan-pemula-windows.md bagian "Mengatasi error". Error internet: jalankan skrip ini lagi.'
    Selesai 1
}

Tulis-Info 'Menunggu 3 agent mendaftar dan online...'
Compose exec -T sentra-core php artisan sentra:status --tunggu-agent=3 --batas=180
$ok = ($LASTEXITCODE -eq 0)
$durasi = [int]((Get-Date) - $mulai).TotalSeconds

if ($ok) {
    Tulis-Ok ("Lab siap dalam $durasi detik.")
    Tulis-Info 'Dashboard: https://localhost:8443  (akun: admin@sentra.lab / Latihan#2026)'
    Tulis-Info 'Browser akan memberi peringatan sertifikat: klik "Advanced" lalu "Continue/Lanjutkan".'
    Start-Process 'https://localhost:8443'
    Selesai 0
}
Tulis-Gagal 'Agent belum online semua.'
Tulis-Saran 'Tunggu 1 menit lalu jalankan cek-lab.bat. Bila tetap gagal, kirim hasil cek-lab ke pengembang.'
Selesai 1
