<li role="treeitem" @if ($unit->children->isNotEmpty()) aria-expanded="true" @endif>
    <div class="flex items-center justify-between gap-3 rounded-md px-2 py-2 hover:bg-gray-800/60" style="padding-left: {{ 0.5 + $depth * 1.25 }}rem">
        <div class="min-w-0">
            <span class="font-medium text-gray-100">{{ $unit->name }}</span>
            <span class="ms-2 text-xs uppercase tracking-wide text-gray-500">{{ $unit->level->label() }} · {{ $unit->code }}</span>
        </div>
        <x-alert-badge :level="$unit->effectiveAlertLevel()" />
    </div>

    @if ($unit->children->isNotEmpty())
        <ul role="group" class="space-y-1">
            @foreach ($unit->children as $child)
                @include('partials.unit-node', ['unit' => $child, 'depth' => $depth + 1])
            @endforeach
        </ul>
    @endif
</li>
