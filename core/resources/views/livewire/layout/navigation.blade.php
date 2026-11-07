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
    $pendingApprovals = $user->can('putuskan-tindakan')
        ? \App\Models\ResponseAction::query()->where('status', \App\Enums\ActionStatus::Diusulkan)->distinct()->count('group_uuid')
        : 0;
    $menu = [
        ['route' => 'dashboard', 'icon' => 'layout-dashboard', 'label' => 'Beranda', 'ability' => 'lihat-dashboard'],
        ['route' => 'incidents.index', 'icon' => 'siren', 'label' => 'Insiden', 'ability' => 'lihat-dashboard', 'active' => 'incidents.*'],
        ['route' => 'campaigns.index', 'icon' => 'network', 'label' => 'Kampanye', 'ability' => 'lihat-kampanye', 'active' => 'campaigns.*'],
        ['route' => 'actions.index', 'icon' => 'shield-ban', 'label' => 'Tindakan', 'ability' => 'lihat-dashboard'],
        ['route' => 'readiness', 'icon' => 'target', 'label' => 'Uji Kesiapan', 'ability' => 'lihat-uji-kesiapan'],
        ['route' => 'approvals', 'icon' => 'inbox', 'label' => 'Antrean Persetujuan', 'ability' => 'putuskan-tindakan', 'badge' => $pendingApprovals],
        ['route' => 'units-agents', 'icon' => 'server', 'label' => 'Satuan & Agent', 'ability' => 'lihat-satuan-agent'],
        ['route' => 'sites', 'icon' => 'globe', 'label' => 'Penjaga Situs', 'ability' => 'lihat-penjaga-situs'],
        ['route' => 'audit', 'icon' => 'link-2', 'label' => 'Audit Log', 'ability' => 'lihat-audit'],
        // Grup "Sistem" (Admin): di layar lebar masuk menu pengguna agar bilah menu tidak melipat.
        ['route' => 'rules', 'icon' => 'list-checks', 'label' => 'Aturan Deteksi', 'ability' => 'kelola-sistem', 'group' => 'sistem'],
        ['route' => 'users', 'icon' => 'user', 'label' => 'Pengguna', 'ability' => 'kelola-sistem', 'group' => 'sistem'],
        ['route' => 'settings', 'icon' => 'settings', 'label' => 'Pengaturan', 'ability' => 'kelola-sistem', 'group' => 'sistem'],
    ];
    $mainMenu = array_filter($menu, fn ($item) => ! isset($item['group']));
    $systemMenu = array_filter($menu, fn ($item) => ($item['group'] ?? null) === 'sistem');
@endphp

