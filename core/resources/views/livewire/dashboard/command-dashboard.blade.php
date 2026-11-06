<div>
    <header class="border-b border-gray-800 bg-gray-900">
        <div class="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8 flex flex-wrap items-baseline justify-between gap-2">
            <h2 class="font-semibold text-xl text-gray-100 leading-tight">Beranda Komando</h2>
            <p class="text-xs text-gray-500">Semua angka dihitung dari event asli. Klik angka untuk melihat datanya.</p>
        </div>
    </header>

    <div class="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {{-- Kartu metrik --}}
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <a href="{{ route('incidents.index') }}" wire:navigate class="block rounded-lg border border-gray-800 bg-gray-900 p-4 hover:border-gray-600" data-testid="kartu-insiden">
                <div class="text-sm text-gray-400">Insiden terbuka</div>
                <div class="mt-1 text-3xl font-bold text-gray-100">{{ $openCount }}</div>
                <div class="mt-2 flex flex-wrap gap-1.5">
                    @foreach ($bySeverity as $sev => $n)
                        @if ($n > 0)
                            <x-severity-badge :severity="\App\Enums\Severity::from($sev)" /><span class="text-xs text-gray-300 me-1">{{ $n }}</span>
                        @endif
                    @endforeach
                    @if ($openCount === 0)
                        <span class="text-xs text-gray-500">Tidak ada insiden terbuka</span>
                    @endif
                </div>
            </a>

            @php $agentTag = $canSeeAgents ? 'a' : 'div'; @endphp
            <{{ $agentTag }} @if ($canSeeAgents) href="{{ route('units-agents') }}" wire:navigate @endif class="block rounded-lg border border-gray-800 bg-gray-900 p-4 {{ $canSeeAgents ? 'hover:border-gray-600' : '' }}" data-testid="kartu-agent">
                <div class="text-sm text-gray-400">Agent online</div>
                <div class="mt-1 text-3xl font-bold text-gray-100">{{ $agentOnline }}<span class="text-lg font-medium text-gray-500"> / {{ $agentTotal }}</span></div>
                <div class="mt-2 text-xs {{ $agentBlind > 0 ? 'text-red-300 font-semibold' : 'text-gray-500' }}">
                    {{ $agentBlind > 0 ? $agentBlind.' agent BUTA (sensor mati)' : 'Tidak ada agent buta' }}
                </div>
                @if ($sourceWarnings > 0)
                    <div class="mt-1 text-xs font-semibold text-yellow-300">{{ $sourceWarnings }} peringatan sumber log</div>
                @endif
            </{{ $agentTag }}>

            <a href="{{ route('actions.index', ['status' => 'aktif']) }}" wire:navigate class="block rounded-lg border border-gray-800 bg-gray-900 p-4 hover:border-gray-600" data-testid="kartu-blokir">
                <div class="text-sm text-gray-400">Blokir aktif</div>
                <div class="mt-1 text-3xl font-bold text-gray-100">{{ $blockCount }}</div>
                <div class="mt-2 text-xs text-gray-500">{{ $blockCount > 0 ? $blockIps.' IP diblokir di firewall host agent' : 'Belum ada blokir aktif' }}</div>
            </a>
        </div>

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div class="min-w-0 space-y-6 lg:col-span-2">
                {{-- Grafik event per menit --}}
                <section class="rounded-lg border border-gray-800 bg-gray-900 p-4 sm:p-6" aria-labelledby="grafik-judul">
                    <div class="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 id="grafik-judul" class="text-base font-semibold text-gray-100">Event per menit</h3>
                        <span class="text-xs text-gray-500">{{ \App\Livewire\Dashboard\CommandDashboard::CHART_MINUTES }} menit terakhir · total {{ array_sum($series['counts']) }} event</span>
                    </div>
                    <div class="mt-4 h-48" wire:ignore x-data="grafikEvent(@js($series))">
                        <canvas x-ref="canvas" role="img" aria-label="Grafik batang jumlah event per menit selama {{ \App\Livewire\Dashboard\CommandDashboard::CHART_MINUTES }} menit terakhir"></canvas>
                    </div>
                    <details class="mt-3 text-xs text-gray-400">
                        <summary class="cursor-pointer select-none hover:text-gray-200">Lihat sebagai tabel</summary>
                        <table class="mt-2 w-full max-w-xs">
                            <thead><tr class="text-left text-gray-500"><th class="py-1 pe-4 font-medium">Menit (WIB)</th><th class="py-1 font-medium">Event</th></tr></thead>
                            <tbody>
                                @foreach ($series['labels'] as $i => $label)
                                    @if ($series['counts'][$i] > 0)
                                        <tr><td class="py-0.5 pe-4 font-mono">{{ $label }}</td><td class="py-0.5 font-mono text-gray-200">{{ $series['counts'][$i] }}</td></tr>
                                    @endif
                                @endforeach
                            </tbody>
                        </table>
                    </details>
                </section>

                {{-- Feed event live --}}
                <section class="rounded-lg border border-gray-800 bg-gray-900 p-4 sm:p-6" aria-labelledby="feed-judul">
                    <h3 id="feed-judul" class="text-base font-semibold text-gray-100">Feed event live</h3>
                    <ul class="mt-3 divide-y divide-gray-800 text-sm">
                        @forelse ($feed as $event)
                            <li class="py-2 flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3" wire:key="feed-{{ $event->id }}">
                                <span class="shrink-0 font-mono text-xs text-gray-500">{{ waktu_wib($event->occurred_at, 'H:i:s') }}</span>
                                <a href="{{ route('events.show', $event) }}" class="shrink-0 whitespace-nowrap font-mono text-xs text-emerald-400 hover:underline">EV-{{ $event->id }}</a>
                                <span class="shrink-0 text-xs text-gray-400">{{ $event->unit->name }} · {{ $event->source->label() }}</span>
                                <span class="min-w-0 truncate text-gray-200" title="{{ $event->summary() }}">{{ $event->summary() }}</span>
                                @foreach ($event->detections->pluck('rule.code')->unique() as $code)
                                    <span class="shrink-0 rounded bg-red-900/60 px-1.5 py-0.5 font-mono text-xs text-red-200">{{ $code }}</span>
                                @endforeach
                            </li>
                        @empty
                            <li class="py-3 text-gray-500">Belum ada event dari agent.</li>
                        @endforelse
                    </ul>
                </section>
            </div>

            {{-- Pohon satuan --}}
            <section class="min-w-0 rounded-lg border border-gray-800 bg-gray-900 p-4 sm:p-6" aria-labelledby="pohon-satuan">
                <h3 id="pohon-satuan" class="text-base font-semibold text-gray-100">Pohon Satuan &amp; Tingkat Siaga</h3>
                <p class="mt-1 text-xs text-gray-500">Dihitung dari insiden terbuka; satuan induk mengikuti tingkat tertinggi di bawahnya.</p>
                @if ($tree->isEmpty())
                    <p class="mt-4 text-sm text-gray-400">Belum ada satuan yang bisa Anda lihat. Hubungi Admin.</p>
                @else
                    <ul class="mt-4 space-y-1" role="tree">
                        @foreach ($tree as $unit)
                            @include('partials.unit-node', ['unit' => $unit, 'depth' => 0])
                        @endforeach
                    </ul>
                @endif
            </section>
        </div>
    </div>
</div>
