{{--
    Kepala halaman: judul, keterangan singkat (slot), tombol/aksi di kanan (slot "actions").
    back + backLabel menampilkan tautan kembali di atas judul (halaman detail).
--}}
@props(['title', 'icon' => null, 'back' => null, 'backLabel' => null])
<header {{ $attributes->merge(['class' => 'border-b border-line bg-panel/60']) }}>
    <div class="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-8">
        @if ($back)
            <a href="{{ $back }}" wire:navigate class="mb-2 inline-flex min-h-6 items-center gap-1 text-sm text-ink-3 transition-colors hover:text-ink">
                <x-icon name="chevron-left" class="size-4" />{{ $backLabel }}
            </a>
        @endif
        <div class="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div class="min-w-0">
                <h2 class="flex items-center gap-2.5 font-display text-[26px] font-semibold leading-tight tracking-[0.01em] text-ink">
                    @if ($icon)<x-icon :name="$icon" class="size-6 text-accent" />@endif{{ $title }}
                </h2>
                @if (trim($slot) !== '')
                    <div class="mt-1 text-sm text-ink-3">{{ $slot }}</div>
                @endif
            </div>
            @isset($actions)
                <div class="flex flex-wrap items-center gap-2">{{ $actions }}</div>
            @endisset
        </div>
    </div>
</header>
