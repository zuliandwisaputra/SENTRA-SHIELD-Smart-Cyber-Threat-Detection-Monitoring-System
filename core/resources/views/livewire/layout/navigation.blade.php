<?php

use App\Livewire\Actions\Logout;
use Livewire\Volt\Component;

new class extends Component
{
    public function logout(Logout $logout): void
    {
        $logout();

        $this->redirect('/', navigate: true);
    }
}; ?>

@php
    $user = auth()->user();
    // Menu halaman ditambahkan per fase, sesuai halaman yang sudah benar-benar ada.
    $menu = [
        ['route' => 'dashboard', 'label' => 'Beranda Komando', 'ability' => 'lihat-dashboard'],
        ['route' => 'incidents.index', 'label' => 'Insiden', 'ability' => 'lihat-dashboard', 'active' => 'incidents.*'],
        ['route' => 'units-agents', 'label' => 'Satuan & Agent', 'ability' => 'lihat-satuan-agent'],
        ['route' => 'rules', 'label' => 'Aturan Deteksi', 'ability' => 'kelola-sistem'],
        ['route' => 'users', 'label' => 'Pengguna', 'ability' => 'kelola-sistem'],
    ];
@endphp

<nav x-data="{ open: false }" class="bg-gray-900 border-b border-gray-800">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between h-16">
            <div class="flex">
                <div class="shrink-0 flex items-center">
                    <a href="{{ route('dashboard') }}" wire:navigate class="flex items-center gap-2">
                        <x-application-logo class="block h-8 w-auto text-emerald-500" />
                        <span class="font-bold tracking-wide text-gray-100">SENTRA SHIELD</span>
                    </a>
                </div>

                <div class="hidden space-x-8 sm:-my-px sm:ms-10 sm:flex">
                    @foreach ($menu as $item)
                        @can($item['ability'])
                            <x-nav-link :href="route($item['route'])" :active="request()->routeIs($item['active'] ?? $item['route'])" wire:navigate>
                                {{ $item['label'] }}
                            </x-nav-link>
                        @endcan
                    @endforeach
                </div>
            </div>

            <div class="hidden sm:flex sm:items-center sm:ms-6">
                <x-dropdown align="right" width="48">
                    <x-slot name="trigger">
                        <button class="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-gray-300 bg-gray-900 hover:text-white focus:outline-none transition ease-in-out duration-150">
                            <div class="text-end">
                                <div x-data="{{ json_encode(['name' => $user->name]) }}" x-text="name" x-on:profile-updated.window="name = $event.detail.name"></div>
                                <div class="text-xs text-gray-500">{{ $user->role->label() }}{{ $user->unit ? ' · '.$user->unit->name : '' }}</div>
                            </div>

                            <div class="ms-1">
                                <svg class="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                                    <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd" />
                                </svg>
                            </div>
                        </button>
                    </x-slot>

                    <x-slot name="content">
                        <x-dropdown-link :href="route('profile')" wire:navigate>
                            Profil
                        </x-dropdown-link>

                        <button wire:click="logout" class="w-full text-start">
                            <x-dropdown-link>
                                Keluar
                            </x-dropdown-link>
                        </button>
                    </x-slot>
                </x-dropdown>
            </div>

            <div class="-me-2 flex items-center sm:hidden">
                <button @click="open = ! open" aria-label="Buka menu" class="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-200 hover:bg-gray-800 focus:outline-none transition duration-150 ease-in-out">
                    <svg class="h-6 w-6" stroke="currentColor" fill="none" viewBox="0 0 24 24">
                        <path :class="{'hidden': open, 'inline-flex': ! open }" class="inline-flex" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                        <path :class="{'hidden': ! open, 'inline-flex': open }" class="hidden" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>
        </div>
    </div>

    <div :class="{'block': open, 'hidden': ! open}" class="hidden sm:hidden">
        <div class="pt-2 pb-3 space-y-1">
            @foreach ($menu as $item)
                @can($item['ability'])
                    <x-responsive-nav-link :href="route($item['route'])" :active="request()->routeIs($item['active'] ?? $item['route'])" wire:navigate>
                        {{ $item['label'] }}
                    </x-responsive-nav-link>
                @endcan
            @endforeach
        </div>

        <div class="pt-4 pb-1 border-t border-gray-800">
            <div class="px-4">
                <div class="font-medium text-base text-gray-200" x-data="{{ json_encode(['name' => $user->name]) }}" x-text="name" x-on:profile-updated.window="name = $event.detail.name"></div>
                <div class="font-medium text-sm text-gray-500">{{ $user->role->label() }}{{ $user->unit ? ' · '.$user->unit->name : '' }}</div>
            </div>

            <div class="mt-3 space-y-1">
                <x-responsive-nav-link :href="route('profile')" wire:navigate>
                    Profil
                </x-responsive-nav-link>

                <button wire:click="logout" class="w-full text-start">
                    <x-responsive-nav-link>
                        Keluar
                    </x-responsive-nav-link>
                </button>
            </div>
        </div>
    </div>
</nav>
