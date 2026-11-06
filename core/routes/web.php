<?php

use Illuminate\Support\Facades\Route;

Route::redirect('/', '/beranda');

Route::middleware('auth')->group(function () {
    Route::view('beranda', 'dashboard')
        ->middleware('can:lihat-dashboard')
        ->name('dashboard');

    Route::view('profil', 'profile')
        ->name('profile');
});

require __DIR__.'/auth.php';
