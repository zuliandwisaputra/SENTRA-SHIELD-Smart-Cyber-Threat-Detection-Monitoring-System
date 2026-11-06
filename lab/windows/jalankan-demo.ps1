# Menjalankan seluruh skenario demo berurutan (naskah video PRD bagian 12).
# Setiap langkah berhenti menunggu Enter agar ada waktu menjelaskan di dashboard.
# Beberapa tampilan dashboard baru muncul setelah fase terkait selesai dikerjakan.
. (Join-Path $PSScriptRoot '_umum.ps1')

$KodimA = '172.30.0.11'
$KodimB = '172.30.0.12'
$Plc = '172.30.0.20'

function Serang([string]$Judul, [string[]]$Perintah) {
    Tulis-Info ('Menjalankan: ' + $Judul)
    Compose exec -T attacker @Perintah
}

Tulis-Judul 'SENTRA SHIELD - Demo lengkap'
if (-not (Pastikan-Docker)) { Selesai 1 }
if (-not (Lab-Menyala)) {
    Tulis-Gagal 'Lab belum menyala. Jalankan mulai-lab.bat terlebih dahulu.'
    Selesai 1
}
Compose exec -T sentra-core php artisan sentra:status --tunggu-agent=3 --batas=60
if ($LASTEXITCODE -ne 0) {
    Tulis-Gagal 'Belum semua agent online. Demo dihentikan.'
    Tulis-Saran 'Tunggu 1 menit lalu jalankan cek-lab.bat.'
    Selesai 1
}
Tulis-Info 'Saran: jalankan reset-lab.bat sebelum latihan agar dashboard bersih.'
Tulis-Info 'Buka https://localhost:8443 di browser dan login sebagai analis@sentra.lab.'
Start-Process 'https://localhost:8443'
Tunggu-Enter 'Siap? Tekan Enter untuk memulai serangan'

# 1:00 Serangan ke Kodim A
Tulis-Judul '1. Serangan ke Kodim A: pemindaian port lalu brute force SSH'
Tulis-Info "Penyerang 172.30.0.66 berada di mesin dan jaringan terpisah dari target $KodimA."
Serang 'nmap (pemindaian port)' @('./skenario/01-pindai.sh', $KodimA)
Serang 'hydra (brute force SSH, sekitar 1 menit)' @('./skenario/02-bruteforce-ssh.sh', $KodimA)
Tulis-Info 'Lihat dashboard: muncul SATU insiden untuk IP 172.30.0.66 di Kodim Latihan A,'
Tulis-Info 'tahap Pengintaian lalu Akses Awal, dan skor naik ke Tinggi.'
Tunggu-Enter

# 1:50 Serangan ke Kodim B
Tulis-Judul '2. IP yang sama memindai Kodim B (serangan terkoordinasi)'
Serang 'nmap ke Kodim B' @('./skenario/01-pindai.sh', $KodimB)
Tulis-Info 'Lihat dashboard: insiden di Kodim Latihan B dari IP yang sama -> Kampanye lintas satuan.'
Tunggu-Enter

# 2:20 Eksploitasi dan OT
Tulis-Judul '3. Eksploitasi portal dan serangan OT'
Serang 'sqlmap (SQL injection ke portal)' @('./skenario/03-sqlmap.sh', $KodimA)
Serang 'unggah webshell (tertangkap FIM)' @('./skenario/05-webshell.sh', $KodimA)
Serang 'perintah tulis Modbus ke PLC' @('python3', 'skenario/04-modbus-tulis.py', $Plc)
Tulis-Info 'Lihat Detail Insiden: tahap Eksekusi/Persistensi dan Dampak muncul, skor menjadi Kritis.'
Tunggu-Enter

# 3:00 Respons
Tulis-Judul '4. Respons berjenjang: Operator mengusulkan, Komandan menyetujui'
Tulis-Info '1) Login sebagai operator.a@sentra.lab, buka insiden, klik Usulkan Tindakan (blokir IP).'
Tulis-Info '2) Login sebagai komandan@sentra.lab (bisa dari HP), buka Antrean Persetujuan, klik Setujui.'
Tunggu-Enter 'Setelah Komandan menyetujui, tekan Enter untuk menguji koneksi penyerang'
$kode = ('' + (Compose exec -T attacker curl -s -m 4 -o /dev/null -w '%{http_code}' "http://$KodimA/")).Trim()
if ($kode -eq '200') {
    Tulis-Gagal "Penyerang masih bisa membuka portal Kodim A (HTTP $kode). Blokir belum aktif."
    Tulis-Saran 'Pastikan tindakan berstatus Dieksekusi di dashboard, lalu ulangi langkah ini.'
} else {
    Tulis-Ok "Koneksi penyerang ke Kodim A TERPUTUS (kode $kode). Blokir nftables bekerja."
}
Tunggu-Enter

# 3:40 Sensor Buta
Tulis-Judul '5. Penyerang mematikan sensor di Kodim B (Sensor Buta)'
Compose exec -T kodim-b supervisorctl stop sentra-agent
Tulis-Info 'Agent Kodim B dimatikan. Menunggu 40 detik (batas heartbeat 30 detik)...'
for ($i = 40; $i -gt 0; $i -= 5) { Write-Host ("    sisa $i detik") ; Start-Sleep -Seconds 5 }
Tulis-Info 'Lihat dashboard: agent Kodim B berstatus BUTA dan insiden Sensor Buta (Tinggi) muncul.'
Tunggu-Enter 'Tekan Enter untuk menghidupkan kembali agent Kodim B'
Compose exec -T kodim-b supervisorctl start sentra-agent
Tulis-Ok 'Agent Kodim B hidup kembali (tercatat di garis waktu insiden).'
Tunggu-Enter

# 4:10 Uji Kesiapan
Tulis-Judul '6. Uji Kesiapan'
Tulis-Info 'Login sebagai analis, buka menu Uji Kesiapan, klik Jalankan.'
Tulis-Info 'Matriks skenario terisi; angka cakupan dan rata-rata waktu deteksi tampil.'
Tunggu-Enter

Tulis-Judul 'Demo selesai'
Compose exec -T sentra-core php artisan sentra:status
Tulis-Info 'Untuk mengulang dari awal: reset-lab.bat'
Selesai 0
