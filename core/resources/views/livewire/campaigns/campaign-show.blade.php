<div>
    <header class="border-b border-gray-800 bg-gray-900">
        <div class="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8">
            <a href="{{ route('campaigns.index') }}" wire:navigate class="text-xs text-gray-400 hover:underline">&larr; Kampanye</a>
            <h2 class="mt-1 font-semibold text-xl text-gray-100 leading-tight">Kampanye #{{ $c->id }}: <span class="font-mono">{{ $c->src_ip }}</span> menyerang {{ $c->unit_count }} satuan</h2>
            <p class="mt-1 text-sm text-gray-400">{{ waktu_wib($c->first_seen_at, 'd/m/Y H:i:s') }} s.d. {{ waktu_wib($c->last_seen_at, 'H:i:s') }} · status {{ $c->status->label() }} · skor setiap insiden tertaut dikalikan 1,3</p>
        </div>
    </header>

    <div class="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <section class="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6" aria-labelledby="urutan">
            <h3 id="urutan" class="text-base font-semibold text-gray-100">Satuan terdampak menurut urutan waktu</h3>
            <ol class="mt-4 relative border-s border-gray-700 ms-3 space-y-4">
                @foreach ($incidents as $i => $inc)
                    <li class="ms-6" wire:key="ki-{{ $inc->id }}">
                        <span class="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white ring-4 ring-gray-900">{{ $i + 1 }}</span>
                        <div class="flex flex-wrap items-center gap-2">
                            <span class="font-semibold text-gray-100">{{ $inc->unit->name }}</span>
                            <x-severity-badge :severity="$inc->severity" />
                            <span class="text-sm text-gray-300">skor {{ $inc->score }}</span>
                        </div>
                        <div class="text-xs text-gray-400">
                            Pertama {{ waktu_wib($inc->first_seen_at, 'H:i:s') }} · terakhir {{ waktu_wib($inc->last_seen_at, 'H:i:s') }} · tahap {{ $inc->stage_max?->label() ?? '—' }} ·
                            <a href="{{ route('incidents.show', $inc) }}" wire:navigate class="text-emerald-400 hover:underline">Insiden #{{ $inc->id }}</a>
                        </div>
                    </li>
                @endforeach
            </ol>
        </section>

        <section class="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6" aria-labelledby="serentak">
            <h3 id="serentak" class="text-base font-semibold text-gray-100">Blokir serentak</h3>
            @if ($flash)
                <div class="mt-3 rounded-md border border-emerald-800 bg-emerald-950/60 px-3 py-2 text-sm text-emerald-200" role="status">{{ $flash }}</div>
            @endif
            @error('blokir')
                <div class="mt-3 rounded-md border border-red-800 bg-red-950/60 px-3 py-2 text-sm text-red-200" role="alert">{{ $message }}</div>
            @enderror
            @if ($canPropose && $c->status === \App\Enums\CampaignStatus::Aktif)
                <form wire:submit="proposeBlock" class="mt-3 flex flex-wrap items-end gap-3">
                    <div>
                        <label for="durasi" class="block text-xs text-gray-400">Blokir <span class="font-mono text-gray-200">{{ $c->src_ip }}</span> di semua agent pada {{ $c->unit_count }} satuan selama</label>
                        <select id="durasi" wire:model="duration" class="mt-1 rounded-md border-gray-700 bg-gray-950 text-sm text-gray-200">
                            @foreach (\App\Response\ActionService::DURATIONS as $seconds => $label)
                                <option value="{{ $seconds }}">{{ $label }}</option>
                            @endforeach
                        </select>
                    </div>
                    <x-primary-button>Usulkan blokir serentak</x-primary-button>
                </form>
            @endif
            @if ($actions->isNotEmpty())
                <ul class="mt-4 divide-y divide-gray-800 text-sm">
                    @foreach ($actions as $a)
                        <li class="flex flex-wrap items-center gap-2 py-2" wire:key="ka-{{ $a->id }}">
                            <span class="text-gray-200">{{ $a->type->label() }} <span class="font-mono">{{ $a->params['ip'] ?? '' }}</span></span>
                            <span class="text-gray-400">{{ $a->targetAgent->hostname }} ({{ $a->targetAgent->unit->name }})</span>
                            <x-action-status :status="$a->status" />
                            <span class="text-xs text-gray-500">{{ $a->result['message'] ?? '' }}</span>
                        </li>
                    @endforeach
                </ul>
            @elseif (! $canPropose)
                <p class="mt-2 text-sm text-gray-500">Belum ada tindakan untuk kampanye ini.</p>
            @endif
        </section>
    </div>
</div>
