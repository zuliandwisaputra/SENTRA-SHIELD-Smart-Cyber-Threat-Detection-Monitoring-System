<x-app-layout>
    <x-slot name="title">Profil</x-slot>
    <x-slot name="header">
        <h2 class="font-display text-[26px] font-semibold leading-tight tracking-[0.01em] text-ink">Profil</h2>
    </x-slot>

    <div class="py-8">
        <div class="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
            <div class="panel p-4 sm:p-8">
                <div class="max-w-xl">
                    <livewire:profile.update-profile-information-form />
                </div>
            </div>

            <div class="panel p-4 sm:p-8">
                <div class="max-w-xl">
                    <livewire:profile.update-password-form />
                </div>
            </div>
        </div>
    </div>
</x-app-layout>
