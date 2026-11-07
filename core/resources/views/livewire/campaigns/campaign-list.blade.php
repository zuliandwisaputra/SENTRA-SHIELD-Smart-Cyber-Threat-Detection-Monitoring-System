<div>
    <x-ui.page-header title="Kampanye" icon="network">
        Serangan terkoordinasi: IP yang sama memicu insiden di dua satuan atau lebih dalam 24 jam. Skor tiap insiden tertaut dikalikan 1,3.
    </x-ui.page-header>
    <div class="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8">
        <div class="panel">
            <x-ui.table caption="Daftar kampanye lintas satuan">
                <x-slot:head>
                    <tr><th>Kampanye</th><th>Satuan terdampak</th><th>Insiden</th><th>Skor tertinggi</th><th>Status</th><th>Rentang waktu</th></tr>
                </x-slot:head>
                @forelse ($campaigns as $c)
                    <tr wire:key="kmp-{{ $c->id }}">
                        <td><a href="{{ route('campaigns.show', $c) }}" wire:navigate class="link font-medium">#{{ $c->id }} <span class="font-mono">{{ $c->src_ip }}</span></a></td>
                        <td class="text-ink">{{ $c->unit_count }} satuan</td>
                        <td class="data text-ink-2">{{ $c->incidents_count }}</td>
                        <td>
                            @if ($c->incidents_max_score !== null)
                                <span class="inline-flex items-center gap-2"><span class="data font-semibold text-ink">{{ $c->incidents_max_score }}</span> <x-severity-badge :severity="\App\Enums\Severity::fromScore($c->incidents_max_score)" /></span>
                            @endif
                        </td>
                        <td class="text-ink-2">{{ $c->status->label() }}</td>
                        <td class="data whitespace-nowrap text-ink-3">{{ waktu_wib($c->first_seen_at, 'd/m H:i') }} – {{ waktu_wib($c->last_seen_at, 'H:i') }}</td>
                    </tr>
                @empty
                    <tr><td colspan="6"><x-ui.empty icon="network" title="Belum ada kampanye lintas satuan.">Kampanye terbentuk otomatis saat satu IP memicu insiden di dua satuan atau lebih.</x-ui.empty></td></tr>
                @endforelse
            </x-ui.table>
        </div>
    </div>
</div>
