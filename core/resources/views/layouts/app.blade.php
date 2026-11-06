<!DOCTYPE html>
<html lang="id" class="dark">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="color-scheme" content="dark">

        <title>{{ isset($title) ? $title.' · ' : '' }}{{ config('app.name', 'SENTRA SHIELD') }}</title>

        {{-- Tanpa font/CDN eksternal: aplikasi harus berjalan penuh tanpa internet. --}}
        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="font-sans antialiased bg-gray-950 text-gray-100">
        <div class="min-h-screen">
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
