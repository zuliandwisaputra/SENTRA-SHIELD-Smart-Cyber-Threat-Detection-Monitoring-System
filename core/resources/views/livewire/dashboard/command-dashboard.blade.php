@php
    use App\Enums\AlertLevel;
    use App\Enums\Severity;

    // Tingkat Siaga keseluruhan = tertinggi di pohon satuan yang boleh dilihat (sama dengan aturan satuan induk).
    $tingkat = $tree->isEmpty() ? null : AlertLevel::highest(...$tree->map->effectiveAlertLevel()->all());
    $semua = collect();
    $kumpulkan = function ($units) use (&$kumpulkan, $semua) {
        foreach ($units as $u) {
            $semua->push($u);
            $kumpulkan($u->children);
        }
    };
    $kumpulkan($tree);
    $sumber = $tingkat && $tingkat !== AlertLevel::Aman ? $semua->filter(fn ($u) => $u->alert_level === $tingkat)->pluck('name') : collect();

    $papan = [
        'aman' => ['ikon' => 'shield-check', 'teks' => 'text-aman', 'garis' => 'bg-aman', 'nyala' => 'bg-aman text-[#07101A]'],
        'waspada' => ['ikon' => 'eye', 'teks' => 'text-waspada', 'garis' => 'bg-waspada', 'nyala' => 'bg-waspada text-[#07101A]'],
        'siaga' => ['ikon' => 'triangle-alert', 'teks' => 'text-siaga', 'garis' => 'bg-siaga', 'nyala' => 'bg-siaga text-[#07101A]'],
        'awas' => ['ikon' => 'siren', 'teks' => 'text-awas', 'garis' => 'bg-awas', 'nyala' => 'bg-awas text-[#07101A]'],
    ];
    $ikonSumber = ['web' => 'globe', 'ssh' => 'terminal', 'firewall' => 'shield', 'fim' => 'file-lock', 'modbus' => 'factory', 'site' => 'scan-search'];
    $garisSeverity = ['rendah' => 'bg-aman', 'sedang' => 'bg-waspada', 'tinggi' => 'bg-siaga', 'kritis' => 'bg-awas'];
    $agentLain = max(0, $agentTotal - $agentOnline - $agentBlind);
