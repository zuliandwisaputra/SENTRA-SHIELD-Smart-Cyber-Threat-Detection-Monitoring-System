<div>
    <header class="border-b border-gray-800 bg-gray-900">
        <div class="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8">
            <h2 class="font-semibold text-xl text-gray-100 leading-tight">Pengguna</h2>
        </div>
    </header>

    <div class="py-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <section class="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
            <div class="overflow-x-auto">
                <table class="min-w-full text-sm">
                    <thead class="text-left text-xs uppercase tracking-wide text-gray-500">
                        <tr>
                            <th class="py-2 pe-4">Nama</th>
                            <th class="py-2 pe-4">Email</th>
                            <th class="py-2 pe-4">Peran</th>
                            <th class="py-2 pe-4">Satuan</th>
                            <th class="py-2">Aksi</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-800">
                        @foreach ($users as $user)
                            <tr wire:key="user-{{ $user->id }}">
                                <td class="py-2 pe-4 text-gray-100">{{ $user->name }}</td>
                                <td class="py-2 pe-4 text-gray-300">{{ $user->email }}</td>
                                <td class="py-2 pe-4 text-gray-300">{{ $user->role->label() }}</td>
                                <td class="py-2 pe-4 text-gray-300">{{ $user->unit?->name ?? '—' }}</td>
                                <td class="py-2"><button wire:click="edit({{ $user->id }})" class="text-xs text-emerald-400 hover:underline">Ubah</button></td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        </section>

        <section class="bg-gray-900 border border-gray-800 rounded-lg p-4 sm:p-6">
            <h3 class="text-base font-semibold text-gray-100">{{ $editingId ? 'Ubah pengguna' : 'Tambah pengguna' }}</h3>
            <form wire:submit="save" class="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                <div>
                    <x-input-label for="name" value="Nama" />
                    <x-text-input wire:model="name" id="name" class="mt-1 block w-full" />
                    <x-input-error :messages="$errors->get('name')" class="mt-1" />
                </div>
                <div>
                    <x-input-label for="email" value="Email" />
                    <x-text-input wire:model="email" id="email" type="email" class="mt-1 block w-full" />
                    <x-input-error :messages="$errors->get('email')" class="mt-1" />
                </div>
                <div>
                    <x-input-label for="role" value="Peran" />
                    <select wire:model.live="role" id="role" class="mt-1 block w-full rounded-md border-gray-700 bg-gray-950 text-gray-200 text-sm">
                        @foreach (\App\Enums\Role::cases() as $r)
                            <option value="{{ $r->value }}">{{ $r->label() }}</option>
                        @endforeach
                    </select>
                    <x-input-error :messages="$errors->get('role')" class="mt-1" />
                </div>
                <div>
                    <x-input-label for="unitId" value="Satuan" />
                    <select wire:model="unitId" id="unitId" class="mt-1 block w-full rounded-md border-gray-700 bg-gray-950 text-gray-200 text-sm">
                        <option value="">—</option>
                        @foreach ($units as $unit)
                            <option value="{{ $unit->id }}">{{ $unit->name }}</option>
                        @endforeach
                    </select>
                    <x-input-error :messages="$errors->get('unitId')" class="mt-1" />
                </div>
                <div>
                    <x-input-label for="password" :value="$editingId ? 'Kata sandi baru (kosongkan bila tidak diganti)' : 'Kata sandi (min. 10 karakter)'" />
                    <x-text-input wire:model="password" id="password" type="password" autocomplete="new-password" class="mt-1 block w-full" />
                    <x-input-error :messages="$errors->get('password')" class="mt-1" />
                </div>
                <div class="flex items-end gap-2">
                    <x-primary-button>{{ $editingId ? 'Simpan perubahan' : 'Tambah pengguna' }}</x-primary-button>
                    @if ($editingId)
                        <button type="button" wire:click="resetForm" class="text-xs text-gray-400 underline">Batal</button>
                    @endif
                </div>
            </form>
        </section>
    </div>
</div>
