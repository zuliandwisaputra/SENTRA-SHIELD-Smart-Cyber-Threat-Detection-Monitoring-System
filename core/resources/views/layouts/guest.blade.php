<!DOCTYPE html>
<html lang="id" class="dark">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <meta name="csrf-token" content="{{ csrf_token() }}">
        <meta name="color-scheme" content="dark">

        <title>Masuk · {{ config('app.name', 'SENTRA SHIELD') }}</title>

        @vite(['resources/css/app.css', 'resources/js/app.js'])
    </head>
    <body class="font-sans antialiased bg-gray-950 text-gray-100">
        <div class="min-h-screen flex flex-col sm:justify-center items-center px-4 pt-10 sm:pt-0">
            <div class="flex flex-col items-center text-center">
                <x-application-logo class="w-16 h-16 text-emerald-500" />
                <h1 class="mt-3 text-2xl font-bold tracking-wide">SENTRA SHIELD</h1>
                <p class="mt-1 text-sm text-gray-400">Pusat Komando Deteksi &amp; Respons Ancaman Siber</p>
            </div>

            <div class="w-full sm:max-w-md mt-6 px-6 py-5 bg-gray-900 border border-gray-800 shadow-lg overflow-hidden rounded-lg">
                {{ $slot }}
            </div>
        </div>
    </body>
</html>
