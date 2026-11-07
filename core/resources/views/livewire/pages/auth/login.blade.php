<?php

use App\Livewire\Forms\LoginForm;
use Illuminate\Support\Facades\Session;
use Livewire\Attributes\Layout;
use Livewire\Volt\Component;

new #[Layout('layouts.guest')] class extends Component
{
    public LoginForm $form;

    public function login(): void
    {
        $this->validate();

        $this->form->authenticate();

        Session::regenerate();

        $this->redirectIntended(default: route('dashboard', absolute: false), navigate: true);
    }
}; ?>

<div>
    <h2 class="mb-6 flex items-center gap-2.5 font-display text-2xl font-semibold tracking-wide"><x-icon name="fingerprint" class="size-6 text-accent" />Masuk ke Pusat Komando</h2>

    <x-auth-session-status class="mb-4" :status="session('status')" />

    <form wire:submit="login" class="space-y-5">
        <div>
            <x-input-label for="email" value="Email" />
            <div class="relative mt-1.5">
                <x-icon name="user" class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
                <x-text-input wire:model="form.email" id="email" class="block h-11 w-full pl-10" type="email" name="email" required autofocus autocomplete="username" />
            </div>
            <x-input-error :messages="$errors->get('form.email')" class="mt-2" />
        </div>

        <div>
            <x-input-label for="password" value="Kata sandi" />
            <div class="relative mt-1.5">
                <x-icon name="key-round" class="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
                <x-text-input wire:model="form.password" id="password" class="block h-11 w-full pl-10"
                                type="password"
                                name="password"
                                required autocomplete="current-password" />
            </div>
            <x-input-error :messages="$errors->get('form.password')" class="mt-2" />
        </div>

        <div>
            <label for="remember" class="inline-flex min-h-6 cursor-pointer items-center">
                <input wire:model="form.remember" id="remember" type="checkbox" class="size-4" name="remember">
                <span class="ms-2.5 text-sm text-ink-2">Ingat saya</span>
            </label>
        </div>

        <x-primary-button class="h-11 w-full text-[15px]" wire:loading.attr="disabled" wire:target="login">
            <x-icon name="log-in" class="size-4" wire:loading.remove wire:target="login" />
            <x-icon name="loader-circle" class="size-4 animate-spin" wire:loading wire:target="login" />
            Masuk
        </x-primary-button>

        <p class="flex items-center gap-2 border-t border-line pt-4 text-xs text-ink-3"><x-icon name="shield" class="size-3.5" />Akun dikelola Admin satuan.</p>
    </form>
</div>
