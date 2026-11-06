@php
    $tree = \App\Models\Unit::tree(auth()->user()->visibleUnitIds());
@endphp

<x-app-layout>
    <x-slot name="title">Beranda Komando</x-slot>
    <x-slot name="header">
        <h2 class="font-semibold text-xl text-gray-100 leading-tight">Beranda Komando</h2>
    </x-slot>

    <div class="py-8">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <section class="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6" aria-labelledby="pohon-satuan">
                <div class="flex flex-wrap items-baseline justify-between gap-2">
                    <h3 id="pohon-satuan" class="text-base font-semibold text-gray-100">Pohon Satuan &amp; Tingkat Siaga</h3>
                    <p class="text-xs text-gray-500">Tingkat Siaga dihitung dari insiden terbuka; satuan induk mengikuti tingkat tertinggi di bawahnya.</p>
                </div>

                @if ($tree->isEmpty())
                    <p class="mt-4 text-sm text-gray-400">Belum ada satuan yang bisa Anda lihat. Hubungi Admin.</p>
                @else
                    <ul class="mt-4 space-y-1" role="tree">
                        @foreach ($tree as $unit)
                            @include('partials.unit-node', ['unit' => $unit, 'depth' => 0])
                        @endforeach
                    </ul>
                @endif
            </section>
        </div>
    </div>
</x-app-layout>
