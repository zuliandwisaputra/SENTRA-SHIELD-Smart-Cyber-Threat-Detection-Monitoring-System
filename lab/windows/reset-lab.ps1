# Menghapus SELURUH data lab (database, insiden, token agent) lalu memulai dari nol.
# Pakai sebelum latihan demo agar dashboard bersih.
. (Join-Path $PSScriptRoot '_umum.ps1')

Tulis-Judul 'SENTRA SHIELD - Reset lab (hapus semua data)'
if (-not (Pastikan-Docker)) { Selesai 1 }
Tulis-Info 'Semua event, insiden, dan riwayat di lab akan DIHAPUS. Image tidak dihapus.'
$jawab = Read-Host '  Ketik RESET lalu Enter untuk melanjutkan (selain itu batal)'
if ($jawab -ne 'RESET') {
    Tulis-Info 'Dibatalkan. Tidak ada yang dihapus.'
    Selesai 0
}
Compose down -v
if ($LASTEXITCODE -ne 0) { Tulis-Gagal 'Reset gagal. Baca pesan di atas.'; Selesai 1 }
Tulis-Ok 'Data lab dihapus. Menyalakan ulang dari nol...'
& (Join-Path $PSScriptRoot 'mulai-lab.ps1')
