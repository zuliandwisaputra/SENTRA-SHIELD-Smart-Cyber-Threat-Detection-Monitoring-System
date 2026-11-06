<x-app-layout>
    <x-slot name="title">{{ $event->reference() }}</x-slot>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-100 leading-tight">Event {{ $event->reference() }}</h2>
        <p class="mt-1 text-xs text-gray-500">Event telemetri asli dari agent. Event tidak bisa diubah atau dihapus dari aplikasi.</p>
    </x-slot>

    <div class="py-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <section class="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
            <dl class="grid gap-x-6 gap-y-3 sm:grid-cols-2 text-sm">
                <div><dt class="text-xs text-gray-500">Waktu kejadian</dt><dd class="text-gray-100">{{ waktu_wib($event->occurred_at, 'd/m/Y H:i:s.v') }}</dd></div>
                <div><dt class="text-xs text-gray-500">Diterima Core</dt><dd class="text-gray-100">{{ waktu_wib($event->created_at, 'd/m/Y H:i:s.v') }}</dd></div>
                <div><dt class="text-xs text-gray-500">Sumber</dt><dd class="text-gray-100">{{ $event->source->label() }}</dd></div>
                <div><dt class="text-xs text-gray-500">Satuan / agent</dt><dd class="text-gray-100">{{ $event->unit->name }} / {{ $event->agent?->hostname ?? 'Core' }}</dd></div>
                <div><dt class="text-xs text-gray-500">IP sumber</dt><dd class="font-mono text-gray-100">{{ $event->src_ip ?? '—' }}</dd></div>
                <div><dt class="text-xs text-gray-500">Port tujuan</dt><dd class="font-mono text-gray-100">{{ $event->dst_port ?? '—' }}</dd></div>
                <div class="sm:col-span-2"><dt class="text-xs text-gray-500">Ringkasan</dt><dd class="text-gray-100 break-all">{{ $event->summary() }}</dd></div>
                @if ($event->is_test)
                    <div class="sm:col-span-2"><dd class="inline-block rounded bg-sky-900/60 px-2 py-0.5 text-xs text-sky-300">Event Uji Kesiapan (readiness_test)</dd></div>
                @endif
            </dl>
        </section>

        <section class="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
            <h3 class="text-base font-semibold text-gray-100">Deteksi dari event ini</h3>
            <ul class="mt-3 space-y-2 text-sm">
                @forelse ($event->detections as $d)
                    <li class="text-gray-300">
                        <span class="font-mono text-xs">{{ $d->rule->code }}</span> {{ $d->rule->name }} ({{ $d->attack_id }})
                        @if ($d->incident && auth()->user()->can('view', $d->incident))
                            · <a href="{{ route('incidents.show', $d->incident) }}" class="text-emerald-400 hover:underline">Insiden #{{ $d->incident->id }}</a>
                        @endif
                    </li>
                @empty
                    <li class="text-gray-500">Tidak memicu aturan apa pun (event normal atau IP di daftar putih).</li>
                @endforelse
            </ul>
        </section>

        <section class="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
            <h3 class="text-base font-semibold text-gray-100">Payload (dinormalkan agent)</h3>
            <pre class="mt-3 overflow-x-auto rounded bg-gray-950 p-3 text-xs text-gray-300">{{ json_encode($event->payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) }}</pre>
            <h3 class="mt-5 text-base font-semibold text-gray-100">Baris mentah</h3>
            <pre class="mt-3 overflow-x-auto whitespace-pre-wrap break-all rounded bg-gray-950 p-3 text-xs text-gray-300">{{ $event->raw ?? '—' }}</pre>
        </section>
    </div>
</x-app-layout>
