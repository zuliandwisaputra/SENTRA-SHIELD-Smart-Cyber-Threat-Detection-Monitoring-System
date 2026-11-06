<div>
    <header class="border-b border-gray-800 bg-gray-900">
        <div class="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8">
            <h2 class="font-semibold text-xl text-gray-100 leading-tight">Penjaga Situs</h2>
            <p class="mt-1 text-xs text-gray-500">Setiap menit Core mengambil halaman situs satuan 3 kali: sebagai browser biasa, sebagai Googlebot, dan dengan referer Google. Isi yang berbeda dan memuat kata judi menandakan injeksi judi online ber-cloaking; halaman utama yang berubah di luar jadwal pembaruan menandakan defacement. Hanya situs terdaftar yang diperiksa.</p>
        </div>
    </header>

    <div class="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        @if ($flash)
            <div class="mb-4 rounded-md border border-emerald-800 bg-emerald-950/60 px-3 py-2 text-sm text-emerald-200" role="status">{{ $flash }}</div>
        @endif

        <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {{-- Daftar situs --}}
            <div class="min-w-0 space-y-6">
                <section class="rounded-lg border border-gray-800 bg-gray-900 p-4" aria-labelledby="daftar-situs">
                    <h3 id="daftar-situs" class="text-base font-semibold text-gray-100">Situs terdaftar</h3>
                    <ul class="mt-3 space-y-2">
                        @forelse ($sites as $s)
                            @php [$label, $color] = \App\Livewire\Sites\SiteWatchPage::status($latest[$s->id] ?? null); @endphp
                            <li wire:key="situs-{{ $s->id }}">
                                <button type="button" wire:click="select({{ $s->id }})" class="w-full rounded-md border px-3 py-2 text-left {{ $site?->id === $s->id ? 'border-emerald-700 bg-gray-950' : 'border-gray-800 hover:border-gray-600' }}">
                                    <div class="flex items-center justify-between gap-2">
                                        <span class="min-w-0 truncate font-mono text-sm text-gray-100">{{ $s->url }}</span>
                                        <span class="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset {{ $color }}">{{ $label }}</span>
                                    </div>
                                    <div class="mt-0.5 text-xs text-gray-500">{{ $s->unit->name }} · diperiksa {{ ($latest[$s->id] ?? collect())->isNotEmpty() ? waktu_wib($latest[$s->id]->first()->checked_at, 'H:i:s') : '—' }}</div>
                                </button>
                            </li>
                        @empty
                            <li class="text-sm text-gray-500">Belum ada situs terdaftar.</li>
                        @endforelse
                    </ul>
                </section>

                @if ($canManage)
                    <form wire:submit="add" class="space-y-3 rounded-lg border border-gray-800 bg-gray-900 p-4" aria-labelledby="tambah-situs">
                        <h3 id="tambah-situs" class="text-base font-semibold text-gray-100">Tambah situs</h3>
                        <div>
                            <x-input-label for="site-unit" value="Satuan" />
                            <select wire:model="unitId" id="site-unit" class="mt-1 block w-full rounded-md border-gray-700 bg-gray-950 text-sm text-gray-200">
                                <option value="">Pilih satuan</option>
                                @foreach ($units as $u)
                                    <option value="{{ $u->id }}">{{ $u->name }}</option>
                                @endforeach
                            </select>
                            <x-input-error :messages="$errors->get('unitId')" class="mt-1" />
                        </div>
                        <div>
                            <x-input-label for="site-url" value="URL halaman utama" />
                            <x-text-input wire:model="url" id="site-url" class="mt-1 block w-full font-mono text-sm" placeholder="http://kodim-a/" />
                            <x-input-error :messages="$errors->get('url')" class="mt-1" />
                        </div>
                        <div>
                            <x-input-label for="site-windows" value="Jadwal pembaruan resmi (WIB, opsional)" />
                            <x-text-input wire:model="windows" id="site-windows" class="mt-1 block w-full font-mono text-sm" placeholder="22:00-23:00" />
                            <p class="mt-1 text-xs text-gray-500">Perubahan halaman utama di dalam jadwal ini menjadi baseline baru, bukan peringatan.</p>
                            <x-input-error :messages="$errors->get('windows')" class="mt-1" />
                        </div>
                        <x-primary-button>Tambah situs</x-primary-button>
                    </form>
                @endif
            </div>

            {{-- Rincian situs terpilih --}}
            <div class="min-w-0 space-y-6 lg:col-span-2">
                @if ($site)
                    @php [$label, $color] = \App\Livewire\Sites\SiteWatchPage::status($checks); @endphp
                    <section class="rounded-lg border border-gray-800 bg-gray-900 p-4 sm:p-6" aria-labelledby="rincian-situs">
                        <div class="flex flex-wrap items-start justify-between gap-3">
                            <div class="min-w-0">
                                <h3 id="rincian-situs" class="break-all font-mono text-base font-semibold text-gray-100">{{ $site->url }}</h3>
                                <p class="text-xs text-gray-500">{{ $site->unit->name }} · jadwal pembaruan: {{ collect($site->update_windows ?? [])->map(fn ($w) => ($w['mulai'] ?? '?').'-'.($w['selesai'] ?? '?'))->implode(', ') ?: 'tidak ada' }}</p>
                                <p class="mt-1 break-all font-mono text-[11px] text-gray-500">baseline: {{ $site->baseline_hash ?? 'belum ada (dibuat pada pemeriksaan pertama)' }}</p>
                            </div>
                            <span class="rounded-full px-2.5 py-0.5 text-sm font-semibold ring-1 ring-inset {{ $color }}" data-testid="status-situs">{{ $label }}</span>
                        </div>
                        @if ($canManage)
                            <div class="mt-4 flex flex-wrap gap-3">
                                <x-primary-button type="button" wire:click="checkNow({{ $site->id }})" wire:loading.attr="disabled" wire:target="checkNow">Periksa sekarang</x-primary-button>
                                @if ($checks->firstWhere('variant', \App\Enums\SiteVariant::Browser)?->flagged)
                                    <button type="button" wire:click="acceptBaseline({{ $site->id }})" wire:confirm="Jadikan halaman saat ini sebagai baseline? Lakukan hanya bila perubahan memang resmi." class="rounded-md border border-yellow-700 px-3 py-1.5 text-sm text-yellow-200 hover:bg-yellow-950">Perubahan resmi: jadikan baseline</button>
                                @endif
                                <button type="button" wire:click="remove({{ $site->id }})" wire:confirm="Hapus {{ $site->url }} dari Penjaga Situs?" class="ms-auto text-sm text-red-400 hover:underline">Hapus situs</button>
                            </div>
                        @endif

                        @if ($incidents->isNotEmpty())
                            <p class="mt-4 text-sm text-gray-300">Insiden terkait:
                                @foreach ($incidents as $inc)
                                    <a href="{{ route('incidents.show', $inc) }}" wire:navigate class="ms-1 text-emerald-400 hover:underline">#{{ $inc->id }} {{ $inc->title }}</a>@if (! $loop->last),@endif
                                @endforeach
                            </p>
                        @endif

                        {{-- Perbandingan tiga varian --}}
                        @if ($checks->isNotEmpty())
                            <h4 class="mt-6 text-sm font-semibold text-gray-200">Hasil pemeriksaan per varian · {{ waktu_wib($checks->first()->checked_at, 'd/m/Y H:i:s') }}</h4>
                            <div class="mt-3 grid grid-cols-1 gap-3 md:grid-cols-3">
                                @foreach ($checks as $c)
                                    <div class="min-w-0 rounded-md border p-3 {{ $c->flagged ? 'border-red-700 bg-red-950/30' : 'border-gray-800 bg-gray-950/50' }}" wire:key="varian-{{ $c->id }}" data-testid="varian-{{ $c->variant->value }}">
                                        <div class="flex items-center justify-between gap-2">
                                            <span class="text-sm font-semibold text-gray-100">{{ $c->variant->label() }}</span>
                                            @if ($c->flagged)
                                                <span class="rounded-full bg-red-800 px-2 py-0.5 text-xs font-semibold text-white">Ditandai</span>
                                            @endif
                                        </div>
                                        <dl class="mt-2 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                                            <dt class="text-gray-500">HTTP</dt><dd class="font-mono text-gray-200">{{ $c->http_status ?? '—' }}</dd>
                                            <dt class="text-gray-500">Kemiripan</dt><dd class="font-mono text-gray-200">{{ $c->similarity !== null ? round($c->similarity * 100).'%' : '—' }}</dd>
                                            <dt class="text-gray-500">Kata judi</dt><dd class="font-mono text-gray-200">{{ $c->gambling_hits }}</dd>
                                            <dt class="text-gray-500">Hash</dt><dd class="truncate font-mono text-gray-400" title="{{ $c->hash }}">{{ $c->hash ? substr($c->hash, 0, 12).'…' : '—' }}</dd>
                                        </dl>
                                        @if ($c->keywords)
                                            <div class="mt-2 flex flex-wrap gap-1">
                                                @foreach ($c->keywords as $word => $n)
                                                    <span class="rounded bg-red-900/60 px-1.5 py-0.5 font-mono text-xs text-red-200">{{ $word }} ×{{ $n }}</span>
                                                @endforeach
                                            </div>
                                        @endif
                                        @if ($c->error)
                                            <p class="mt-2 text-xs text-yellow-300">{{ $c->error }}</p>
                                        @endif
                                        <div class="mt-2 max-h-56 overflow-auto rounded bg-gray-950 p-2 text-xs leading-relaxed text-gray-300">{!! \App\Livewire\Sites\SiteWatchPage::highlight($c->excerpt, $c->keywords) ?: '<span class="text-gray-600">(kosong)</span>' !!}</div>
                                    </div>
                                @endforeach
                            </div>
                        @else
                            <p class="mt-4 text-sm text-gray-500">Belum diperiksa. Pemeriksaan berjalan otomatis tiap menit.</p>
                        @endif
                    </section>

                    @if ($history->isNotEmpty())
                        <section class="rounded-lg border border-gray-800 bg-gray-900 p-4 sm:p-6" aria-labelledby="riwayat-situs">
                            <h3 id="riwayat-situs" class="text-base font-semibold text-gray-100">Riwayat pemeriksaan</h3>
                            <ul class="mt-3 divide-y divide-gray-800 text-sm">
                                @foreach ($history as $uuid => $group)
                                    @php [$hLabel, $hColor] = \App\Livewire\Sites\SiteWatchPage::status($group); @endphp
                                    <li class="flex flex-wrap items-center gap-3 py-1.5" wire:key="riwayat-{{ $uuid }}">
                                        <span class="font-mono text-xs text-gray-400">{{ waktu_wib($group->first()->checked_at, 'd/m H:i:s') }}</span>
                                        <span class="rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset {{ $hColor }}">{{ $hLabel }}</span>
                                        <span class="text-xs text-gray-500">{{ $group->map(fn ($c) => $c->variant->label().' '.($c->similarity !== null ? round($c->similarity * 100).'%' : '—'))->implode(' · ') }}</span>
                                    </li>
                                @endforeach
                            </ul>
                        </section>
                    @endif
                @else
                    <p class="rounded-lg border border-gray-800 bg-gray-900 p-6 text-gray-400">Pilih atau tambahkan situs.</p>
                @endif
            </div>
        </div>
    </div>
</div>
