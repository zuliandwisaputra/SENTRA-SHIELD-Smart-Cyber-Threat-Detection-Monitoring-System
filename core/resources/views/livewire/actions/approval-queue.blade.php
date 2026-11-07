<div>
    <x-ui.page-header title="Antrean Persetujuan" icon="inbox" class="[&>div]:max-w-3xl">
        Two-person rule: usulan dari Operator/Analis, keputusan oleh Komandan. Setiap keputusan tercatat di audit log.
        @if ($pending->isNotEmpty())
            <x-slot:actions><x-ui.badge tone="accent" icon="clock">{{ $pending->count() }} usulan menunggu</x-ui.badge></x-slot:actions>
        @endif
    </x-ui.page-header>

    <div class="mx-auto max-w-3xl space-y-4 px-4 py-6 sm:px-6">
        @if ($flash)
            <div class="flex items-start gap-2 rounded-control border border-aman/40 bg-aman/10 px-4 py-3 text-sm text-aman" role="status"><x-icon name="circle-check" class="mt-0.5 size-4" />{{ $flash }}</div>
        @endif

        @forelse ($pending as $group => $rows)
            @php
                $first = $rows->first();
                $inc = $first->incident;
                $tone = $inc ? \App\Enums\AlertLevel::fromSeverity($inc->severity)->value : 'accent';
            @endphp
            <x-ui.card :tone="$tone" class="p-4 sm:p-5" wire:key="usulan-{{ $group }}" data-testid="usulan">
                <div class="flex items-start justify-between gap-4">
                    <div class="min-w-0">
                        <p class="flex items-center gap-1.5 text-sm font-medium text-accent">
                            <x-icon name="shield-ban" class="size-4" />Usulan {{ $first->type->label() }}{{ $first->campaign_id ? ' serentak · Kampanye #'.$first->campaign_id : '' }}
                        </p>
                        <p class="mt-1.5 break-all font-mono text-[28px] font-semibold leading-tight text-ink sm:text-[32px]">{{ $first->params['ip'] ?? '—' }}</p>
                    </div>
                    @if ($inc)
                        <div class="shrink-0 text-right">
                            <p class="text-xs text-ink-3">Skor</p>
                            <p class="num text-[32px] text-ink">{{ $inc->score }}</p>
                            <x-severity-badge :severity="$inc->severity" class="mt-1.5" />
                        </div>
                    @endif
                </div>

                <dl class="mt-4 grid grid-cols-1 gap-x-6 gap-y-2.5 border-t border-line pt-4 text-sm sm:grid-cols-2">
                    @if ($first->campaign_id)
                        <div class="flex gap-2 sm:col-span-2"><x-icon name="network" class="mt-0.5 size-4 text-ink-3" /><dt class="text-ink-3">Satuan:</dt> <dd class="text-ink">{{ $rows->map(fn ($r) => $r->targetAgent->unit->name)->unique()->join(', ') }}</dd></div>
                    @elseif ($inc)
                        <div class="flex gap-2 sm:col-span-2"><x-icon name="siren" class="mt-0.5 size-4 text-ink-3" /><dt class="text-ink-3">Insiden:</dt> <dd class="min-w-0"><a href="{{ route('incidents.show', $inc) }}" wire:navigate class="link">#{{ $inc->id }} {{ $inc->title }}</a></dd></div>
                    @endif
                    <div class="flex gap-2"><x-icon name="timer" class="mt-0.5 size-4 text-ink-3" /><dt class="text-ink-3">Durasi:</dt> <dd class="font-medium text-ink">{{ \App\Response\ActionService::DURATIONS[$first->params['duration_s'] ?? 0] ?? (($first->params['duration_s'] ?? 0).' detik') }}</dd></div>
                    <div class="flex gap-2"><x-icon name="server" class="mt-0.5 size-4 text-ink-3" /><dt class="text-ink-3">Agent:</dt> <dd class="data min-w-0 break-words text-ink">{{ $rows->map(fn ($r) => $r->targetAgent->hostname)->join(', ') }}</dd></div>
                    <div class="flex gap-2 sm:col-span-2"><x-icon name="user" class="mt-0.5 size-4 text-ink-3" /><dt class="text-ink-3">Diusulkan:</dt> <dd class="text-ink">{{ $first->proposer?->name }} ({{ $first->proposer?->role->label() }}), <span class="data">{{ waktu_wib($first->created_at, 'H:i:s') }}</span></dd></div>
                </dl>

                <label for="alasan-{{ $group }}" class="mt-4 block text-sm text-ink-2">Alasan (wajib bila menolak)</label>
                <textarea id="alasan-{{ $group }}" wire:model="note.{{ $group }}" rows="2" class="mt-1.5 block w-full text-sm"></textarea>
                @error('keputusan.'.$group)
                    <p class="mt-1.5 flex items-center gap-1.5 text-sm text-awas" role="alert"><x-icon name="circle-alert" class="size-4" />{{ $message }}</p>
                @enderror

                <div class="mt-4 grid grid-cols-2 gap-3">
                    <x-ui.button variant="approve" size="lg" icon="check" wire:click="approve('{{ $group }}')" wire:loading.attr="disabled">Setujui</x-ui.button>
                    <x-ui.button variant="danger" size="lg" icon="x" wire:click="reject('{{ $group }}')" wire:loading.attr="disabled">Tolak</x-ui.button>
                </div>
            </x-ui.card>
        @empty
            <div class="panel"><x-ui.empty icon="inbox" title="Tidak ada usulan yang menunggu keputusan.">Usulan blokir dari Operator atau Analis muncul di sini untuk diputuskan Komandan.</x-ui.empty></div>
        @endforelse

        @if ($decided->isNotEmpty())
            <x-ui.panel title="Keputusan terakhir" icon="history" :flush="true" class="mt-6">
                <ul class="text-sm">
                    @foreach ($decided as $rows)
                        @php $r = $rows->first(); @endphp
                        <li class="flex flex-wrap items-center gap-x-3 gap-y-1 border-b border-line/70 px-4 py-2.5 last:border-b-0 sm:px-5">
                            <span class="data font-medium text-ink">{{ $r->type->value === 'unblock_ip' ? 'buka ' : '' }}{{ $r->params['ip'] ?? '' }}</span>
                            <x-action-status :status="$r->status" />
                            <span class="text-xs text-ink-3">{{ $rows->count() }} agent · {{ $r->approver?->name }} · {{ waktu_wib($r->approved_at, 'H:i') }}</span>
                            @if ($r->decision_note)
                                <span class="text-xs text-ink-2">“{{ $r->decision_note }}”</span>
                            @endif
                        </li>
                    @endforeach
                </ul>
            </x-ui.panel>
        @endif
    </div>
</div>
