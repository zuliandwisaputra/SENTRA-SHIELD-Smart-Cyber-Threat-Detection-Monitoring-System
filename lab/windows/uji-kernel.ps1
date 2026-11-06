# Uji kernel Docker di laptop ini (spike nftables, sama dengan run_spike.sh):
#   1) koneksi ke port tertutup tercatat lewat NFLOG,
#   2) blokir IP memutus koneksi baru dan yang sudah terbuka,
#   3) blokir terbuka sendiri saat durasi habis.
# Hasil disimpan di lab\windows\log\hasil-uji-kernel.txt untuk dikirim ke pengembang.
. (Join-Path $PSScriptRoot '_umum.ps1')

$logDir = Join-Path $PSScriptRoot 'log'
New-Item -ItemType Directory -Force -Path $logDir | Out-Null
$logFile = Join-Path $logDir 'hasil-uji-kernel.txt'
Start-Transcript -Path $logFile -Force | Out-Null

$dir = Join-Path $SentraRoot 'lab\spike\nftables'
$net = 'sentra-spike-wan'
$subnet = '172.30.250.0/24'
$target = '172.30.250.10'
$penyerang = '172.30.250.66'
$script:lulus = 0
$script:gagal = 0

function Hasil([string]$Nama, [bool]$Ok) {
    if ($Ok) { Tulis-Ok $Nama; $script:lulus++ } else { Tulis-Gagal $Nama; $script:gagal++ }
}
function Bersihkan {
    docker rm -f sentra-spike-target sentra-spike-attacker *> $null
    docker network rm $net *> $null
}
function Angka($Keluaran) {
    $n = 0
    [void][int]::TryParse((($Keluaran | Select-Object -First 1) -as [string]), [ref]$n)
    return $n
}

Tulis-Judul 'SENTRA SHIELD - Uji kernel Docker (nftables)'
if (-not (Pastikan-Docker)) { Stop-Transcript | Out-Null; Selesai 1 }
docker version --format 'Docker {{.Server.Version}} / kernel {{.Server.KernelVersion}}'
Bersihkan

Tulis-Info 'Membangun image uji (pertama kali beberapa menit)...'
docker build -q -f (Join-Path $dir 'Dockerfile.target') -t sentra-spike/target $dir | Out-Null
$okT = ($LASTEXITCODE -eq 0)
docker build -q -f (Join-Path $dir 'Dockerfile.attacker') -t sentra-spike/attacker $dir | Out-Null
if (-not ($okT -and $LASTEXITCODE -eq 0)) {
    Tulis-Gagal 'Build image uji gagal. Periksa koneksi internet lalu ulangi.'
    Stop-Transcript | Out-Null; Selesai 2
}
docker network create --subnet $subnet $net | Out-Null
docker run -d --name sentra-spike-target --network $net --ip $target --cap-add NET_ADMIN sentra-spike/target | Out-Null
docker run -d --name sentra-spike-attacker --network $net --ip $penyerang sentra-spike/attacker | Out-Null

Tulis-Info 'Uji 1: log port tertutup lewat NFLOG'
docker exec sentra-spike-target nft -f /spike/sentra.nft
Hasil 'ruleset nftables terpasang di dalam container' ($LASTEXITCODE -eq 0)
docker exec -d sentra-spike-target sh -c 'python3 /spike/slow_server.py'
docker exec -d sentra-spike-target sh -c 'python3 /spike/nflog_reader.py 7 > /spike/nflog.jsonl 2> /spike/nflog.err'
Start-Sleep -Seconds 1
docker exec sentra-spike-attacker nmap -sS -Pn -n -p 1-200 $target | Out-Null
Start-Sleep -Seconds 1
$jumlah = Angka (docker exec sentra-spike-target grep -c $penyerang /spike/nflog.jsonl)
Tulis-Info "   paket port tertutup tercatat dari ${penyerang}: $jumlah"
Hasil 'minimal 15 port tertutup tercatat (ambang R01)' ($jumlah -ge 15)
if ($jumlah -lt 15) { docker exec sentra-spike-target cat /spike/nflog.err }

Tulis-Info 'Uji 2: blokir memutus koneksi'
docker exec -d sentra-spike-attacker sh -c "nc $target 9000 > /tmp/stream.log 2>&1"
Start-Sleep -Seconds 2
docker exec sentra-spike-attacker nc -w 2 -z $target 9000 *> $null
Hasil 'sebelum blokir: penyerang bisa terhubung' ($LASTEXITCODE -eq 0)
docker exec sentra-spike-target nft add element inet sentra blocklist4 "{ $penyerang timeout 15s }"
Start-Sleep -Seconds 1
$sebelum = Angka (docker exec sentra-spike-attacker sh -c 'wc -l < /tmp/stream.log')
Start-Sleep -Seconds 3
$sesudah = Angka (docker exec sentra-spike-attacker sh -c 'wc -l < /tmp/stream.log')
Hasil "koneksi yang sudah terbuka berhenti menerima data ($sebelum -> $sesudah baris)" ($sebelum -gt 0 -and $sebelum -eq $sesudah)
docker exec sentra-spike-attacker nc -w 2 -z $target 9000 *> $null
Hasil 'koneksi baru dari penyerang ditolak' ($LASTEXITCODE -ne 0)

Tulis-Info 'Uji 3: blokir terbuka sendiri saat durasi habis (tunggu 15 detik)'
Start-Sleep -Seconds 12
docker exec sentra-spike-attacker nc -w 2 -z $target 9000 *> $null
Hasil 'setelah durasi habis penyerang bisa terhubung lagi' ($LASTEXITCODE -eq 0)

Bersihkan
Write-Host ''
Write-Host ("  Hasil: $script:lulus lulus, $script:gagal gagal") -ForegroundColor Cyan
Tulis-Info "Kirim file ini ke pengembang: $logFile"
Stop-Transcript | Out-Null
if ($script:gagal -eq 0) { Selesai 0 } else { Selesai 1 }
