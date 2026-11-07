<div>
    <x-ui.page-header title="Daftar Insiden" icon="siren" />

    <div class="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 space-y-4">
        <div class="grid gap-3 sm:grid-cols-4 panel p-4">
            <div>
                <x-input-label for="f-severity" value="Severity" />
                <select wire:model.live="severity" id="f-severity" class="mt-1 block w-full rounded-control border-gray-700 bg-gray-950 text-gray-200 text-sm">
                    <option value="">Semua</option>
                    @foreach (\App\Enums\Severity::cases() as $s)
                        <option value="{{ $s->value }}">{{ $s->label() }}</option>
                    @endforeach
                </select>
            </div>
            <div>
                <x-input-label for="f-status" value="Status" />
                <select wire:model.live="status" id="f-status" class="mt-1 block w-full rounded-control border-gray-700 bg-gray-950 text-gray-200 text-sm">
                    <option value="terbuka">Terbuka (belum selesai)</option>
                    <option value="">Semua</option>
                    @foreach (\App\Enums\IncidentStatus::cases() as $s)
                        <option value="{{ $s->value }}">{{ $s->label() }}</option>
                    @endforeach
                </select>
            </div>
            <div>
                <x-input-label for="f-unit" value="Satuan" />
                <select wire:model.live="unit" id="f-unit" class="mt-1 block w-full rounded-control border-gray-700 bg-gray-950 text-gray-200 text-sm">
                    <option value="">Semua</option>
                    @foreach ($units as $u)
                        <option value="{{ $u->id }}">{{ $u->name }}</option>
                    @endforeach
                </select>
            </div>
            <div>
                <x-input-label for="f-ip" value="IP sumber" />
                <x-text-input wire:model.live.debounce.400ms="ip" id="f-ip" class="mt-1 block w-full" placeholder="contoh: 203.0.113.7" />
            </div>
        </div>

        <div class="panel overflow-x-auto">
            <table class="tbl">
                <thead>
                    <tr>
                        <th class="py-3 px-4">Insiden</th>
                        <th class="py-3 px-4">Satuan</th>
                        <th class="py-3 px-4">IP sumber</th>
                        <th class="py-3 px-4">Tahap tertinggi</th>
                        <th class="py-3 px-4">Skor</th>
                        <th class="py-3 px-4">Status</th>
                        <th class="py-3 px-4">Terakhir terlihat</th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-800">
                    @forelse ($incidents as $incident)
                        <tr wire:key="inc-{{ $incident->id }}" class="hover:bg-gray-800/50">
                            <td class="py-3 px-4">
                                <a href="{{ route('incidents.show', $incident) }}" wire:navigate class="font-medium link">#{{ $incident->id }} {{ $incident->title }}</a>
                                <div class="text-xs text-gray-500">{{ $incident->detections_count }} deteksi</div>
                            </td>
                            <td class="py-3 px-4 text-gray-300">{{ $incident->unit->name }}</td>
                            <td class="py-3 px-4 font-mono text-gray-300">{{ $incident->src_ip ?? '—' }}</td>
                            <td class="py-3 px-4 text-gray-300">{{ $incident->stage_max?->label() ?? '—' }}</td>
                            <td class="py-3 px-4 whitespace-nowrap"><span class="font-semibold text-gray-100">{{ $incident->score }}</span> <x-severity-badge :severity="$incident->severity" /></td>
                            <td class="py-3 px-4 text-gray-300">{{ $incident->status->label() }}</td>
                            <td class="py-3 px-4 text-gray-400 whitespace-nowrap">{{ waktu_wib($incident->last_seen_at, 'd/m H:i:s') }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="7" class="py-6 px-4 text-gray-500">Tidak ada insiden yang cocok dengan filter.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
        {{ $incidents->links() }}
    </div>
</div>
