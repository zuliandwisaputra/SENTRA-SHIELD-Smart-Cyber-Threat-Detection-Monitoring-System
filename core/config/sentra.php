<?php

return [
    /*
    | Zona waktu tampilan. Data disimpan dalam UTC (app.timezone) dan
    | ditampilkan dalam WIB.
    */
    'display_timezone' => env('SENTRA_DISPLAY_TIMEZONE', 'Asia/Jakarta'),

    /*
    | Kata sandi awal akun lab yang dibuat seeder. Ganti setelah login pertama
    | bila dipakai di luar lab.
    */
    'seed_password' => env('SENTRA_SEED_PASSWORD', 'Latihan#2026'),

    'ollama' => [
        'url' => env('SENTRA_OLLAMA_URL', 'http://ollama:11434'),
        'model' => env('SENTRA_OLLAMA_MODEL', 'qwen2.5:3b'),
    ],
];
