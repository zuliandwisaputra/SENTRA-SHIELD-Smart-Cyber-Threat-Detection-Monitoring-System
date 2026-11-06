# Fungsi bersama skrip Windows SENTRA SHIELD (Windows PowerShell 5.1).
# File ini dipanggil oleh skrip lain; jangan dijalankan langsung.

$ErrorActionPreference = 'Continue'
try { [Console]::OutputEncoding = [System.Text.Encoding]::UTF8 } catch { }

$Global:SentraRoot = (Resolve-Path (Join-Path $PSScriptRoot '..\..')).Path
$Global:SentraCompose = Join-Path $SentraRoot 'lab\docker-compose.yml'

function Tulis-Judul([string]$Teks) {
    Write-Host ''
    Write-Host ('=' * 70) -ForegroundColor DarkGreen
    Write-Host ('  ' + $Teks) -ForegroundColor Green
    Write-Host ('=' * 70) -ForegroundColor DarkGreen
}

function Tulis-Info([string]$Teks) { Write-Host ('  ' + $Teks) }
function Tulis-Ok([string]$Teks) { Write-Host ('  [OK] ' + $Teks) -ForegroundColor Green }
function Tulis-Gagal([string]$Teks) { Write-Host ('  [GAGAL] ' + $Teks) -ForegroundColor Red }
function Tulis-Saran([string]$Teks) { Write-Host ('  Saran: ' + $Teks) -ForegroundColor Yellow }

function Tunggu-Enter([string]$Pesan = 'Tekan Enter untuk lanjut') {
    Write-Host ''
    [void](Read-Host ('  >> ' + $Pesan))
}

# Pastikan Docker terpasang dan mesinnya menyala. Bila Docker Desktop belum
# dibuka, skrip mencoba membukanya lalu menunggu sampai 3 menit.
function Pastikan-Docker {
    if (-not (Get-Command docker -ErrorAction SilentlyContinue)) {
        Tulis-Gagal 'Perintah docker tidak ditemukan. Docker Desktop belum terpasang.'
        Tulis-Saran 'Ikuti docs\panduan-pemula-windows.md bagian "Memasang Docker Desktop".'
        return $false
    }
    docker info *> $null
    if ($LASTEXITCODE -eq 0) { return $true }

    $exe = Join-Path $env:ProgramFiles 'Docker\Docker\Docker Desktop.exe'
    if (Test-Path $exe) {
        Tulis-Info 'Docker Desktop belum menyala. Membuka Docker Desktop...'
        Start-Process $exe
    }
    Tulis-Info 'Menunggu mesin Docker siap (maks 3 menit)...'
    for ($i = 0; $i -lt 90; $i++) {
        Start-Sleep -Seconds 2
        docker info *> $null
        if ($LASTEXITCODE -eq 0) { Tulis-Ok 'Docker siap.'; return $true }
    }
    Tulis-Gagal 'Docker tidak kunjung siap.'
    Tulis-Saran 'Buka Docker Desktop, tunggu tulisan "Engine running", lalu jalankan skrip ini lagi.'
    return $false
}

# Jalankan docker compose untuk lab. Argumen diteruskan apa adanya.
function Compose {
    docker compose -f $SentraCompose @args
}

function Lab-Menyala {
    $id = docker compose -f $SentraCompose ps -q sentra-core 2>$null
    return -not [string]::IsNullOrWhiteSpace($id)
}

function Selesai([int]$Kode = 0) {
    Write-Host ''
    exit $Kode
}
