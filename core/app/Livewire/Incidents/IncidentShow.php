<?php

namespace App\Livewire\Incidents;

use App\Detection\RiskScorer;
use App\Enums\IncidentStatus;
use App\Enums\KillChainStage;
use App\Models\Detection;
use App\Models\Incident;
use App\Services\AuditLogger;
use Livewire\Attributes\Layout;
use Livewire\Component;
use Livewire\WithPagination;

/**
 * Detail Insiden (FR-04, FR-05): garis waktu Attack Story per tahap, teknik
 * ATT&CK, rincian skor, dan event bukti.
 */
#[Layout('layouts.app')]
class IncidentShow extends Component
{
    use WithPagination;

    public Incident $incident;

    public string $ruleFilter = '';

    public function mount(Incident $incident): void
    {
        $this->authorize('view', $incident);
        $this->incident = $incident;
    }

    public function setStatus(string $status, AuditLogger $audit, RiskScorer $scorer): void
    {
        $this->authorize('updateStatus', $this->incident);
        $new = IncidentStatus::tryFrom($status);
        if ($new === null || $new === $this->incident->status) {
            return;
        }

        $old = $this->incident->status;
        $this->incident->update(['status' => $new]);
        $audit->record('status_insiden_diubah', $this->incident, ['dari' => $old->value, 'ke' => $new->value]);
        $scorer->refreshUnitAlert($this->incident->unit_id);
    }

    public function filterRule(string $code): void
    {
        $this->ruleFilter = $this->ruleFilter === $code ? '' : $code;
        $this->resetPage();
    }

    public function render()
    {
        $incident = $this->incident->fresh(['unit', 'campaign']);
        $breakdown = $incident->score_breakdown ?? [];

        // Garis waktu: aturan per tahap beserta waktu pertama dan contoh bukti.
        $perRule = Detection::query()
            ->where('incident_id', $incident->id)
            ->with('rule')
            ->selectRaw('rule_id, count(*) as jumlah, min(detected_at) as pertama, max(detected_at) as terakhir, min(event_id) as event_pertama, max(attribution) as atribusi')
            ->groupBy('rule_id')
            ->get();

        $stages = collect(KillChainStage::cases())
            ->reject(fn ($s) => $s === KillChainStage::PertahananDilumpuhkan && ! $perRule->contains(fn ($r) => $r->rule->stage === $s))
            ->map(fn (KillChainStage $stage) => [
                'stage' => $stage,
                'rules' => $perRule->filter(fn ($r) => $r->rule->stage === $stage)->sortBy('pertama')->values(),
            ]);

        $evidence = Detection::query()
            ->where('incident_id', $incident->id)
            ->with(['rule', 'event'])
            ->when($this->ruleFilter !== '', fn ($q) => $q->whereHas('rule', fn ($r) => $r->where('code', $this->ruleFilter)))
            ->orderByDesc('id')
            ->paginate(15);

        return view('livewire.incidents.incident-show', [
            'inc' => $incident,
            'breakdown' => $breakdown,
            'stages' => $stages,
            'evidence' => $evidence,
            'canUpdateStatus' => auth()->user()->can('updateStatus', $incident),
        ])->title('Insiden #'.$incident->id);
    }
}
