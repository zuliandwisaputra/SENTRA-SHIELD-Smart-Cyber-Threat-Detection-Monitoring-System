<div>
    <header class="border-b border-gray-800 bg-gray-900">
        <div class="max-w-3xl mx-auto py-5 px-4 sm:px-6">
            <h2 class="font-semibold text-xl text-gray-100 leading-tight">Antrean Persetujuan</h2>
            <p class="mt-1 text-xs text-gray-500">Two-person rule: usulan dari Operator/Analis, keputusan oleh Komandan. Setiap keputusan tercatat di audit log.</p>
        </div>
    </header>

    <div class="py-6 max-w-3xl mx-auto px-4 sm:px-6 space-y-4">
        @if ($flash)
            <div class="rounded-md border border-emerald-800 bg-emerald-950/60 px-4 py-3 text-sm text-emerald-200" role="status">{{ $flash }}</div>
        @endif

        @forelse ($pending as $group => $rows)
            @php $first = $rows->first(); $inc = $first->incident; @endphp
            <article class="rounded-lg border border-sky-800 bg-gray-900 p-4" wire:key="usulan-{{ $group }}" data-testid="usulan">
                <div class="flex items-start justify-between gap-3">
                    <div class="min-w-0">
                        <div class="text-xs uppercase tracking-wide text-sky-300">Usulan {{ $first->type->label() }}</div>
                        <div class="mt-1 font-mono text-2xl font-bold text-gray-100 break-all">{{ $first->params['ip'] ?? '—' }}</div>
                    </div>
                    @if ($inc)
                        <div class="shrink-0 text-right">
                            <div class="text-lg font-bold text-gray-100">{{ $inc->score }}</div>
                            <x-severity-badge :severity="$inc->severity" />
                        </div>
                    @endif
                </div>
                <dl class="mt-3 grid grid-cols-1 gap-x-4 gap-y-1 text-sm sm:grid-cols-2">
                    @if ($inc)
                        <div class="sm:col-span-2"><dt class="inline text-gray-500">Insiden:</dt> <dd class="inline"><a href="{{ route('incidents.show', $inc) }}" wire:navigate class="text-emerald-400 hover:underline">#{{ $inc->id }} {{ $inc->title }}</a></dd></div>
                    @endif
                    <div><dt class="inline text-gray-500">Durasi:</dt> <dd class="inline text-gray-200">{{ \App\Response\ActionService::DURATIONS[$first->params['duration_s'] ?? 0] ?? (($first->params['duration_s'] ?? 0).' detik') }}</dd></div>
                    <div><dt class="inline text-gray-500">Agent:</dt> <dd class="inline text-gray-200">{{ $rows->map(fn ($r) => $r->targetAgent->hostname)->join(', ') }}</dd></div>
                    <div class="sm:col-span-2"><dt class="inline text-gray-500">Diusulkan:</dt> <dd class="inline text-gray-200">{{ $first->proposer?->name }} ({{ $first->proposer?->role->label() }}), {{ waktu_wib($first->created_at, 'H:i:s') }}</dd></div>
                </dl>

                <label for="alasan-{{ $group }}" class="mt-3 block text-xs text-gray-400">Alasan (wajib bila menolak)</label>
                <textarea id="alasan-{{ $group }}" wire:model="note.{{ $group }}" rows="2" class="mt-1 block w-full rounded-md border-gray-700 bg-gray-950 text-sm text-gray-200"></textarea>
                @error('keputusan.'.$group)
                    <p class="mt-1 text-sm text-red-400">{{ $message }}</p>
                @enderror

                <div class="mt-3 grid grid-cols-2 gap-3">
                    <button wire:click="approve('{{ $group }}')" wire:loading.attr="disabled" class="rounded-md bg-emerald-700 px-4 py-3 text-base font-semibold text-white hover:bg-emerald-600 disabled:opacity-50">Setujui</button>
                    <button wire:click="reject('{{ $group }}')" wire:loading.attr="disabled" class="rounded-md bg-red-800 px-4 py-3 text-base font-semibold text-white hover:bg-red-700 disabled:opacity-50">Tolak</button>
                </div>
            </article>
        @empty
            <p class="rounded-lg border border-gray-800 bg-gray-900 p-6 text-center text-gray-400">Tidak ada usulan yang menunggu keputusan.</p>
        @endforelse

        @if ($decided->isNotEmpty())
            <section class="pt-4">
                <h3 class="text-sm font-semibold text-gray-300">Keputusan terakhir</h3>
                <ul class="mt-2 divide-y divide-gray-800 rounded-lg border border-gray-800 bg-gray-900 text-sm">
                    @foreach ($decided as $rows)
                        @php $r = $rows->first(); @endphp
                        <li class="flex flex-wrap items-center gap-2 px-4 py-2">
                            <span class="font-mono text-gray-200">{{ $r->type->value === 'unblock_ip' ? 'buka ' : '' }}{{ $r->params['ip'] ?? '' }}</span>
                            <x-action-status :status="$r->status" />
                            <span class="text-xs text-gray-500">{{ $rows->count() }} agent · {{ $r->approver?->name }} · {{ waktu_wib($r->approved_at, 'H:i') }}</span>
                            @if ($r->decision_note)
                                <span class="text-xs text-gray-400">“{{ $r->decision_note }}”</span>
                            @endif
                        </li>
                    @endforeach
                </ul>
            </section>
        @endif
    </div>
</div>
