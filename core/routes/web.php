<?php

use App\Livewire\Admin\UnitsAgents;
use App\Livewire\Admin\Users;
use Illuminate\Support\Facades\Route;

Route::redirect('/', '/beranda');

Route::middleware('auth')->group(function () {
    Route::view('beranda', 'dashboard')
        ->middleware('can:lihat-dashboard')
        ->name('dashboard');

    Route::get('satuan-agent', UnitsAgents::class)
        ->middleware('can:lihat-satuan-agent')
        ->name('units-agents');

    Route::get('pengguna', Users::class)
        ->middleware('can:kelola-sistem')
        ->name('users');

    Route::view('profil', 'profile')
        ->name('profile');
});

require __DIR__.'/auth.php';
