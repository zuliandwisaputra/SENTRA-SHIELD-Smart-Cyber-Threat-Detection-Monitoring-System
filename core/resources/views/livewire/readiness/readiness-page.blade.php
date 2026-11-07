<div>
    <x-ui.page-header title="Uji Kesiapan" icon="target">
        <span class="block max-w-3xl">Sistem menguji dirinya sendiri: agent menjalankan skenario serangan aman ke host-nya sendiri (bertanda uji, tidak pernah menjadi insiden), lalu Core mengukur apakah deteksinya muncul dan berapa lama.</span>
    </x-ui.page-header>

    <div class="mx-auto max-w-[1440px] space-y-4 px-4 py-6 sm:px-6 lg:px-8">
        @if ($canRun)
            <form wire:submit="run" class="panel flex flex-wrap items-end gap-3 p-4 sm:p-5">
                <div class="min-w-0 flex-1 basis-64 sm:flex-none">
                    <label for="satuan" class="block text-sm text-ink-2">Satuan yang diuji</label>
                    <select id="satuan" wire:model="unitId" class="mt-1.5 h-10 w-full text-sm sm:w-80">
                        @foreach ($units as $u)
                            <option value="{{ $u->id }}">{{ $u->name }} ({{ $u->agents_count }} agent online)</option>
                        @endforeach
                    </select>
                </div>
                <x-primary-button wire:loading.attr="disabled"><x-icon name="target" class="size-4" />Jalankan Uji Kesiapan</x-primary-button>
                @error('uji')
                    <p class="flex w-full items-center gap-1.5 text-sm text-awas" role="alert"><x-icon name="circle-alert" class="size-4" />{{ $message }}</p>
                @enderror
            </form>
        @endif

        @if ($run)
            @php
                $total = $results->count();
                $detected = $results->where('detected', true);
                $running = $run->status === \App\Enums\ReadinessStatus::Berjalan;
                $lolos = $running ? 0 : $total - $detected->count();
                $menunggu = $running ? $total - $detected->count() : 0;
                $persen = $total > 0 ? $detected->count() / $total : 0;
                $ttdMaks = max(1, (int) $results->max('ttd_ms'));
                // Cincin cakupan: keliling lingkaran r=52 ≈ 326,7.
                $keliling = 2 * M_PI * 52;
            @endphp
            <div class="grid gap-4 xl:grid-cols-12 xl:items-start">
                {{-- Angka terpenting: cakupan deteksi. --}}
                <section class="panel min-w-0 p-5 sm:p-6 xl:col-span-4" aria-labelledby="hasil-uji">
                    <h3 id="hasil-uji" class="panel-title">Uji #{{ $run->id }} · {{ $run->unit?->name }}</h3>
                    <p class="mt-1 text-xs text-ink-3">Dimulai {{ waktu_wib($run->started_at, 'd/m/Y H:i:s') }} oleh {{ $run->starter?->name }} · {{ $running ? 'sedang berjalan…' : 'selesai '.waktu_wib($run->finished_at, 'H:i:s') }}</p>

                    <div class="mt-5 flex flex-wrap items-center gap-6">
                        <div class="relative size-44 shrink-0" role="img" aria-label="Cakupan deteksi {{ $detected->count() }} dari {{ $total }} skenario">
                            <svg viewBox="0 0 120 120" class="size-full -rotate-90" aria-hidden="true">
                                <circle cx="60" cy="60" r="52" fill="none" stroke="rgb(var(--inset))" stroke-width="10" />
                                <circle cx="60" cy="60" r="52" fill="none" stroke="rgb(var(--accent))" stroke-width="10" stroke-linecap="round"
                                    stroke-dasharray="{{ round($keliling * $persen, 2) }} {{ round($keliling, 2) }}" class="transition-[stroke-dasharray] duration-700 ease-sentra" />
                            </svg>
                            <div class="absolute inset-0 flex flex-col items-center justify-center">
                                <span class="num text-[44px] text-ink" data-testid="cakupan">{{ $detected->count() }}/{{ $total }}</span>
                                <span class="mt-1 text-sm text-ink-3">
                                    @if (! $running && $total > 0){{ round($persen * 100) }}% @endif cakupan
                                </span>
                            </div>
                        </div>
                        <dl class="min-w-0 flex-1 space-y-3">
                            <div>
                                <dt class="text-sm text-ink-2">Cakupan deteksi</dt>
                                <dd class="mt-0.5 flex flex-wrap gap-1.5">
                                    <x-ui.badge tone="aman" icon="circle-check">{{ $detected->count() }} terdeteksi</x-ui.badge>
                                    @if ($lolos > 0)<x-ui.badge tone="awas" icon="circle-x">{{ $lolos }} lolos</x-ui.badge>@endif
                                    @if ($menunggu > 0)<x-ui.badge tone="accent" icon="loader-circle">{{ $menunggu }} menunggu</x-ui.badge>@endif
                                </dd>
                            </div>
                            <div>
                                <dt class="text-sm text-ink-2">Rata-rata waktu deteksi</dt>
                                <dd class="mt-0.5 flex items-baseline gap-1.5"><span class="num text-[40px] text-ink">{{ $detected->isNotEmpty() ? number_format($detected->avg('ttd_ms') / 1000, 1, ',', '.') : '—' }}</span><span class="font-display text-lg text-ink-3">dtk</span></dd>
                            </div>
                        </dl>
                    </div>
                </section>

                {{-- Matriks skenario --}}
                <x-ui.panel title="Matriks skenario" icon="list-checks" class="xl:col-span-8"
                    subtitle="Satu skenario aman per aturan; batang menunjukkan waktu sampai deteksi muncul di Core.">
                    <ul class="grid gap-2.5 sm:grid-cols-2 2xl:grid-cols-3">
                        @foreach ($results as $r)
                            @php $tone = $r->detected ? 'aman' : ($running ? 'accent' : 'awas'); @endphp
                            <li wire:key="hasil-{{ $r->id }}">
                                <x-ui.card :tone="$tone" class="flex h-full flex-col p-3.5">
                                    <div class="flex items-start justify-between gap-3">
                                        <span class="min-w-0 text-sm font-medium leading-snug text-ink">{{ \App\Readiness\ScenarioCatalog::SCENARIOS[$r->scenario]['nama'] ?? $r->scenario }}</span>
                                        <span class="shrink-0">@include('livewire.readiness.partials.hasil')</span>
                                    </div>
                                    <p class="mt-2 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs text-ink-3">
                                        <span class="chip text-ink">{{ $r->rule->code }}</span>
                                        <span class="text-ink-2">{{ $r->rule->name }}</span>
                                        @if ($r->rule->attack_id)<span class="chip border-accent/40 bg-accent/10 text-accent">{{ $r->rule->attack_id }}</span>@endif
                                    </p>
                                    @if ($r->note)
                                        <p class="mt-1.5 text-xs text-ink-3">{{ $r->note }}</p>
                                    @endif
                                    <div class="mt-auto pt-3">
                                        <div class="flex items-center justify-between gap-2 text-xs">
                                            <span class="flex items-center gap-1 text-ink-3"><x-icon name="server" class="size-3.5" /><span class="data">{{ $r->agent?->hostname }}</span></span>
                                            <span class="data font-medium text-ink">{{ $r->ttd_ms !== null ? number_format($r->ttd_ms / 1000, 1, ',', '.').' dtk' : '—' }}</span>
                                        </div>
                                        <div class="mt-1.5 h-1 rounded-full bg-inset" aria-hidden="true">
                                            @if ($r->ttd_ms !== null)
                                                <div class="h-1 rounded-full bg-[#2F9DCB]" style="width: {{ max(2, round($r->ttd_ms / $ttdMaks * 100, 1)) }}%"></div>
                                            @endif
                                        </div>
                                    </div>
                                </x-ui.card>
                            </li>
                        @endforeach
                    </ul>
                </x-ui.panel>
            </div>
        @else
            <div class="panel"><x-ui.empty icon="target" title="Belum ada Uji Kesiapan.">Jalankan uji untuk satu satuan; hasil tiap skenario muncul di sini dalam hitungan detik.</x-ui.empty></div>
        @endif

        @if ($history->isNotEmpty())
            <x-ui.panel title="Riwayat" icon="history" heading-id="riwayat" :flush="true">
                <ul class="text-sm">
                    @foreach ($history as $h)
                        <li @class(['flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-line/70 px-4 py-2.5 last:border-b-0 sm:px-5', 'bg-raised/60' => $h->id === $run?->id]) wire:key="riwayat-{{ $h->id }}">
                            <button wire:click="show({{ $h->id }})" @class(['font-medium', 'text-ink' => $h->id === $run?->id, 'link' => $h->id !== $run?->id]) @if ($h->id === $run?->id) aria-current="true" @endif>Uji #{{ $h->id }}</button>
                            <span class="text-ink-3">{{ waktu_wib($h->started_at, 'd/m H:i') }} · {{ $h->unit?->name }}</span>
                            <span class="chip text-ink">{{ $h->detected_count }}/{{ $h->results_count }}</span>
                            <span class="text-ink-2">{{ $h->avg_ttd_ms !== null ? number_format($h->avg_ttd_ms / 1000, 1, ',', '.').' dtk rata-rata' : ($h->status->value === 'berjalan' ? 'berjalan' : '—') }}</span>
                            <span class="text-xs text-ink-3">{{ $h->starter?->name }}</span>
                        </li>
                    @endforeach
                </ul>
            </x-ui.panel>
        @endif
    </div>
</div>
