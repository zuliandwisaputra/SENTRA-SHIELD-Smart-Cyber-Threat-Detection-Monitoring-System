#!/usr/bin/env bash
# Rekam footage ASLI untuk video demo, dari lab yang di-reset ke nol.
#
# Prasyarat (Linux/WSL): Docker + lab SENTRA (image sudah dibangun), Node.js, Playwright + Chromium,
# ffmpeg/ffprobe, pdftoppm (poppler-utils).
#
#   SENTRA_DC="docker compose -f ../lab/docker-compose.yml" ./rekam/rekam.sh
#
# Dijalankan dari folder video/. Lab dihapus total (termasuk volume database) lalu dinyalakan ulang.
set -euo pipefail
cd "$(dirname "$0")/.."
DC="${SENTRA_DC:-docker compose -f $(cd ../lab && pwd)/docker-compose.yml}"
export SENTRA_DC="$DC"

echo "== $(date +%T) Reset lab dari nol (down -v, up)"
$DC --profile llm down -v --remove-orphans >/dev/null 2>&1 || true
$DC up -d --no-build >/dev/null 2>&1
$DC exec -T sentra-core php artisan sentra:status --tunggu-agent=3 --batas=240
echo "== $(date +%T) Jeda 20 detik agar baseline (heartbeat, Penjaga Situs) terisi"
sleep 20

echo "== $(date +%T) Merekam"
rm -rf public/rekaman/stills
node rekam/rekam.cjs

echo "== $(date +%T) Pasca-proses"
if [ -f public/rekaman/lapsit.pdf ] && command -v pdftoppm >/dev/null; then
  pdftoppm -png -r 120 -f 1 -l 2 public/rekaman/lapsit.pdf public/rekaman/stills/lapsit-pdf
fi
for f in public/rekaman/*.webm; do
  echo "$f: $(ffprobe -v error -show_entries format=duration,size -of csv=p=0 "$f")"
done
$DC exec -T sentra-core php artisan sentra:status || true
echo "== $(date +%T) Selesai. Data: src/data/rekaman.json"