<nav x-data="{ open: false }" class="sticky top-0 z-40 border-b border-line bg-panel/95 backdrop-blur supports-[backdrop-filter]:bg-panel/85">
    <div class="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-8">
        <div class="flex h-14 justify-between gap-4">
            <div class="flex min-w-0 items-stretch">
                <a href="{{ route('dashboard') }}" wire:navigate class="flex shrink-0 items-center gap-2.5 pe-2 text-ink">
                    <x-application-logo class="size-8 text-accent" />
                    <span class="leading-none">
                        <span class="block font-display text-[17px] font-semibold tracking-[0.12em]">SENTRA SHIELD</span>
                        <span class="mt-0.5 hidden text-[11px] uppercase tracking-[0.14em] text-ink-3 sm:block">Pusat Komando Siber</span>
                    </span>
                </a>

                <div class="ms-5 hidden gap-4 xl:flex 2xl:ms-6 2xl:gap-5">
                    @foreach ($mainMenu as $item)
                        @can($item['ability'])
                            <x-nav-link :href="route($item['route'])" :active="request()->routeIs($item['active'] ?? $item['route'])" wire:navigate>
                                <x-icon :name="$item['icon']" class="hidden size-4 min-[1400px]:block" />{{ $item['label'] }}
                                @if (! empty($item['badge']))
                                    <span class="ms-0.5 grid min-w-5 place-items-center rounded-chip bg-accent px-1 font-mono text-xs font-semibold text-accent-ink" aria-label="{{ $item['badge'] }} menunggu">{{ $item['badge'] }}</span>
                                @endif
                            </x-nav-link>
                        @endcan
                    @endforeach
                </div>
            </div>

            <div class="hidden shrink-0 xl:flex xl:items-center xl:gap-3">
                <span data-sentra-live class="inline-flex h-7 items-center whitespace-nowrap rounded-chip border border-line-strong bg-canvas px-2 font-display text-xs font-medium uppercase tracking-[0.12em] text-ink-2" role="status" title="WebSocket belum tersambung; diperbarui tiap 3 detik">Polling</span>
                <x-dropdown align="right" width="w-56">
                    <x-slot name="trigger">
                        <button aria-label="Menu pengguna {{ $user->name }}" class="flex items-center gap-2.5 rounded-control px-2 py-1.5 text-start transition-colors duration-150 hover:bg-raised focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                            <span class="grid size-8 place-items-center rounded-full border border-line-strong bg-inset font-display text-sm font-semibold text-ink-2" aria-hidden="true">{{ mb_strtoupper(mb_substr($user->name, 0, 1)) }}</span>
                            <span class="hidden leading-tight 2xl:block">
                                <span class="block text-sm font-medium text-ink" x-data="{{ json_encode(['name' => $user->name]) }}" x-text="name" x-on:profile-updated.window="name = $event.detail.name"></span>
                                <span class="block text-xs text-ink-3">{{ $user->role->label() }}</span>
                            </span>
                            <x-icon name="chevron-down" class="size-4 text-ink-3" />
                        </button>
                    </x-slot>

                    <x-slot name="content">
                        @if ($user->unit)
                            <div class="px-4 pb-2 pt-2 text-xs text-ink-3">Satuan: <span class="text-ink">{{ $user->unit->name }}</span></div>
                            <div class="mb-1 border-t border-line-strong"></div>
                        @endif
                        @can('kelola-sistem')
                            <div class="label-caps px-4 pb-1 pt-2">Sistem</div>
                            @foreach ($systemMenu as $item)
                                <x-dropdown-link :href="route($item['route'])" wire:navigate><x-icon :name="$item['icon']" class="size-4 text-ink-3" />{{ $item['label'] }}</x-dropdown-link>
                            @endforeach
                            <div class="my-1 border-t border-line-strong"></div>
                        @endcan
                        <x-dropdown-link :href="route('profile')" wire:navigate>
                            <x-icon name="user" class="size-4 text-ink-3" />Profil
                        </x-dropdown-link>

                        <button wire:click="logout" class="w-full text-start">
                            <x-dropdown-link>
                                <x-icon name="log-out" class="size-4 text-ink-3" />Keluar
                            </x-dropdown-link>
                        </button>
                    </x-slot>
                </x-dropdown>
            </div>

            <div class="-me-2 flex items-center gap-2 xl:hidden">
                <span data-sentra-live class="inline-flex h-7 items-center whitespace-nowrap rounded-chip border border-line-strong bg-canvas px-2 font-display text-xs font-medium uppercase tracking-[0.12em] text-ink-2" role="status" title="WebSocket belum tersambung; diperbarui tiap 3 detik">Polling</span>
                <button @click="open = ! open" aria-label="Buka menu" :aria-expanded="open.toString()" class="grid size-11 place-items-center rounded-control text-ink-2 transition-colors duration-150 hover:bg-raised hover:text-ink focus:outline-none focus-visible:ring-2 focus-visible:ring-accent">
                    <x-icon name="menu" class="size-6" x-show="! open" />
                    <x-icon name="x" class="size-6" x-show="open" x-cloak />
                </button>
            </div>
        </div>
    </div>

    <div :class="{'block': open, 'hidden': ! open}" class="hidden border-t border-line xl:hidden">
        <div class="space-y-0.5 pb-3 pt-2">
            @foreach ($menu as $item)
                @can($item['ability'])
                    <x-responsive-nav-link :href="route($item['route'])" :active="request()->routeIs($item['active'] ?? $item['route'])" wire:navigate>
                        <x-icon :name="$item['icon']" class="size-5 text-ink-3" />{{ $item['label'] }}
                        @if (! empty($item['badge']))
                            <span class="ms-auto grid min-w-6 place-items-center rounded-chip bg-accent px-1.5 font-mono text-sm font-semibold text-accent-ink">{{ $item['badge'] }}</span>
                        @endif
                    </x-responsive-nav-link>
                @endcan
            @endforeach
        </div>

        <div class="border-t border-line pb-2 pt-4">
            <div class="px-4">
                <div class="text-base font-medium text-ink" x-data="{{ json_encode(['name' => $user->name]) }}" x-text="name" x-on:profile-updated.window="name = $event.detail.name"></div>
                <div class="text-sm text-ink-3">{{ $user->role->label() }}{{ $user->unit ? ' · '.$user->unit->name : '' }}</div>
            </div>

            <div class="mt-3 space-y-0.5">
                <x-responsive-nav-link :href="route('profile')" wire:navigate>
                    <x-icon name="user" class="size-5 text-ink-3" />Profil
                </x-responsive-nav-link>

                <button wire:click="logout" class="w-full text-start">
                    <x-responsive-nav-link>
                        <x-icon name="log-out" class="size-5 text-ink-3" />Keluar
                    </x-responsive-nav-link>
                </button>
            </div>
        </div>
    </div>
</nav>
