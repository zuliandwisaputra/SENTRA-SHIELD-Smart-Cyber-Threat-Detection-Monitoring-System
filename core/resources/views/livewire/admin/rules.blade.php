<div>
    <x-ui.page-header title="Aturan Deteksi" icon="list-checks">
        <span class="block max-w-3xl">Katalog awal PRD bagian 10. Ambang adalah nilai awal lab dan bisa diubah. Setiap perubahan tercatat di audit log.</span>
    </x-ui.page-header>

    <div class="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 lg:px-8 space-y-6">
        @if ($saved)
            <div class="rounded-control border border-aman/40 bg-aman/10 px-4 py-2 text-sm text-aman" role="status">{{ $saved }}</div>
        @endif

        <section class="panel overflow-x-auto">
            <table class="tbl">
                <thead>
                    <tr>
                        <th class="py-3 px-3">Kode</th>
                        <th class="py-3 px-3">Aturan</th>
                        <th class="py-3 px-3">MITRE ATT&amp;CK / tahap</th>
                        <th class="py-3 px-3">Aktif</th>
                        <th class="py-3 px-3">Bobot</th>
                        <th class="py-3 px-3">Ambang / jendela (detik)</th>
                        <th class="py-3 px-3"></th>
                    </tr>
                </thead>
                <tbody class="divide-y divide-gray-800">
                    @foreach ($rules as $rule)
                        <tr wire:key="rule-{{ $rule->id }}">
                            <td class="py-2 px-3 font-mono text-gray-300">{{ $rule->code }}</td>
                            <td class="py-2 px-3">
                                <div class="text-gray-100">{{ $rule->name }}</div>
                                <div class="text-xs text-gray-500">{{ $rule->type->label() }} · sumber {{ $rule->source }}</div>
                            </td>
                            <td class="py-2 px-3 text-xs text-gray-400">{{ $rule->attack_id }} {{ $rule->attack_name }}<br>{{ $rule->stage->label() }}</td>
                            <td class="py-2 px-3">
                                <input type="checkbox" wire:model="form.{{ $rule->id }}.enabled" aria-label="Aktifkan {{ $rule->code }}" class="size-4">
                            </td>
                            <td class="py-2 px-3">
                                <input type="number" wire:model="form.{{ $rule->id }}.weight" aria-label="Bobot {{ $rule->code }}" class="w-20 rounded-control border-gray-700 bg-gray-950 text-gray-200 text-sm">
                                <x-input-error :messages="$errors->get('form.'.$rule->id.'.weight')" class="mt-1" />
                            </td>
                            <td class="py-2 px-3 whitespace-nowrap">
                                @if ($rule->type === \App\Enums\RuleType::Threshold)
                                    @isset($rule->config['threshold'])
                                        <input type="number" wire:model="form.{{ $rule->id }}.threshold" aria-label="Ambang {{ $rule->code }}" class="w-20 rounded-control border-gray-700 bg-gray-950 text-gray-200 text-sm"> /
                                    @endisset
                                    <input type="number" wire:model="form.{{ $rule->id }}.window_s" aria-label="Jendela {{ $rule->code }}" class="w-24 rounded-control border-gray-700 bg-gray-950 text-gray-200 text-sm">
                                    <x-input-error :messages="array_merge($errors->get('form.'.$rule->id.'.threshold'), $errors->get('form.'.$rule->id.'.window_s'))" class="mt-1" />
                                @else
                                    <span class="text-xs text-gray-500">Aturan pola</span>
                                @endif
                            </td>
                            <td class="py-2 px-3"><button wire:click="saveRule({{ $rule->id }})" class="text-xs font-semibold link">Simpan</button></td>
                        </tr>
                    @endforeach
                </tbody>
            </table>
        </section>

        <section class="panel p-4 sm:p-6">
            <h3 class="text-base font-semibold text-gray-100">Daftar putih IP</h3>
            <p class="mt-1 text-xs text-gray-500">IP atau CIDR (satu per baris) yang tidak memicu deteksi. Event-nya tetap disimpan.</p>
            <form wire:submit="saveWhitelist" class="mt-3 space-y-3 max-w-md">
                <textarea wire:model="whitelist" rows="4" aria-label="Daftar putih IP" class="block w-full rounded-control border-gray-700 bg-gray-950 font-mono text-sm text-gray-200" placeholder="172.32.0.50&#10;10.10.0.0/24"></textarea>
                <x-input-error :messages="$errors->get('whitelist')" />
                <x-primary-button>Simpan daftar putih</x-primary-button>
            </form>
        </section>
    </div>
</div>
