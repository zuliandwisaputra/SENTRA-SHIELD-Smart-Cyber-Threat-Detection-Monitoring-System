@props(['severity'])
{{-- Lencana severity: meter 4 batang (tingkat terbaca tanpa warna) + teks. --}}
<span {{ $attributes->merge(['class' => 'inline-flex items-center gap-1.5 whitespace-nowrap rounded-chip px-1.5 py-0.5 text-xs font-semibold ring-1 ring-inset '.$severity->badgeClass()]) }}>
    <svg viewBox="0 0 10 10" class="size-3" aria-hidden="true" focusable="false">
        @foreach ([[0, 7], [2.6, 5], [5.2, 3], [7.8, 1]] as $i => [$x, $y])
            <rect x="{{ $x }}" y="{{ $y }}" width="1.9" height="{{ 10 - $y }}" rx="0.4" fill="currentColor" fill-opacity="{{ $i <= $severity->rank() ? 1 : 0.25 }}" />
        @endforeach
    </svg>
    {{ $severity->label() }}
</span>
