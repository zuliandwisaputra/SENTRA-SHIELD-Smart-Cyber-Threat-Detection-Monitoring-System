<div>
    <header class="border-b border-gray-800 bg-gray-900">
        <div class="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8">
            <h2 class="font-semibold text-xl text-gray-100 leading-tight">Audit Log</h2>
            <p class="mt-1 text-xs text-gray-500">Setiap baris menyimpan hash SHA-256 dari isinya ditambah hash baris sebelumnya. Mengubah atau menghapus satu baris langsung di database memutus rantai.</p>
        </div>
    </header>

    <div class="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
        {{-- Verifikasi rantai --}}
        <section class="rounded-lg border border-gray-800 bg-gray-900 p-4" aria-labelledby="verifikasi-judul">
            <div class="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h3 id="verifikasi-judul" class="text-base font-semibold text-gray-100">Verifikasi Rantai</h3>
                    <p class="text-xs text-gray-500">{{ number_format($total, 0, ',', '.') }} baris tercatat. Verifikasi menghitung ulang hash seluruh baris dari yang pertama.</p>
                </div>
                @if ($canVerify)
                    <x-primary-button type="button" wire:click="verify" wire:loading.attr="disabled" wire:target="verify">
                        <span wire:loading.remove wire:target="verify">Verifikasi Rantai</span>
                        <span wire:loading wire:target="verify">Memeriksa…</span>
                    </x-primary-button>
                @endif
            </div>

            @if ($verification)
                @if ($verification['ok'])
                    <div class="mt-3 rounded-md border border-emerald-700 bg-emerald-950/60 p-3 text-sm text-emerald-200" role="status" data-testid="hasil-verifikasi">
                        <strong>Rantai utuh.</strong> {{ number_format($verification['checked'], 0, ',', '.') }} baris diperiksa, semua hash cocok.
                        <span class="text-xs text-emerald-400/80">({{ waktu_wib(\Illuminate\Support\Carbon::parse($verification['at']), 'H:i:s') }})</span>
                    </div>
                @else
                    <div class="mt-3 rounded-md border border-red-600 bg-red-950/70 p-3 text-sm text-red-200" role="alert" data-testid="hasil-verifikasi">
                        <strong>Rantai RUSAK mulai baris #{{ $verification['broken_id'] }}:</strong> {{ $verification['reason'] }}.
                        {{ number_format($verification['checked'], 0, ',', '.') }} baris sebelumnya utuh.
                        <button type="button" wire:click="showRow({{ $verification['broken_id'] }})" class="ms-1 font-semibold text-red-100 underline">Lihat baris #{{ $verification['broken_id'] }}</button>
                    </div>
                @endif
            @endif
        </section>

        {{-- Filter --}}
        <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:items-end">
            <div>
                <x-input-label for="f-aksi" value="Aksi" />
                <select wire:model.live="aksi" id="f-aksi" class="mt-1 block w-full rounded-md border-gray-700 bg-gray-950 text-sm text-gray-200">
                    <option value="">Semua aksi</option>
                    @foreach ($actions as $a)
                        <option value="{{ $a }}">{{ ucfirst(str_replace('_', ' ', $a)) }}</option>
                    @endforeach
                </select>
            </div>
            <div>
                <x-input-label for="f-pengguna" value="Pengguna" />
                <select wire:model.live="pengguna" id="f-pengguna" class="mt-1 block w-full rounded-md border-gray-700 bg-gray-950 text-sm text-gray-200">
                    <option value="">Semua pengguna</option>
                    <option value="{{ \App\Livewire\Audit\AuditLogPage::SYSTEM_USER }}">Sistem / agent</option>
                    @foreach ($users as $u)
                        <option value="{{ $u->id }}">{{ $u->name }}</option>
                    @endforeach
                </select>
            </div>
            <div>
                <x-input-label for="f-dari" value="Dari tanggal (WIB)" />
                <input type="date" wire:model.live="dari" id="f-dari" class="mt-1 block w-full rounded-md border-gray-700 bg-gray-950 text-sm text-gray-200 [color-scheme:dark]">
            </div>
            <div>
                <x-input-label for="f-sampai" value="Sampai tanggal (WIB)" />
                <input type="date" wire:model.live="sampai" id="f-sampai" class="mt-1 block w-full rounded-md border-gray-700 bg-gray-950 text-sm text-gray-200 [color-scheme:dark]">
            </div>
            <div>
                @if ($aksi !== '' || $pengguna !== '' || $dari !== '' || $sampai !== '' || $baris)
                    <button type="button" wire:click="resetFilters" class="text-sm text-gray-400 underline hover:text-gray-200">Hapus filter</button>
                @endif
            </div>
        </div>
        @if ($baris)
            <p class="text-xs text-gray-400">Menampilkan baris sekitar #{{ $baris }}.</p>
        @endif

        @php $brokenId = $verification['broken_id'] ?? null; @endphp

        {{-- Layar kecil: kartu --}}
        <ul class="divide-y divide-gray-800 rounded-lg border border-gray-800 bg-gray-900 md:hidden">
            @forelse ($logs as $log)
                @php [$label, $url] = \App\Livewire\Audit\AuditLogPage::subject($log); @endphp
                <li class="p-3 {{ $log->id === $brokenId ? 'bg-red-950/70 ring-1 ring-inset ring-red-600' : '' }}" wire:key="audit-hp-{{ $log->id }}">
                    <div class="flex items-baseline justify-between gap-2">
                        <span class="text-sm font-medium text-gray-100">{{ ucfirst(str_replace('_', ' ', $log->action)) }}</span>
                        <span class="shrink-0 font-mono text-xs text-gray-500">#{{ $log->id }}</span>
                    </div>
                    <div class="mt-0.5 text-xs text-gray-400">{{ waktu_wib($log->created_at, 'd/m/Y H:i:s') }} · {{ $log->user?->name ?? 'Sistem' }} ·
                        @if ($url)<a href="{{ $url }}" wire:navigate class="text-emerald-400 hover:underline">{{ $label }}</a>@else{{ $label }}@endif
                    </div>
                    @if ($log->data)
                        <div class="mt-1 break-words text-xs text-gray-300">{{ \App\Livewire\Audit\AuditLogPage::details($log->data) }}</div>
                    @endif
                    <div class="mt-1 font-mono text-[11px] text-gray-500" title="hash {{ $log->hash }}">hash {{ substr($log->hash, 0, 16) }}…</div>
                </li>
            @empty
                <li class="p-4 text-gray-500">Tidak ada baris audit.</li>
            @endforelse
        </ul>

        <div class="hidden overflow-x-auto rounded-lg border border-gray-800 bg-gray-900 md:block">
            <table class="min-w-full text-sm">
                <thead class="border-b border-gray-800 text-left text-xs uppercase tracking-wide text-gray-500">
                    <tr>
                        <th class="px-3 py-3">#</th><th class="px-3 py-3">Waktu (WIB)</th><th class="px-3 py-3">Pengguna</th>
                        <th class="px-3 py-3">Aksi</th><th class="px-3 py-3">Objek</th><th class="px-3 py-3">Rincian</th><th class="px-3 py-3">Hash</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-800">
                    @forelse ($logs as $log)
                        @php [$label, $url] = \App\Livewire\Audit\AuditLogPage::subject($log); @endphp
                        <tr wire:key="audit-{{ $log->id }}" class="{{ $log->id === $brokenId ? 'bg-red-950/70 ring-1 ring-inset ring-red-600' : '' }}" @if ($log->id === $brokenId) data-testid="baris-rusak" @endif>
                            <td class="px-3 py-2 font-mono text-gray-500">{{ $log->id }}</td>
                            <td class="whitespace-nowrap px-3 py-2 font-mono text-xs text-gray-300">{{ waktu_wib($log->created_at, 'd/m/Y H:i:s.v') }}</td>
                            <td class="whitespace-nowrap px-3 py-2 text-gray-300">{{ $log->user?->name ?? 'Sistem' }}</td>
                            <td class="whitespace-nowrap px-3 py-2 text-gray-100">{{ ucfirst(str_replace('_', ' ', $log->action)) }}</td>
                            <td class="whitespace-nowrap px-3 py-2 text-xs">
                                @if ($url)<a href="{{ $url }}" wire:navigate class="text-emerald-400 hover:underline">{{ $label }}</a>@else<span class="text-gray-400">{{ $label }}</span>@endif
                            </td>
                            <td class="min-w-64 max-w-md px-3 py-2 text-xs text-gray-300"><div class="line-clamp-3 break-words" title="{{ \App\Livewire\Audit\AuditLogPage::details($log->data) }}">{{ \App\Livewire\Audit\AuditLogPage::details($log->data) ?: '—' }}</div></td>
                            <td class="whitespace-nowrap px-3 py-2 font-mono text-[11px] leading-4 text-gray-500">
                                <div title="hash {{ $log->hash }}">{{ substr($log->hash, 0, 12) }}…</div>
                                <div class="text-gray-600" title="hash sebelumnya {{ $log->prev_hash }}">← {{ substr($log->prev_hash, 0, 12) }}…</div>
                            </td>
                        </tr>
                    @empty
                        <tr><td colspan="7" class="px-3 py-6 text-gray-500">Tidak ada baris audit.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        {{ $logs->links() }}
    </div>
</div>
