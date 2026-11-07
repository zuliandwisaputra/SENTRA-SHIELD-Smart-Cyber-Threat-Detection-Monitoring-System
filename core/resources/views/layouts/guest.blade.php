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
    <body class="bg-base font-sans text-ink antialiased">
        <div class="relative flex min-h-screen flex-col overflow-hidden">
            {{-- Latar: grid tipis + cincin radar. Dekoratif, tidak memuat informasi. --}}
            <div class="latar-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_30%_40%,black_20%,transparent_75%)]" aria-hidden="true"></div>
            <svg class="pointer-events-none absolute -left-40 top-1/2 hidden size-[860px] -translate-y-1/2 text-accent lg:block" viewBox="0 0 400 400" fill="none" aria-hidden="true">
                <g stroke="currentColor" stroke-opacity=".14">
                    <circle cx="200" cy="200" r="60" /><circle cx="200" cy="200" r="110" /><circle cx="200" cy="200" r="160" /><circle cx="200" cy="200" r="198" />
                    <path d="M200 2v396M2 200h396" stroke-opacity=".08" />
                </g>
                <g class="origin-center animate-sapu" style="transform-box: view-box;">
                    <path d="M200 200 L200 2 A198 198 0 0 1 340 60 Z" fill="url(#sapuan)" />
                </g>
                <defs>
                    <linearGradient id="sapuan" x1="200" y1="2" x2="320" y2="120" gradientUnits="userSpaceOnUse">
                        <stop stop-color="currentColor" stop-opacity=".16" /><stop offset="1" stop-color="currentColor" stop-opacity="0" />
                    </linearGradient>
                </defs>
            </svg>

            {{-- Strip status sistem: hanya fakta dari server ini. --}}
            <div class="relative border-b border-line bg-panel/80">
                <div class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 gap-y-1 px-4 py-2 font-mono text-xs text-ink-3 sm:px-6">
                    <span class="inline-flex items-center gap-1.5 text-aman"><span class="size-2 rounded-full bg-aman animate-denyut" style="--denyut: var(--aman)"></span>Core aktif</span>
                    <span class="inline-flex items-center gap-1.5"><x-icon name="clock" class="size-3.5" />{{ waktu_wib(now(), 'd/m/Y H:i') }}</span>
                    @if (request()->secure())
                        <span class="inline-flex items-center gap-1.5"><x-icon name="lock" class="size-3.5" />Saluran terenkripsi TLS</span>
                    @endif
                    @if (config('sentra.lab.training_label'))
                        <span class="inline-flex items-center gap-1.5 text-waspada"><x-icon name="flag" class="size-3.5" />Lingkungan latihan · data latihan</span>
                    @endif
                </div>
            </div>

            <main class="relative mx-auto grid w-full max-w-6xl flex-1 items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
                <section class="min-w-0">
                    <div class="flex items-center gap-3">
                        <x-application-logo class="size-14 text-accent" />
                        <div>
                            <h1 class="font-display text-[34px] font-semibold leading-none tracking-[0.14em] sm:text-[40px]">SENTRA SHIELD</h1>
                            <p class="mt-1.5 text-[12px] uppercase tracking-[0.18em] text-ink-3">Pusat Komando Deteksi &amp; Respons Ancaman Siber</p>
                        </div>
                    </div>
                    <p class="mt-8 max-w-xl text-lg leading-relaxed text-ink-2">Sensor di tiap satuan, satu insiden yang bisa dijelaskan, dan respons yang mengikuti rantai komando.</p>
                    <dl class="mt-8 hidden max-w-xl grid-cols-3 gap-6 border-t border-line pt-5 sm:grid">
                        <div><dt class="label-caps">Nyata</dt><dd class="mt-1 text-sm text-ink-2">Deteksi dari telemetri asli</dd></div>
                        <div><dt class="label-caps">Terukur</dt><dd class="mt-1 text-sm text-ink-2">Uji Kesiapan dalam angka</dd></div>
                        <div><dt class="label-caps">Siap pakai</dt><dd class="mt-1 text-sm text-ink-2">Satu perintah, tanpa internet</dd></div>
                    </dl>
                </section>

                <section class="panel w-full min-w-0 p-6 sm:p-8 lg:max-w-md lg:justify-self-end" aria-label="Masuk">
                    {{ $slot }}
                </section>
            </main>
        </div>
    </body>
</html>
