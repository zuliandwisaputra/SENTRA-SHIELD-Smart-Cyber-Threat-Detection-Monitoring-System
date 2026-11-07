<!DOCTYPE html>
<html lang="id" class="dark">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="color-scheme" content="dark">
        {{-- Kunci publik Reverb dibaca saat runtime (dibuat acak saat lab pertama kali jalan). --}}
        <meta name="reverb-key" content="{{ config('broadcasting.connections.reverb.key') }}">
        <meta name="sentra-user" content="{{ auth()->id() }}">

        <title>{{ isset($title) ? $title.' · ' : '' }}{{ config('app.name', 'SENTRA SHIELD') }}</title>

        {{-- Tanpa font/CDN eksternal: aplikasi harus berjalan penuh tanpa internet. --}}
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="font-sans antialiased bg-gray-950 text-gray-100">
        <div class="min-h-screen">
            {{-- FR-15: data lab ditandai DATA LATIHAN; akun Demo hanya melihat. --}}
            @if (config('sentra.lab.training_label') || auth()->user()?->role === \App\Enums\Role::Demo)
                <div class="bg-amber-900/70 px-4 py-0.5 text-center text-[11px] font-semibold uppercase tracking-wider text-amber-100" data-testid="label-latihan">
                    Data latihan · telemetri asli dari serangan di lab, bukan data operasional
                    @if (auth()->user()?->role === \App\Enums\Role::Demo)
                        <span>· mode demo, hanya lihat</span>
                    @endif
                </div>
            @endif
            <livewire:layout.navigation />

            @if (isset($header))
                <header class="border-b border-gray-800 bg-gray-900">
                    <div class="max-w-7xl mx-auto py-5 px-4 sm:px-6 lg:px-8">
                        {{ $header }}
                    </div>
                </header>
            @endif

            <main>
                {{ $slot }}
            </main>
        </div>
    </body>
</html>
