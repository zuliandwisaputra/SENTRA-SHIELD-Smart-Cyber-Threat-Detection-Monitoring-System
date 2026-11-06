#!/usr/bin/env bash
# Periksa lab SENTRA SHIELD: tunggu semua agent online lalu tampilkan status
# agent dan jumlah event per sumber (semuanya data asli dari database Core).
#   bash lab/cek-lab.sh
set -uo pipefail
cd "$(dirname "$0")"
DC=(docker compose ${SENTRA_ENV_FILE:+--env-file "$SENTRA_ENV_FILE"})

echo "Menunggu 3 agent online (maks 2 menit)..."
for i in $(seq 1 60); do
    N=$("${DC[@]}" exec -T sentra-core php artisan tinker --execute 'echo App\Models\Agent::where("status","online")->count();' 2>/dev/null | tail -1)
    [ "$N" = "3" ] && break
    sleep 2
done

"${DC[@]}" exec -T sentra-core php artisan tinker --execute '
echo "\nAGENT\n";
foreach (App\Models\Agent::with("unit")->orderBy("hostname")->get() as $a) {
    $src = collect($a->sources)->reject(fn ($s) => $s["status"] === "disabled")->map(fn ($s) => $s["status"])->all();
    printf("  %-8s %-8s %-12s heartbeat %s  sumber %s\n", $a->hostname, $a->status->value, $a->unit->code,
        $a->last_heartbeat_at?->diffForHumans() ?? "-", json_encode($src));
}
echo "\nEVENT PER SUMBER\n";
foreach (App\Models\SecurityEvent::selectRaw("source, count(*) n, max(created_at) terakhir")->groupBy("source")->get() as $r) {
    printf("  %-9s %6d event, terakhir %s\n", $r->source->value, $r->n, waktu_wib(Illuminate\Support\Carbon::parse($r->terakhir)));
}
echo "\nTINDAKAN\n";
foreach (App\Models\ResponseAction::latest("id")->limit(5)->get() as $x) {
    printf("  #%d %s %s -> %s\n", $x->id, $x->type->value, $x->params["ip"] ?? "", $x->status->value);
}' 2>/dev/null

[ "${N:-0}" = "3" ] && echo -e "\nLULUS: 3 agent online." || { echo -e "\nGAGAL: agent online = ${N:-0}. Lihat: docker compose -f lab/docker-compose.yml logs kodim-a"; exit 1; }