@endphp
<div>
    <x-ui.page-header title="Beranda Komando" icon="layout-dashboard">
        Semua angka dihitung dari event asli. Klik angka untuk melihat datanya.
        <x-slot:actions>
            <span class="inline-flex items-center gap-1.5 font-mono text-xs text-ink-3" title="Waktu data di halaman ini dihitung">
                <x-icon name="clock" class="size-3.5" />Diperbarui {{ waktu_wib(now(), 'H:i:s') }}
            </span>
        </x-slot:actions>
    </x-ui.page-header>

    <div class="mx-auto max-w-[1440px] space-y-4 px-4 py-6 sm:px-6 lg:px-8">
        <div class="grid gap-4 xl:grid-cols-12">
            {{-- Papan Tingkat Siaga: elemen terbesar di layar, terbaca dari proyektor. --}}
            <section class="panel relative min-w-0 overflow-hidden xl:col-span-5" aria-labelledby="judul-siaga" data-testid="tingkat-keseluruhan">
                @if ($tingkat)
                    @php $p = $papan[$tingkat->value]; @endphp
                    <div class="absolute inset-x-0 top-0 h-1 {{ $p['garis'] }}" aria-hidden="true"></div>
                    <div class="p-5 sm:p-6" role="status" aria-live="polite" aria-atomic="true">
                        <div class="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                            <h3 id="judul-siaga" class="text-sm font-medium text-ink-2">Tingkat Siaga keseluruhan</h3>
                            <span class="text-xs text-ink-3">{{ $tree->pluck('name')->join(', ') }}</span>
                        </div>
                        <div class="mt-4 flex items-center gap-4 sm:gap-5">
                            <x-icon :name="$p['ikon']" stroke="1.5" class="size-12 sm:size-16 {{ $p['teks'] }}" />
                            <p class="num text-[64px] uppercase tracking-[0.06em] sm:text-[88px] {{ $p['teks'] }}">{{ $tingkat->label() }}</p>
                        </div>
                        <p class="mt-3 text-[15px] text-ink-2">
                            @if ($sumber->isNotEmpty())
                                Tertinggi di <span class="font-semibold text-ink">{{ $sumber->join(', ') }}</span>
                                · {{ $openCount }} insiden terbuka
                            @else
                                Semua satuan Aman · {{ $openCount }} insiden terbuka
                            @endif
                        </p>
                        {{-- Tangga empat lampu: posisi dan teks menyampaikan tingkat, bukan warna saja. --}}
                        <ol class="mt-5 grid grid-cols-4 gap-1.5" aria-label="Skala Tingkat Siaga">
                            @foreach (AlertLevel::cases() as $lv)
                                @php $nyala = $lv === $tingkat; @endphp
                                <li @class([
                                    'rounded-control px-1 py-2 text-center font-display text-[13px] font-semibold uppercase tracking-[0.08em] sm:text-sm',
                                    $papan[$lv->value]['nyala'] => $nyala,
                                    'bg-inset text-ink-3' => ! $nyala,
                                ]) @if ($nyala) aria-current="true" @endif>
                                    @unless ($nyala)<span class="mx-auto mb-1.5 block h-0.5 w-6 rounded-full opacity-50 {{ $papan[$lv->value]['garis'] }}" aria-hidden="true"></span>@endunless
                                    @if ($nyala)<span class="mx-auto mb-1.5 block h-0.5 w-6 rounded-full bg-[#07101A]/40" aria-hidden="true"></span>@endif
                                    {{ $lv->label() }}
                                </li>
                            @endforeach
                        </ol>
                    </div>
                @else
                    <h3 id="judul-siaga" class="sr-only">Tingkat Siaga keseluruhan</h3>
                    <x-ui.empty icon="building-2" title="Belum ada satuan yang bisa Anda lihat">Hubungi Admin untuk menautkan akun ke satuan.</x-ui.empty>
                @endif
            </section>

            {{-- Metrik: satu panel, tiga sel. --}}
            <section class="panel grid min-w-0 divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0 xl:col-span-7" aria-label="Metrik utama">
                <x-ui.kpi :bare="true" label="Insiden terbuka" :value="$openCount" icon="siren" :href="route('incidents.index')" data-testid="kartu-insiden">
                    @if ($openCount > 0)
                        <div class="flex h-2 gap-0.5" aria-hidden="true">
                            @foreach ($bySeverity as $sev => $n)
                                @if ($n > 0)<span class="rounded-full {{ $garisSeverity[$sev] }}" style="flex-grow: {{ $n }}"></span>@endif
                            @endforeach
                        </div>
                        <div class="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1.5">
                            @foreach ($bySeverity as $sev => $n)
                                @if ($n > 0)
                                    <span class="inline-flex items-center gap-1.5"><x-severity-badge :severity="Severity::from($sev)" /><span class="num text-base text-ink">{{ $n }}</span></span>
                                @endif
                            @endforeach
                        </div>
                    @else
                        <span class="inline-flex items-center gap-1.5 text-ink-3"><x-icon name="circle-check" class="size-4 text-aman" />Tidak ada insiden terbuka</span>
                    @endif
                </x-ui.kpi>

                <x-ui.kpi :bare="true" label="Agent online" :value="$agentOnline" :unit="'/ '.$agentTotal" icon="server" :href="$canSeeAgents ? route('units-agents') : null" data-testid="kartu-agent">
                    @if ($agentTotal > 0)
                        <div class="flex h-2 gap-0.5" aria-hidden="true">
                            @if ($agentOnline > 0)<span class="rounded-full bg-aman" style="flex-grow: {{ $agentOnline }}"></span>@endif
                            @if ($agentBlind > 0)<span class="rounded-full bg-awas" style="flex-grow: {{ $agentBlind }}"></span>@endif
                            @if ($agentLain > 0)<span class="rounded-full bg-line-strong" style="flex-grow: {{ $agentLain }}"></span>@endif
                        </div>
                    @endif
                    <p @class(['mt-3 flex items-center gap-1.5', 'font-semibold text-awas' => $agentBlind > 0, 'text-ink-3' => $agentBlind === 0])>
                        <x-icon :name="$agentBlind > 0 ? 'wifi-off' : 'circle-check'" @class(['size-4', 'text-aman' => $agentBlind === 0]) />
                        {{ $agentBlind > 0 ? $agentBlind.' agent BUTA (sensor mati)' : 'Tidak ada agent buta' }}
                    </p>
                    @if ($sourceWarnings > 0)
                        <p class="mt-1 flex items-center gap-1.5 font-semibold text-waspada"><x-icon name="triangle-alert" class="size-4" />{{ $sourceWarnings }} peringatan sumber log</p>
                    @endif
                </x-ui.kpi>

                <x-ui.kpi :bare="true" label="Blokir aktif" :value="$blockCount" icon="shield-ban" :href="route('actions.index', ['status' => 'aktif'])" data-testid="kartu-blokir">
                    <p class="flex items-center gap-1.5 {{ $blockCount > 0 ? 'text-ink-2' : 'text-ink-3' }}">
                        <x-icon name="{{ $blockCount > 0 ? 'ban' : 'shield' }}" class="size-4" />
                        {{ $blockCount > 0 ? $blockIps.' IP diblokir di firewall host agent' : 'Belum ada blokir aktif' }}
                    </p>
                </x-ui.kpi>
            </section>
        </div>

        <div class="grid gap-4 xl:grid-cols-12">
            <div class="min-w-0 space-y-4 xl:col-span-8">
                {{-- Grafik event per menit --}}
                <x-ui.panel title="Event per menit" icon="chart-column" heading-id="grafik-judul"
                    subtitle="{{ \App\Livewire\Dashboard\CommandDashboard::CHART_MINUTES }} menit terakhir · total {{ array_sum($series['counts']) }} event · WIB">
                    <div class="h-56" wire:ignore x-data="grafikEvent(@js($series))">
                        <canvas x-ref="canvas" role="img" aria-label="Grafik batang jumlah event per menit selama {{ \App\Livewire\Dashboard\CommandDashboard::CHART_MINUTES }} menit terakhir"></canvas>
                    </div>
                    <details class="group mt-3 text-sm text-ink-2">
                        <summary class="inline-flex cursor-pointer select-none items-center gap-1 text-ink-3 hover:text-ink">
                            <x-icon name="chevron-right" class="size-4 transition-transform group-open:rotate-90" />Lihat sebagai tabel
                        </summary>
                        <table class="tbl mt-2 max-w-xs">
                            <thead><tr><th>Menit (WIB)</th><th>Event</th></tr></thead>
                            <tbody>
                                @foreach ($series['labels'] as $i => $label)
                                    @if ($series['counts'][$i] > 0)
                                        <tr><td class="data text-ink-2">{{ $label }}</td><td class="data text-ink">{{ $series['counts'][$i] }}</td></tr>
                                    @endif
                                @endforeach
                            </tbody>
                        </table>
                    </details>
                </x-ui.panel>

                {{-- Feed event live --}}
                <x-ui.panel title="Feed event live" icon="activity" heading-id="feed-judul" :flush="true">
                    <x-slot:actions><span class="text-xs text-ink-3">12 event terakhir · waktu WIB</span></x-slot:actions>
                    {{-- Baris baru (id di atas batas saat halaman dimuat) diberi animasi masuk. --}}
                    <ul class="text-sm" x-data="{ batas: {{ (int) $feed->max('id') }} }">
                        @forelse ($feed as $event)
                            @php
                                $sev = $event->detections->map(fn ($d) => $d->incident?->severity)->filter()->sortByDesc(fn ($s) => $s->rank())->first();
                            @endphp
                            <li class="relative flex flex-col gap-1 border-b border-line/70 px-4 py-2.5 last:border-b-0 sm:grid sm:grid-cols-[4rem_6.75rem_minmax(0,1fr)_auto] sm:items-center sm:gap-x-4 sm:px-5"
                                wire:key="feed-{{ $event->id }}" x-init="if ({{ $event->id }} > batas) $el.classList.add('animate-masuk')">
                                <span class="absolute inset-y-0 left-0 w-[3px] {{ $sev ? $garisSeverity[$sev->value] : '' }}" aria-hidden="true"></span>
                                <span class="font-mono text-xs text-ink-3" title="{{ waktu_wib($event->occurred_at) }}">{{ $event->occurred_at->copy()->setTimezone(config('sentra.display_timezone'))->format('H:i:s') }}</span>
                                <span class="flex items-center gap-1.5">
                                    <x-icon :name="$ikonSumber[$event->source->value] ?? 'activity'" class="size-4 text-ink-3" />
                                    <a href="{{ route('events.show', $event) }}" class="link whitespace-nowrap font-mono text-xs">EV-{{ $event->id }}</a>
                                </span>
                                <span class="min-w-0">
                                    <span class="block truncate text-ink" title="{{ $event->summary() }}">{{ $event->summary() }}</span>
                                    <span class="block truncate text-xs text-ink-3">{{ $event->unit->name }} · {{ $event->source->label() }}</span>
                                </span>
                                <span class="flex flex-wrap items-center gap-1.5 sm:justify-end">
                                    @foreach ($event->detections->pluck('rule.code')->unique() as $code)
                                        <span class="chip text-ink">{{ $code }}</span>
                                    @endforeach
                                    @if ($sev)<x-severity-badge :severity="$sev" />@endif
                                </span>
                            </li>
                        @empty
                            <li><x-ui.empty icon="radio" title="Belum ada event dari agent.">Event muncul di sini begitu agent di satuan mengirim telemetri.</x-ui.empty></li>
                        @endforelse
                    </ul>
                </x-ui.panel>
            </div>

            {{-- Pohon satuan sebagai topologi --}}
            <x-ui.panel title="Pohon Satuan & Tingkat Siaga" icon="network" heading-id="pohon-satuan" class="order-first xl:order-none xl:col-span-4 xl:self-start"
                subtitle="Dihitung dari insiden terbuka; satuan induk mengikuti tingkat tertinggi di bawahnya.">
                @if ($tree->isEmpty())
                    <p class="text-sm text-ink-2">Belum ada satuan yang bisa Anda lihat. Hubungi Admin.</p>
                @else
                    <ul class="topo" role="tree" aria-labelledby="pohon-satuan">
                        @foreach ($tree as $unit)
                            @include('partials.unit-node', ['unit' => $unit, 'depth' => 0])
                        @endforeach
                    </ul>
                @endif
            </x-ui.panel>
        </div>
    </div>
</div>
