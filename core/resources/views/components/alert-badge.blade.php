@props(['level'])
{{-- Lencana Tingkat Siaga; warna konsisten dengan severity. --}}
<span {{ $attributes->merge(['class' => 'inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset '.$level->badgeClass()]) }}>
    <span class="h-1.5 w-1.5 rounded-full {{ $level->dotClass() }}"></span>
    {{ $level->label() }}
</span>
