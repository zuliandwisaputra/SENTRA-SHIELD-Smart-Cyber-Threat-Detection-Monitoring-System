{{-- Lencana hasil satu skenario Uji Kesiapan + catatan kegagalan. --}}
@if ($r->detected)
    <span class="inline-flex rounded-full bg-emerald-900/60 px-2 py-0.5 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-700">Terdeteksi</span>
@elseif ($running)
    <span class="inline-flex whitespace-nowrap rounded-full bg-sky-900/60 px-2 py-0.5 text-xs font-semibold text-sky-300 ring-1 ring-inset ring-sky-700">{{ $r->started_at ? 'Menunggu deteksi' : 'Menunggu' }}</span>
@else
    <span class="inline-flex rounded-full bg-red-900/70 px-2 py-0.5 text-xs font-semibold text-red-300 ring-1 ring-inset ring-red-600">Lolos</span>
@endif
