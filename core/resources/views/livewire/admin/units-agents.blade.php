<div>
    <header class="border-b border-gray-800 bg-gray-900">
        <div class="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8">
            <h2 class="font-semibold text-xl text-gray-100 leading-tight">Satuan &amp; Agent</h2>
        </div>
    </header>

    <div class="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        @if ($newCode)
            <div class="rounded-lg border border-emerald-700 bg-emerald-950/60 p-4" role="alert">
                <p class="text-sm text-emerald-200">Kode pendaftaran untuk <strong>{{ $newCodeHostname }}</strong>. Kode hanya ditampilkan sekali, sekali pakai, dan berlaku 24 jam.</p>
                <p class="mt-2 font-mono text-lg tracking-wider text-white select-all" data-testid="kode-pendaftaran">{{ $newCode }}</p>
                <button wire:click="dismissCode" class="mt-3 text-xs text-emerald-300 underline">Sudah dicatat, tutup</button>
            </div>
        @endif

        {{-- Agent --}}
        <section class="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6" wire:poll.5s>
            <h3 class="text-base font-semibold text-gray-100">Agent</h3>
            <p class="mt-1 text-xs text-gray-500">Satu host = satu agent. Heartbeat diharapkan tiap 10 detik.</p>

            <div class="mt-4 overflow-x-auto">
                <table class="min-w-full text-sm">
                    <thead class="text-left text-xs uppercase tracking-wide text-gray-500">
                        <tr>
                            <th class="py-2 pe-4">Host</th>
                            <th class="py-2 pe-4">Satuan</th>
                            <th class="py-2 pe-4">Status</th>
                            <th class="py-2 pe-4">Heartbeat terakhir</th>
                            <th class="py-2 pe-4">Sumber log</th>
                            <th class="py-2 pe-4">Jenis aset</th>
                            @if ($canManage)<th class="py-2">Aksi</th>@endif
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-800">
                        @forelse ($agents as $agent)
                            <tr wire:key="agent-{{ $agent->id }}">
                                <td class="py-2 pe-4">
                                    <div class="font-medium text-gray-100">{{ $agent->hostname }}</div>
                                    <div class="text-xs text-gray-500">{{ $agent->ip ?? 'IP belum diketahui' }} · v{{ $agent->version ?? '—' }}</div>
                                </td>
                                <td class="py-2 pe-4 text-gray-300">{{ $agent->unit->name }}</td>
                                <td class="py-2 pe-4">
                                    <span class="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset {{ $agent->status->badgeClass() }}">{{ $agent->status->label() }}</span>
                                </td>
                                <td class="py-2 pe-4 text-gray-300">
                                    @if ($agent->last_heartbeat_at)
                                        <div>{{ $agent->last_heartbeat_at->diffForHumans() }}</div>
                                        <div class="text-xs text-gray-500">{{ waktu_wib($agent->last_heartbeat_at) }}</div>
                                    @else
                                        <span class="text-gray-500">Belum pernah</span>
                                    @endif
                                </td>
                                <td class="py-2 pe-4">
                                    <div class="flex flex-wrap gap-1">
                                        @forelse (collect($agent->sources ?? [])->reject(fn ($s) => ($s['status'] ?? '') === 'disabled') as $name => $source)
                                            <span title="{{ $source['detail'] ?? '' }}" class="rounded px-1.5 py-0.5 text-xs {{ ($source['status'] ?? '') === 'ok' ? 'bg-emerald-900/50 text-emerald-300' : 'bg-red-900/50 text-red-300' }}">{{ $name }}: {{ $source['status'] ?? '?' }}</span>
                                        @empty
                                            <span class="text-xs text-gray-500">—</span>
                                        @endforelse
                                    </div>
                                </td>
                                <td class="py-2 pe-4">
                                    @if ($canManage)
                                        <select wire:change="setAssetType({{ $agent->id }}, $event.target.value)" aria-label="Jenis aset {{ $agent->hostname }}" class="rounded-md border-gray-700 bg-gray-950 text-xs text-gray-200">
                                            @foreach (\App\Enums\AssetType::cases() as $type)
                                                <option value="{{ $type->value }}" @selected($agent->asset_type === $type)>{{ $type->label() }}</option>
                                            @endforeach
                                        </select>
                                    @else
                                        <span class="text-gray-300">{{ $agent->asset_type->label() }}</span>
                                    @endif
                                </td>
                                @if ($canManage)
                                    <td class="py-2 whitespace-nowrap">
                                        @if ($agent->status === \App\Enums\AgentStatus::Menunggu)
                                            <button wire:click="reissueCode({{ $agent->id }})" class="text-xs text-emerald-400 hover:underline">Buat kode baru</button>
                                        @endif
                                        @if ($agent->status !== \App\Enums\AgentStatus::Dicabut)
                                            <button wire:click="revokeAgent({{ $agent->id }})" wire:confirm="Cabut token agent {{ $agent->hostname }}? Agent langsung ditolak API." class="ms-2 text-xs text-red-400 hover:underline">Cabut token</button>
                                        @endif
                                    </td>
                                @endif
                            </tr>
                        @empty
                            <tr><td colspan="7" class="py-4 text-gray-500">Belum ada agent terdaftar.</td></tr>
                        @endforelse
                    </tbody>
                </table>
            </div>

            @if ($canManage)
                <form wire:submit="createAgent" class="mt-6 grid gap-3 sm:grid-cols-4 sm:items-end border-t border-gray-800 pt-4">
                    <div>
                        <x-input-label for="agentUnitId" value="Satuan" />
                        <select wire:model="agentUnitId" id="agentUnitId" class="mt-1 block w-full rounded-md border-gray-700 bg-gray-950 text-gray-200 text-sm">
                            <option value="">Pilih satuan</option>
                            @foreach ($units as $unit)
                                <option value="{{ $unit->id }}">{{ $unit->name }}</option>
                            @endforeach
                        </select>
                        <x-input-error :messages="$errors->get('agentUnitId')" class="mt-1" />
                    </div>
                    <div>
                        <x-input-label for="agentHostname" value="Hostname" />
                        <x-text-input wire:model="agentHostname" id="agentHostname" class="mt-1 block w-full" />
                        <x-input-error :messages="$errors->get('agentHostname')" class="mt-1" />
                    </div>
                    <div>
                        <x-input-label for="agentAssetType" value="Jenis aset" />
                        <select wire:model="agentAssetType" id="agentAssetType" class="mt-1 block w-full rounded-md border-gray-700 bg-gray-950 text-gray-200 text-sm">
                            @foreach (\App\Enums\AssetType::cases() as $type)
                                <option value="{{ $type->value }}">{{ $type->label() }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div><x-primary-button>Tambah agent</x-primary-button></div>
                </form>
            @endif
        </section>

        {{-- Satuan --}}
        <section class="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
            <h3 class="text-base font-semibold text-gray-100">Hierarki satuan</h3>
            <ul class="mt-4 space-y-1">
                @foreach ($tree as $unit)
                    @include('livewire.admin.partials.unit-row', ['unit' => $unit, 'depth' => 0, 'canManage' => $canManage])
                @endforeach
            </ul>

            @if ($canManage)
                <form wire:submit="saveUnit" class="mt-6 grid gap-3 sm:grid-cols-5 sm:items-end border-t border-gray-800 pt-4">
                    <div>
                        <x-input-label for="unitName" value="Nama satuan" />
                        <x-text-input wire:model="unitName" id="unitName" class="mt-1 block w-full" />
                        <x-input-error :messages="$errors->get('unitName')" class="mt-1" />
                    </div>
                    <div>
                        <x-input-label for="unitCode" value="Kode (huruf besar)" />
                        <x-text-input wire:model="unitCode" id="unitCode" class="mt-1 block w-full" />
                        <x-input-error :messages="$errors->get('unitCode')" class="mt-1" />
                    </div>
                    <div>
                        <x-input-label for="unitLevel" value="Tingkat" />
                        <select wire:model="unitLevel" id="unitLevel" class="mt-1 block w-full rounded-md border-gray-700 bg-gray-950 text-gray-200 text-sm">
                            @foreach (\App\Enums\UnitLevel::cases() as $level)
                                <option value="{{ $level->value }}">{{ $level->label() }}</option>
                            @endforeach
                        </select>
                    </div>
                    <div>
                        <x-input-label for="unitParentId" value="Induk" />
                        <select wire:model="unitParentId" id="unitParentId" class="mt-1 block w-full rounded-md border-gray-700 bg-gray-950 text-gray-200 text-sm">
                            <option value="">— tanpa induk —</option>
                            @foreach ($units as $unit)
                                <option value="{{ $unit->id }}">{{ $unit->name }}</option>
                            @endforeach
                        </select>
                        <x-input-error :messages="$errors->get('unitParentId')" class="mt-1" />
                    </div>
                    <div class="flex gap-2">
                        <x-primary-button>{{ $editingUnitId ? 'Simpan perubahan' : 'Tambah satuan' }}</x-primary-button>
                        @if ($editingUnitId)
                            <button type="button" wire:click="resetUnitForm" class="text-xs text-gray-400 underline">Batal</button>
                        @endif
                    </div>
                </form>
            @endif
        </section>
    </div>
</div>
