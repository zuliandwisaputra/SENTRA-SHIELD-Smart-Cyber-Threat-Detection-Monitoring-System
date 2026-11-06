<div>
    <header class="border-b border-gray-800 bg-gray-900">
        <div class="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8">
            <h2 class="font-semibold text-xl text-gray-100 leading-tight">Kampanye</h2>
            <p class="mt-1 text-xs text-gray-500">Serangan terkoordinasi: IP yang sama memicu insiden di dua satuan atau lebih dalam 24 jam. Skor tiap insiden tertaut dikalikan 1,3.</p>
        </div>
    </header>
    <div class="py-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="bg-gray-900 border border-gray-800 rounded-lg overflow-x-auto">
            <table class="min-w-full text-sm">
                <thead class="text-left text-xs uppercase tracking-wide text-gray-500 border-b border-gray-800">
                    <tr><th class="py-3 px-4">Kampanye</th><th class="py-3 px-4">Satuan terdampak</th><th class="py-3 px-4">Insiden</th><th class="py-3 px-4">Skor tertinggi</th><th class="py-3 px-4">Status</th><th class="py-3 px-4">Rentang waktu</th></tr>
                </thead>
                <tbody class="divide-y divide-gray-800">
                    @forelse ($campaigns as $c)
                        <tr wire:key="kmp-{{ $c->id }}" class="hover:bg-gray-800/50">
                            <td class="py-3 px-4"><a href="{{ route('campaigns.show', $c) }}" wire:navigate class="font-medium text-emerald-400 hover:underline">#{{ $c->id }} <span class="font-mono">{{ $c->src_ip }}</span></a></td>
                            <td class="py-3 px-4 text-gray-200">{{ $c->unit_count }} satuan</td>
                            <td class="py-3 px-4 text-gray-300">{{ $c->incidents_count }}</td>
                            <td class="py-3 px-4">
                                @if ($c->incidents_max_score !== null)
                                    <span class="font-semibold text-gray-100">{{ $c->incidents_max_score }}</span> <x-severity-badge :severity="\App\Enums\Severity::fromScore($c->incidents_max_score)" />
                                @endif
                            </td>
                            <td class="py-3 px-4 text-gray-300">{{ $c->status->label() }}</td>
                            <td class="py-3 px-4 text-gray-400 whitespace-nowrap">{{ waktu_wib($c->first_seen_at, 'd/m H:i') }} – {{ waktu_wib($c->last_seen_at, 'H:i') }}</td>
                        </tr>
                    @empty
                        <tr><td colspan="6" class="py-6 px-4 text-gray-500">Belum ada kampanye lintas satuan.</td></tr>
                    @endforelse
                </tbody>
            </table>
        </div>
    </div>
</div>
