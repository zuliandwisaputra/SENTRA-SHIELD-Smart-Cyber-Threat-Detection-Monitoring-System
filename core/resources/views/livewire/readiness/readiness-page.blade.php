<div>
    <header class="border-b border-gray-800 bg-gray-900">
        <div class="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8">
            <h2 class="font-semibold text-xl text-gray-100 leading-tight">Uji Kesiapan</h2>
            <p class="mt-1 text-xs text-gray-500">Sistem menguji dirinya sendiri: agent menjalankan skenario serangan aman ke host-nya sendiri (bertanda uji, tidak pernah menjadi insiden), lalu Core mengukur apakah deteksinya muncul dan berapa lama.</p>
        </div>
    </header>

    <div class="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        @if ($canRun)
            <form wire:submit="run" class="flex flex-wrap items-end gap-3 rounded-lg border border-gray-800 bg-gray-900 p-4">
                <div>
                    <label for="satuan" class="block text-xs text-gray-400">Satuan yang diuji</label>
                    <select id="satuan" wire:model="unitId" class="mt-1 rounded-md border-gray-700 bg-gray-950 text-sm text-gray-200">
                        @foreach ($units as $u)
                            <option value="{{ $u->id }}">{{ $u->name }} ({{ $u->agents_count }} agent online)</option>
                        @endforeach
                    </select>
                </div>
                <x-primary-button wire:loading.attr="disabled">Jalankan Uji Kesiapan</x-primary-button>
                @error('uji')
                    <p class="w-full text-sm text-red-400" role="alert">{{ $message }}</p>
                @enderror
            </form>
        @endif

        @if ($run)
            @php
                $total = $results->count();
                $detected = $results->where('detected', true);
                $running = $run->status === \App\Enums\ReadinessStatus::Berjalan;
            @endphp
            <section class="rounded-lg border border-gray-800 bg-gray-900 p-4 sm:p-6" aria-labelledby="hasil-uji">
                <div class="flex flex-wrap items-start justify-between gap-4">
                    <div>
                        <h3 id="hasil-uji" class="text-base font-semibold text-gray-100">Uji #{{ $run->id }} · {{ $run->unit?->name }}</h3>
                        <p class="text-xs text-gray-500">Dimulai {{ waktu_wib($run->started_at, 'd/m/Y H:i:s') }} oleh {{ $run->starter?->name }} · {{ $running ? 'sedang berjalan…' : 'selesai '.waktu_wib($run->finished_at, 'H:i:s') }}</p>
                    </div>
                    <div class="flex gap-6 text-right">
                        <div>
                            <div class="text-xs text-gray-400">Cakupan deteksi</div>
                            <div class="text-3xl font-bold text-gray-100" data-testid="cakupan">{{ $detected->count() }}/{{ $total }}</div>
                            @if (! $running && $total > 0)
                                <div class="text-xs text-gray-500">{{ round($detected->count() / $total * 100) }}%</div>
                            @endif
                        </div>
                        <div>
                            <div class="text-xs text-gray-400">Rata-rata waktu deteksi</div>
                            <div class="text-3xl font-bold text-gray-100">{{ $detected->isNotEmpty() ? number_format($detected->avg('ttd_ms') / 1000, 1, ',', '.') : '—' }}<span class="text-base font-medium text-gray-500"> dtk</span></div>
                        </div>
                    </div>
                </div>

                {{-- Layar kecil: kartu per skenario --}}
                <ul class="mt-4 divide-y divide-gray-800 sm:hidden">
                    @foreach ($results as $r)
                        <li class="py-3" wire:key="hasil-hp-{{ $r->id }}">
                            <div class="flex items-start justify-between gap-3">
                                <span class="min-w-0 text-sm text-gray-200">{{ \App\Readiness\ScenarioCatalog::SCENARIOS[$r->scenario]['nama'] ?? $r->scenario }}</span>
                                <span class="shrink-0">@include('livewire.readiness.partials.hasil')</span>
                            </div>
                            <div class="mt-1 text-xs text-gray-400">
                                <span class="font-mono text-gray-300">{{ $r->rule->code }}</span> {{ $r->rule->name }} · {{ $r->rule->attack_id }} · <span class="whitespace-nowrap">{{ $r->agent?->hostname }}</span>
                                @if ($r->ttd_ms !== null)
                                    · <span class="whitespace-nowrap font-mono text-gray-200">{{ number_format($r->ttd_ms / 1000, 1, ',', '.') }} dtk</span>
                                @endif
                            </div>
                            @if ($r->note)
                                <div class="mt-0.5 text-xs text-gray-500">{{ $r->note }}</div>
                            @endif
                        </li>
                    @endforeach
                </ul>

                <div class="mt-4 hidden overflow-x-auto sm:block">
                    <table class="min-w-full text-sm">
                        <thead class="text-left text-xs uppercase tracking-wide text-gray-500">
                            <tr><th class="py-2 pe-3">Skenario</th><th class="py-2 pe-3">Aturan &amp; ATT&amp;CK</th><th class="py-2 pe-3">Agent</th><th class="py-2 pe-3">Hasil</th><th class="py-2">Waktu deteksi</th></tr>
                        </thead>
                        <tbody class="divide-y divide-gray-800">
                            @foreach ($results as $r)
                                <tr wire:key="hasil-{{ $r->id }}">
                                    <td class="py-2 pe-3 text-gray-200">{{ \App\Readiness\ScenarioCatalog::SCENARIOS[$r->scenario]['nama'] ?? $r->scenario }}</td>
                                    <td class="py-2 pe-3 text-xs text-gray-400"><span class="font-mono text-gray-300">{{ $r->rule->code }}</span> {{ $r->rule->name }}<br>{{ $r->rule->attack_id }} {{ $r->rule->attack_name }}</td>
                                    <td class="whitespace-nowrap py-2 pe-3 text-gray-300">{{ $r->agent?->hostname }}</td>
                                    <td class="py-2 pe-3">
                                        @include('livewire.readiness.partials.hasil')
                                        @if ($r->note)
                                            <div class="mt-0.5 text-xs text-gray-500">{{ $r->note }}</div>
                                        @endif
                                    </td>
                                    <td class="whitespace-nowrap py-2 font-mono text-gray-200">{{ $r->ttd_ms !== null ? number_format($r->ttd_ms / 1000, 1, ',', '.').' dtk' : '—' }}</td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
            </section>
        @else
            <p class="rounded-lg border border-gray-800 bg-gray-900 p-6 text-gray-400">Belum ada Uji Kesiapan.</p>
        @endif

        @if ($history->isNotEmpty())
            <section class="rounded-lg border border-gray-800 bg-gray-900 p-4 sm:p-6" aria-labelledby="riwayat">
                <h3 id="riwayat" class="text-base font-semibold text-gray-100">Riwayat</h3>
                <ul class="mt-3 divide-y divide-gray-800 text-sm">
                    @foreach ($history as $h)
                        <li class="flex flex-wrap items-center gap-3 py-2" wire:key="riwayat-{{ $h->id }}">
                            <button wire:click="show({{ $h->id }})" class="font-medium {{ $h->id === $run?->id ? 'text-gray-100' : 'text-emerald-400 hover:underline' }}">Uji #{{ $h->id }}</button>
                            <span class="text-gray-400">{{ waktu_wib($h->started_at, 'd/m H:i') }} · {{ $h->unit?->name }}</span>
                            <span class="font-mono text-gray-200">{{ $h->detected_count }}/{{ $h->results_count }}</span>
                            <span class="text-gray-400">{{ $h->avg_ttd_ms !== null ? number_format($h->avg_ttd_ms / 1000, 1, ',', '.').' dtk rata-rata' : ($h->status->value === 'berjalan' ? 'berjalan' : '—') }}</span>
                            <span class="text-xs text-gray-500">{{ $h->starter?->name }}</span>
                        </li>
                    @endforeach
                </ul>
            </section>
        @endif
    </div>
</div>
