<?php

use App\Response\ActionService;
use Illuminate\Support\Facades\Schedule;

// Blokir yang durasinya habis -> Kedaluwarsa (agent sudah membukanya lewat timeout nftables).
Schedule::call(fn () => app(ActionService::class)->expireBlocks())
    ->name('sentra:kedaluwarsa-blokir')
    ->everyTenSeconds()
    ->withoutOverlapping();
