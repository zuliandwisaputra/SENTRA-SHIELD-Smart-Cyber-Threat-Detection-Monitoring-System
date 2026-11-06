<li wire:key="unit-{{ $unit->id }}">
    <div class="flex items-center justify-between gap-3 rounded-md px-2 py-1.5 hover:bg-gray-800/60" style="padding-left: {{ 0.5 + $depth * 1.25 }}rem">
        <div class="min-w-0">
            <span class="font-medium text-gray-100">{{ $unit->name }}</span>
            <span class="ms-2 text-xs uppercase tracking-wide text-gray-500">{{ $unit->level->label() }} · {{ $unit->code }}</span>
        </div>
        @if ($canManage)
            <button wire:click="editUnit({{ $unit->id }})" class="text-xs text-emerald-400 hover:underline">Ubah</button>
        @endif
    </div>
    @if ($unit->children->isNotEmpty())
        <ul>
            @foreach ($unit->children as $child)
                @include('livewire.admin.partials.unit-row', ['unit' => $child, 'depth' => $depth + 1, 'canManage' => $canManage])
            @endforeach
        </ul>
    @endif
</li>
