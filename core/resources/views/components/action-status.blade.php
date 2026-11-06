@props(['status'])
<span {{ $attributes->merge(['class' => 'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ring-1 ring-inset whitespace-nowrap '.$status->badgeClass()]) }}>{{ $status->label() }}</span>
