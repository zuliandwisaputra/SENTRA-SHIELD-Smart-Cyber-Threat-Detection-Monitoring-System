<div>
    <header class="border-b border-gray-800 bg-gray-900">
        <div class="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8 flex flex-wrap items-start justify-between gap-4">
            <div>
                <a href="{{ route('incidents.index') }}" wire:navigate class="text-xs text-gray-400 hover:underline">&larr; Daftar Insiden</a>
                <h2 class="mt-1 font-semibold text-xl text-gray-100 leading-tight break-words">#{{ $inc->id }} {{ $inc->title }}</h2>
                <p class="mt-1 text-sm text-gray-400">
                    {{ $inc->unit->name }}
                    @if ($inc->src_ip) · IP sumber <span class="font-mono text-gray-200">{{ $inc->src_ip }}</span> @endif
                    · {{ waktu_wib($inc->first_seen_at, 'd/m/Y H:i:s') }} s.d. {{ waktu_wib($inc->last_seen_at, 'H:i:s') }}
                </p>
                @if ($inc->campaign)
                    <p class="mt-2">
                        @can('lihat-kampanye')
                            <a href="{{ route('campaigns.show', $inc->campaign) }}" wire:navigate class="inline-flex items-center gap-1 rounded-full bg-red-900/60 px-2.5 py-0.5 text-xs font-semibold text-red-200 ring-1 ring-inset ring-red-700 hover:underline">Bagian dari Kampanye #{{ $inc->campaign->id }} · {{ $inc->campaign->unit_count }} satuan · skor ×1,3</a>
                        @else
                            <span class="inline-flex rounded-full bg-red-900/60 px-2.5 py-0.5 text-xs font-semibold text-red-200 ring-1 ring-inset ring-red-700">Bagian dari serangan lintas satuan · skor ×1,3</span>
                        @endcan
                    </p>
                @endif
            </div>
            <div class="flex items-center gap-3">
                <div class="text-right">
                    <div class="text-3xl font-bold text-gray-100" data-testid="skor">{{ $inc->score }}</div>
                    <x-severity-badge :severity="$inc->severity" />
                </div>
                <div>
                    <label for="status" class="block text-xs text-gray-500">Status</label>
                    @if ($canUpdateStatus)
                        <select id="status" wire:change="setStatus($event.target.value)" class="mt-1 rounded-md border-gray-700 bg-gray-950 text-gray-200 text-sm">
                            @foreach (\App\Enums\IncidentStatus::cases() as $s)
                                <option value="{{ $s->value }}" @selected($inc->status === $s)>{{ $s->label() }}</option>
                            @endforeach
                        </select>
                    @else
                        <div class="mt-1 text-sm text-gray-200">{{ $inc->status->label() }}</div>
                    @endif
                </div>
            </div>
        </div>
    </header>

    <div class="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 gap-6 lg:grid-cols-3">
        {{-- Attack Story --}}
        <section class="min-w-0 lg:col-span-2 bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6" aria-labelledby="attack-story">
            <h3 id="attack-story" class="text-base font-semibold text-gray-100">Attack Story</h3>
            <p class="text-xs text-gray-500">Alur serangan menurut tahap kill chain, dengan teknik MITRE ATT&amp;CK dan event buktinya.</p>

            <ol class="mt-5 relative border-s border-gray-700 ms-3 space-y-6">
                @foreach ($stages as $item)
                    @php $reached = $item['rules']->isNotEmpty(); @endphp
                    <li class="ms-6 min-w-0">
                        <span class="absolute -start-3 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-gray-900 {{ $reached ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-400' }} text-xs font-bold">{{ $item['stage']->order() }}</span>
                        <h4 class="font-semibold {{ $reached ? 'text-gray-100' : 'text-gray-500' }}">{{ $item['stage']->label() }}</h4>
                        @if (! $reached)
                            <p class="text-xs text-gray-600">Belum tercapai</p>
                        @endif
                        @foreach ($item['rules'] as $r)
                            <div class="mt-2 rounded-md border border-gray-800 bg-gray-950/60 p-3">
                                <div class="flex flex-wrap items-center gap-2">
                                    <span class="rounded bg-gray-800 px-1.5 py-0.5 font-mono text-xs text-gray-300">{{ $r->rule->code }}</span>
                                    <span class="font-medium text-gray-100">{{ $r->rule->name }}</span>
                                    <span class="text-xs text-gray-400 break-words">{{ $r->rule->attack_id }} {{ $r->rule->attack_name }}</span>
                                </div>
                                <div class="mt-1 text-xs text-gray-400 break-words">
                                    {{ waktu_wib(\Illuminate\Support\Carbon::parse($r->pertama), 'H:i:s') }} ·
                                    <button wire:click="filterRule('{{ $r->rule->code }}')" class="text-emerald-400 hover:underline">{{ $r->jumlah }} deteksi</button> ·
                                    @if ($r->event_pertama)
                                        bukti pertama <a href="{{ route('events.show', $r->event_pertama) }}" class="whitespace-nowrap font-mono text-emerald-400 hover:underline">EV-{{ $r->event_pertama }}</a>
                                    @else
                                        dideteksi Core dari heartbeat yang hilang
                                    @endif
                                    @if ($r->atribusi === 'waktu' && $inc->src_ip)
                                        · <span class="rounded bg-yellow-900/60 px-1.5 py-0.5 text-yellow-300" title="Event FIM tidak memuat IP; dikaitkan ke insiden yang aktif pada waktu yang sama">Atribusi berdasarkan waktu</span>
                                    @endif
                                </div>
                            </div>
                        @endforeach
                    </li>
                @endforeach
            </ol>
        </section>

        {{-- Rincian skor --}}
        <section class="min-w-0 bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6" aria-labelledby="rincian-skor">
            <h3 id="rincian-skor" class="text-base font-semibold text-gray-100">Rincian skor</h3>
            <p class="text-xs text-gray-500">S = (Σ bobot aturan unik + 20·(T−1)) × m<sub>aset</sub> × m<sub>kampanye</sub></p>
            <ul class="mt-4 space-y-1.5 text-sm">
                @foreach ($breakdown['aturan'] ?? [] as $a)
                    <li class="flex justify-between gap-3"><span class="text-gray-300"><span class="font-mono text-xs text-gray-500">{{ $a['kode'] }}</span> {{ $a['label'] }}</span><span class="font-mono text-gray-100">+{{ $a['poin'] }}</span></li>
                @endforeach
                @if (($breakdown['tahap']['jumlah'] ?? 0) > 0)
                    <li class="flex justify-between gap-3"><span class="text-gray-300">{{ $breakdown['tahap']['jumlah'] }} tahap kill chain tercapai (20 × {{ max(0, $breakdown['tahap']['jumlah'] - 1) }})</span><span class="font-mono text-gray-100">+{{ $breakdown['tahap']['poin'] }}</span></li>
                @endif
                <li class="flex justify-between gap-3 border-t border-gray-800 pt-1.5"><span class="text-gray-400">Subtotal</span><span class="font-mono text-gray-100">{{ $breakdown['subtotal'] ?? 0 }}</span></li>
                @isset($breakdown['pengali_aset'])
                    <li class="flex justify-between gap-3"><span class="text-gray-300">Aset: {{ $breakdown['pengali_aset']['label'] }}{{ $breakdown['pengali_aset']['host'] ? ' ('.$breakdown['pengali_aset']['host'].')' : '' }}</span><span class="font-mono text-gray-100">× {{ str_replace('.', ',', (string) $breakdown['pengali_aset']['nilai']) }}</span></li>
                    <li class="flex justify-between gap-3"><span class="text-gray-300">Kampanye lintas satuan{{ $breakdown['pengali_kampanye']['aktif'] ? '' : ' (tidak ada)' }}</span><span class="font-mono text-gray-100">× {{ str_replace('.', ',', (string) $breakdown['pengali_kampanye']['nilai']) }}</span></li>
                @endisset
                <li class="flex justify-between gap-3 border-t border-gray-700 pt-2 text-base"><span class="font-semibold text-gray-100">Total</span><span class="font-mono font-bold text-gray-100">{{ $inc->score }} · {{ $inc->severity->label() }}</span></li>
            </ul>
            @isset($breakdown['rumus'])
                <p class="mt-3 font-mono text-xs text-gray-500">{{ $breakdown['rumus'] }}</p>
            @endisset
            <p class="mt-3 text-xs text-gray-500">Rendah 0–39 · Sedang 40–79 · Tinggi 80–149 · Kritis 150+</p>
        </section>

        {{-- Garis waktu (audit log insiden) --}}
        @if ($timeline->isNotEmpty())
            <section class="min-w-0 lg:col-span-3 bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6" aria-labelledby="garis-waktu">
                <h3 id="garis-waktu" class="text-base font-semibold text-gray-100">Garis waktu</h3>
                <ol class="mt-3 space-y-1.5 text-sm">
                    @foreach ($timeline as $log)
                        <li class="flex gap-3" wire:key="tl-{{ $log->id }}">
                            <span class="shrink-0 font-mono text-xs text-gray-500">{{ waktu_wib($log->created_at, 'H:i:s') }}</span>
                            <span class="text-gray-200">{{ \App\Support\TimelineText::describe($log) }}</span>
                        </li>
                    @endforeach
                </ol>
            </section>
        @endif

        {{-- Respons berjenjang --}}
        <section class="min-w-0 lg:col-span-3 bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6" aria-labelledby="tindakan">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
                <h3 id="tindakan" class="text-base font-semibold text-gray-100">Tindakan respons</h3>
                <p class="text-xs text-gray-500">Operator/Analis mengusulkan, Komandan menyetujui, agent mengeksekusi di firewall host.</p>
            </div>

            @if ($flash)
                <div class="mt-3 rounded-md border border-emerald-800 bg-emerald-950/60 px-3 py-2 text-sm text-emerald-200" role="status">{{ $flash }}</div>
            @endif
            @error('blokir')
                <div class="mt-3 rounded-md border border-red-800 bg-red-950/60 px-3 py-2 text-sm text-red-200" role="alert">{{ $message }}</div>
            @enderror

            @if ($canPropose)
                <form wire:submit="proposeBlock" class="mt-4 flex flex-wrap items-end gap-3">
                    <div>
                        <label for="durasi" class="block text-xs text-gray-400">Blokir IP <span class="font-mono text-gray-200">{{ $inc->src_ip }}</span> di semua agent {{ $inc->unit->name }} selama</label>
                        <select id="durasi" wire:model="duration" class="mt-1 rounded-md border-gray-700 bg-gray-950 text-sm text-gray-200">
                            @foreach (\App\Response\ActionService::DURATIONS as $seconds => $label)
                                <option value="{{ $seconds }}">{{ $label }}</option>
                            @endforeach
                        </select>
                    </div>
                    <x-primary-button>Usulkan blokir IP</x-primary-button>
                </form>
            @endif

            @if ($actions->isNotEmpty())
                <div class="mt-4 overflow-x-auto">
                    <table class="min-w-full text-sm">
                        <thead class="text-left text-xs uppercase tracking-wide text-gray-500">
                            <tr><th class="py-2 pe-3">Tindakan</th><th class="py-2 pe-3">Agent</th><th class="py-2 pe-3">Status</th><th class="py-2 pe-3">Pengusul / pemutus</th><th class="py-2 pe-3">Hasil agent</th><th class="py-2"></th></tr>
                        </thead>
                        <tbody class="divide-y divide-gray-800">
                            @foreach ($actions as $a)
                                <tr wire:key="tindakan-{{ $a->id }}">
                                    <td class="py-2 pe-3 whitespace-nowrap text-gray-200">{{ $a->type->label() }} <span class="font-mono">{{ $a->params['ip'] ?? '' }}</span></td>
                                    <td class="py-2 pe-3 text-gray-300">{{ $a->targetAgent->hostname }}</td>
                                    <td class="py-2 pe-3"><x-action-status :status="$a->status" />
                                        @if ($a->expires_at && $a->status === \App\Enums\ActionStatus::Dieksekusi)
                                            <div class="mt-0.5 text-xs text-gray-500">s.d. {{ waktu_wib($a->expires_at, 'H:i:s') }}</div>
                                        @endif
                                    </td>
                                    <td class="py-2 pe-3 text-xs text-gray-400">{{ $a->proposer?->name ?? 'Sistem' }}<br>{{ $a->approver?->name ?? '—' }}@if ($a->decision_note) · “{{ $a->decision_note }}”@endif</td>
                                    <td class="py-2 pe-3 text-xs text-gray-300">{{ $a->result['message'] ?? '—' }}</td>
                                    <td class="py-2 text-right whitespace-nowrap">
                                        @can('cancel', $a)
                                            <button wire:click="cancelProposal('{{ $a->group_uuid }}')" class="text-xs text-gray-300 hover:underline">Batalkan usulan</button>
                                        @endcan
                                        @can('rollback', $a)
                                            <button wire:click="rollback({{ $a->id }})" wire:confirm="Buka blokir {{ $a->params['ip'] ?? '' }} di {{ $a->targetAgent->hostname }}?" class="text-xs font-semibold text-yellow-300 hover:underline">Buka blokir</button>
                                        @endcan
                                    </td>
                                </tr>
                            @endforeach
                        </tbody>
                    </table>
                </div>
                @can('putuskan-tindakan')
                    @if ($actions->contains(fn ($a) => $a->status === \App\Enums\ActionStatus::Diusulkan))
                        <a href="{{ route('approvals') }}" wire:navigate class="mt-3 inline-block text-sm font-semibold text-sky-300 hover:underline">Putuskan di Antrean Persetujuan &rarr;</a>
                    @endif
                @endcan
            @elseif (! $canPropose)
                <p class="mt-3 text-sm text-gray-500">Belum ada tindakan untuk insiden ini.</p>
            @endif
        </section>

        {{-- LAPSIT (FR-12) --}}
        <section class="min-w-0 lg:col-span-3 bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6" aria-labelledby="lapsit" @if ($lapsitPending) wire:poll.3s @endif>
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 id="lapsit" class="text-base font-semibold text-gray-100">LAPSIT</h3>
                    <p class="text-xs text-gray-500">Laporan Situasi disusun LLM lokal dari fakta insiden (setiap temuan mengutip event bukti), atau dari template bila LLM tidak tersedia.</p>
                </div>
                @if ($canLapsit)
                    <x-primary-button type="button" wire:click="createReport" wire:loading.attr="disabled" wire:target="createReport" :disabled="$lapsitPending">Buat LAPSIT</x-primary-button>
                @endif
            </div>
            @if ($lapsitPending)
                <div class="mt-3 flex items-center gap-2 rounded-md border border-sky-800 bg-sky-950/60 px-3 py-2 text-sm text-sky-200" role="status" data-testid="lapsit-disusun">
                    <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" class="opacity-25"/><path d="M22 12a10 10 0 0 0-10-10" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>
                    Menyusun LAPSIT… paling lama {{ \App\Reports\OllamaWriter::timeout() }} detik; bila LLM tidak menjawab, template dipakai.
                </div>
            @endif
            @error('lapsit')
                <div class="mt-3 rounded-md border border-red-800 bg-red-950/60 px-3 py-2 text-sm text-red-200" role="alert">{{ $message }}</div>
            @enderror

            @if ($reports->isEmpty())
                @unless ($lapsitPending)
                    <p class="mt-3 text-sm text-gray-500">Belum ada LAPSIT untuk insiden ini.</p>
                @endunless
            @else
                <ul class="mt-4 space-y-3">
                    @foreach ($reports as $r)
                        <li class="rounded-md border border-gray-800 bg-gray-950/50 p-3" wire:key="lapsit-{{ $r->id }}">
                            <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
                                <span class="font-mono text-sm text-gray-100">{{ $r->number() }}</span>
                                @if ($r->generator === \App\Enums\ReportGenerator::Llm)
                                    <span class="rounded-full bg-violet-900/60 px-2 py-0.5 text-xs font-semibold text-violet-200 ring-1 ring-inset ring-violet-700">LLM lokal · draf</span>
                                @else
                                    <span class="rounded-full bg-gray-800 px-2 py-0.5 text-xs font-semibold text-gray-300 ring-1 ring-inset ring-gray-600">Template</span>
                                @endif
                                <span class="text-xs text-gray-400">{{ waktu_wib($r->created_at, 'd/m/Y H:i:s') }} · {{ $r->creator?->name ?? 'Sistem' }}</span>
                                @if ($canLapsit && $r->pdf_path)
                                    <a href="{{ route('reports.pdf', $r) }}" class="ms-auto text-sm font-semibold text-emerald-400 hover:underline">Unduh PDF</a>
                                @endif
                            </div>
                            <div class="mt-1 break-all font-mono text-[11px] text-gray-500">SHA-256 PDF: {{ $r->sha256 ?? '—' }}</div>
                            <details class="mt-2" @if ($loop->first) open @endif>
                                <summary class="cursor-pointer select-none text-xs text-gray-400 hover:text-gray-200">Baca LAPSIT</summary>
                                <pre class="mt-2 max-h-[32rem] overflow-auto whitespace-pre-wrap break-words rounded bg-gray-950 p-3 font-sans text-sm leading-relaxed text-gray-200">{!! preg_replace_callback('/\[EV-(\d+)\]/', fn ($m) => '<a href="'.route('events.show', (int) $m[1]).'" class="text-emerald-400 hover:underline">[EV-'.$m[1].']</a>', e($r->content)) !!}</pre>
                                <div class="mt-1 break-all font-mono text-[11px] text-gray-500">SHA-256 isi (tercetak di kaki halaman PDF): {{ $r->contentHash() }}</div>
                            </details>
                        </li>
                    @endforeach
                </ul>
            @endif
        </section>

        {{-- Bukti --}}
        <section class="min-w-0 lg:col-span-3 bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6" aria-labelledby="bukti">
            <div class="flex flex-wrap items-baseline justify-between gap-2">
                <h3 id="bukti" class="text-base font-semibold text-gray-100">Event bukti</h3>
                @if ($ruleFilter !== '')
                    <button wire:click="filterRule('{{ $ruleFilter }}')" class="text-xs text-emerald-400 hover:underline">Hanya {{ $ruleFilter }} · tampilkan semua</button>
                @endif
            </div>
            <div class="mt-3 overflow-x-auto">
                <table class="min-w-full text-sm">
                    <thead class="text-left text-xs uppercase tracking-wide text-gray-500">
                        <tr><th class="py-2 pe-4">Waktu</th><th class="py-2 pe-4">Bukti</th><th class="py-2 pe-4">Aturan</th><th class="py-2 pe-4">Sumber</th><th class="py-2">Ringkasan</th></tr>
                    </thead>
                    <tbody class="divide-y divide-gray-800">
                        @foreach ($evidence as $d)
                            <tr wire:key="det-{{ $d->id }}">
                                <td class="py-2 pe-4 whitespace-nowrap text-gray-400">{{ waktu_wib($d->event?->occurred_at ?? $d->detected_at, 'H:i:s') }}</td>
                                <td class="py-2 pe-4">@if ($d->event_id)<a href="{{ route('events.show', $d->event_id) }}" class="font-mono text-emerald-400 hover:underline">EV-{{ $d->event_id }}</a>@else<span class="text-xs text-gray-500">Core</span>@endif</td>
                                <td class="py-2 pe-4 whitespace-nowrap text-gray-300"><span class="font-mono text-xs">{{ $d->rule->code }}</span> {{ $d->rule->name }}</td>
                                <td class="py-2 pe-4 text-gray-400">{{ $d->event?->source->label() ?? 'Heartbeat' }}</td>
                                <td class="py-2 text-gray-300"><span class="line-clamp-2 break-all" title="{{ $d->event?->summary() }}">{{ $d->event?->summary() ?? 'Heartbeat agent '.($d->agent?->hostname ?? '').' hilang lebih dari ambang' }}</span></td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
            <div class="mt-3">{{ $evidence->links() }}</div>
        </section>
    </div>
</div>
