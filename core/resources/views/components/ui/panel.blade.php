{{--
    Panel: wadah utama bergaris (tanpa bayangan). Judul huruf kapital kecil, ikon opsional,
    slot "actions" di kanan kepala. :flush="true" untuk isi tanpa padding (tabel, daftar).
--}}
@props(['title' => null, 'subtitle' => null, 'icon' => null, 'headingId' => null, 'flush' => false])
<section {{ $attributes->merge(['class' => 'panel min-w-0']) }} @if ($headingId) aria-labelledby="{{ $headingId }}" @endif>
    @if ($title || isset($actions))
        <header class="panel-head">
            <div class="min-w-0">
                @if ($title)
                    <h3 @if ($headingId) id="{{ $headingId }}" @endif class="panel-title flex items-center gap-2">
                        @if ($icon)<x-icon :name="$icon" class="size-4 text-ink-3" />@endif{{ $title }}
                    </h3>
                @endif
                @if ($subtitle)
                    <p class="mt-0.5 text-xs text-ink-3">{{ $subtitle }}</p>
                @endif
            </div>
            @isset($actions)
                <div class="flex flex-wrap items-center gap-2">{{ $actions }}</div>
            @endisset
        </header>
    @endif
    <div @class(['p-4 sm:p-5' => ! $flush])>{{ $slot }}</div>
</section>
