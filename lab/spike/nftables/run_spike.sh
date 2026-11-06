#!/usr/bin/env bash
# Spike nftables SENTRA SHIELD: memastikan dari dalam container Docker
#   1) koneksi ke port tertutup tercatat lewat NFLOG (bahan aturan R01),
#   2) blokir IP memutus koneksi baru DAN koneksi yang sudah terbuka,
#   3) blokir terbuka sendiri saat durasinya habis.
# Pakai: bash lab/spike/nftables/run_spike.sh
# Variabel opsional: BASE_IMAGE (default ubuntu:24.04), SPIKE_SUBNET (default 172.30.250.0/24),
#                    DOCKER_BUILD_ARGS (argumen tambahan docker build).
set -uo pipefail
cd "$(dirname "$0")"

BASE_IMAGE="${BASE_IMAGE:-ubuntu:24.04}"
SUBNET="${SPIKE_SUBNET:-172.30.250.0/24}"
PREFIX="${SUBNET%.*}"
TARGET_IP="${PREFIX}.10"
ATTACKER_IP="${PREFIX}.66"
NET=sentra-spike-wan
PASS=0
FAIL=0

hasil() { # $1=nama uji, $2=0 lulus
    if [ "$2" -eq 0 ]; then echo "  [LULUS] $1"; PASS=$((PASS + 1)); else echo "  [GAGAL] $1"; FAIL=$((FAIL + 1)); fi
}

bersihkan() {
    docker rm -f sentra-spike-target sentra-spike-attacker >/dev/null 2>&1
    docker network rm "$NET" >/dev/null 2>&1
}
trap bersihkan EXIT
bersihkan

echo "== Membangun image spike (base: $BASE_IMAGE)"
docker build -q ${DOCKER_BUILD_ARGS:-} --build-arg BASE_IMAGE="$BASE_IMAGE" -f Dockerfile.target -t sentra-spike/target . >/dev/null || { echo "Build target gagal"; exit 2; }
docker build -q ${DOCKER_BUILD_ARGS:-} --build-arg BASE_IMAGE="$BASE_IMAGE" -f Dockerfile.attacker -t sentra-spike/attacker . >/dev/null || { echo "Build attacker gagal"; exit 2; }

docker network create --subnet "$SUBNET" "$NET" >/dev/null || { echo "Gagal membuat jaringan $SUBNET (bentrok? set SPIKE_SUBNET)"; exit 2; }
docker run -d --name sentra-spike-target --network "$NET" --ip "$TARGET_IP" --cap-add NET_ADMIN sentra-spike/target >/dev/null
docker run -d --name sentra-spike-attacker --network "$NET" --ip "$ATTACKER_IP" sentra-spike/attacker >/dev/null

echo "== Uji 1: log port tertutup lewat NFLOG"
docker exec sentra-spike-target nft -f /spike/sentra.nft
hasil "ruleset nftables terpasang di dalam container" $?
docker exec -d sentra-spike-target sh -c 'python3 /spike/slow_server.py'
docker exec -d sentra-spike-target sh -c 'python3 /spike/nflog_reader.py 7 > /spike/nflog.jsonl 2> /spike/nflog.err'
sleep 1
docker exec sentra-spike-attacker nmap -sS -Pn -n -p 1-200 "$TARGET_IP" >/dev/null 2>&1
sleep 1
JUMLAH=$(docker exec sentra-spike-target sh -c "grep -c '\"src_ip\": \"$ATTACKER_IP\"' /spike/nflog.jsonl" 2>/dev/null || echo 0)
echo "     paket port tertutup tercatat dari $ATTACKER_IP: $JUMLAH"
[ "${JUMLAH:-0}" -ge 15 ]
hasil "minimal 15 port tertutup tercatat (ambang R01)" $?

echo "== Uji 2: blokir memutus koneksi"
docker exec -d sentra-spike-attacker sh -c "nc $TARGET_IP 9000 > /tmp/stream.log 2>&1"
sleep 2
docker exec sentra-spike-attacker sh -c "nc -w 2 -z $TARGET_IP 9000"
hasil "sebelum blokir: penyerang bisa terhubung" $?
docker exec sentra-spike-target nft add element inet sentra blocklist4 "{ $ATTACKER_IP timeout 15s }"
sleep 1
SEBELUM=$(docker exec sentra-spike-attacker sh -c 'wc -l < /tmp/stream.log')
sleep 3
SESUDAH=$(docker exec sentra-spike-attacker sh -c 'wc -l < /tmp/stream.log')
[ "$SEBELUM" -eq "$SESUDAH" ]
hasil "koneksi yang sudah terbuka berhenti menerima data ($SEBELUM -> $SESUDAH baris)" $?
! docker exec sentra-spike-attacker sh -c "nc -w 2 -z $TARGET_IP 9000"
hasil "koneksi baru dari penyerang ditolak" $?

echo "== Uji 3: blokir terbuka sendiri saat durasi habis (tunggu 15 detik)"
sleep 12
docker exec sentra-spike-attacker sh -c "nc -w 2 -z $TARGET_IP 9000"
hasil "setelah durasi habis penyerang bisa terhubung lagi" $?

echo
echo "Hasil: $PASS lulus, $FAIL gagal"
[ "$FAIL" -eq 0 ]
