<div>
    <x-ui.page-header title="Tindakan" icon="shield-ban">
        <span class="block max-w-3xl">Perintah ke agent hanya dari daftar tetap: blokir IP, buka blokir, jalankan uji.</span>
    </x-ui.page-header>

    <div class="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 space-y-4">
        <div class="max-w-xs">
            <x-input-label for="f-status" value="Status" />
            <select wire:model.live="status" id="f-status" class="mt-1 block w-full rounded-control border-gray-700 bg-gray-950 text-gray-200 text-sm">
                <option value="">Semua</option>
                <option value="aktif">Blokir aktif</option>
                @foreach (\App\Enums\ActionStatus::cases() as $s)
                    <option value="{{ $s->value }}">{{ $s->label() }}</option>
                @endforeach
            </select>
        </div>

        <div class="panel overflow-x-auto">
            <table class="tbl">
                <thead>
                    <tr>
                        <th class="py-3 px-3">#</th><th class="py-3 px-3">Tindakan</th><th class="py-3 px-3">Agent</th>
                        <th class="py-3 px-3">Status</th><th class="py-3 px-3">Pengusul / pemutus</th><th class="py-3 px-3">Hasil agent</th><th class="py-3 px-3">Berlaku sampai</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-800">
                    @forelse ($actions as $a)
                        <tr wire:key="act-{{ $a->id }}">
                            <td class="py-2 px-3 font-mono text-gray-500">{{ $a->id }}</td>
                            <td class="py-2 px-3">
                                <div class="text-gray-100">{{ $a->type->label() }} <span class="font-mono">{{ $a->params['ip'] ?? '' }}</span></div>
                                @if ($a->incident)
                                    <a href="{{ route('incidents.show', $a->incident) }}" wire:navigate class="text-xs link">Insiden #{{ $a->incident_id }}</a>
                                @endif
                            </td>
                            <td class="py-2 px-3 text-gray-300">{{ $a->targetAgent->hostname }}<div class="text-xs text-gray-500">{{ $a->targetAgent->unit->name }}</div></td>
                            <td class="py-2 px-3"><x-action-status :status="$a->status" /></td>
                            <td class="py-2 px-3 text-xs text-gray-400">{{ $a->proposer?->name ?? 'Sistem' }}<br>{{ $a->approver?->name ?? '—' }}@if ($a->decision_note) · “{{ $a->decision_note }}”@endif</td>
                            <td class="py-2 px-3 text-xs text-gray-300">{{ $a->result['message'] ?? '—' }}@if ($a->executed_at)<div class="text-gray-500">{{ waktu_wib($a->executed_at, 'd/m H:i:s') }}</div>@endif</td>
                            <td class="py-2 px-3 text-xs text-gray-400 whitespace-nowrap">{{ $a->expires_at ? waktu_wib($a->expires_at, 'd/m H:i:s') : '—' }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="7" class="py-6 px-3 text-gray-500">Belum ada tindakan.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        {{ $actions->links() }}
    </div>
</div>
