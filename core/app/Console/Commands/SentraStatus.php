<?php

namespace App\Console\Commands;

use App\Enums\AgentStatus;
use App\Models\Agent;
use App\Models\Incident;
use App\Models\ResponseAction;
use App\Models\SecurityEvent;
use Illuminate\Console\Command;

/**
 * Ringkasan status lab untuk skrip cek-lab (Windows maupun Linux).
 * Semua angka diambil langsung dari database; tidak ada yang dihitung ulang
 * atau dikarang. Keluaran sengaja ASCII agar terbaca di konsol Windows.
 */
class SentraStatus extends Command
{
    protected $signature = 'sentra:status
        {--tunggu-agent=0 : Tunggu sampai sejumlah agent online}
        {--batas=120 : Batas waktu menunggu, dalam detik}';

    protected $description = 'Tampilkan status agent, event, insiden, dan tindakan (untuk cek lab)';

    public function handle(): int
    {
        $target = (int) $this->option('tunggu-agent');
        $deadline = time() + (int) $this->option('batas');
        while ($target > 0 && $this->onlineCount() < $target && time() < $deadline) {
            sleep(2);
        }

        $this->line('SENTRA SHIELD - status lab ('.waktu_wib(now()).')');

        $this->line('');
        $this->line('AGENT');
        $agents = Agent::with('unit')->orderBy('hostname')->get();
        if ($agents->isEmpty()) {
            $this->line('  (belum ada agent)');
        }
        foreach ($agents as $agent) {
            $sources = collect($agent->sources ?? [])
                ->reject(fn ($s) => ($s['status'] ?? '') === 'disabled')
                ->map(fn ($s, $name) => $name.'='.($s['status'] ?? '?'))
                ->implode(' ');
            $this->line(sprintf(
                '  %-9s %-9s %-16s heartbeat %-18s %s',
                $agent->hostname,
                strtoupper($agent->status->value),
                $agent->unit->name,
                $agent->last_heartbeat_at?->diffForHumans() ?? '-',
                $sources,
            ));
        }

        $this->line('');
        $this->line('EVENT PER SUMBER (data asli dari agent)');
        $rows = SecurityEvent::query()->selectRaw('source, count(*) as n, max(created_at) as terakhir')->groupBy('source')->get();
        if ($rows->isEmpty()) {
            $this->line('  (belum ada event)');
        }
        foreach ($rows as $row) {
            $this->line(sprintf('  %-9s %7d event, terakhir %s', $row->source->value, $row->n, waktu_wib(now()->parse($row->terakhir), 'H:i:s')));
        }

        $this->line('');
        $this->line('INSIDEN TERBUKA');
        $incidents = Incident::query()->open()->with('unit')->orderByDesc('score')->limit(10)->get();
        if ($incidents->isEmpty()) {
            $this->line('  (tidak ada)');
        }
        foreach ($incidents as $incident) {
            $this->line(sprintf('  #%-4d %-7s skor %-4d %s', $incident->id, $incident->severity->label(), $incident->score, $incident->title));
        }

        $this->line('');
        $this->line('TINDAKAN TERAKHIR');
        $actions = ResponseAction::query()->with('targetAgent')->latest('id')->limit(5)->get();
        if ($actions->isEmpty()) {
            $this->line('  (belum ada)');
        }
        foreach ($actions as $action) {
            $this->line(sprintf('  #%-4d %-10s %-15s di %-8s %s', $action->id, $action->type->value, $action->params['ip'] ?? '-', $action->targetAgent?->hostname ?? '-', $action->status->label()));
        }

        $online = $this->onlineCount();
        $this->line('');
        if ($target > 0 && $online < $target) {
            $this->line("HASIL: GAGAL - agent online {$online} dari {$target}.");

            return self::FAILURE;
        }
        $this->line("HASIL: LULUS - {$online} agent online.");

        return self::SUCCESS;
    }

    private function onlineCount(): int
    {
        return Agent::query()->where('status', AgentStatus::Online)->count();
    }
}
