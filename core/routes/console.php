<?php

use App\Detection\SensorWatch;
use App\Response\ActionService;
use Illuminate\Support\Facades\Schedule;

// Blokir yang durasinya habis -> Kedaluwarsa (agent sudah membukanya lewat timeout nftables).
Schedule::call(fn () => app(ActionService::class)->expireBlocks())
    ->name('sentra:kedaluwarsa-blokir')
    ->everyTenSeconds()
    ->withoutOverlapping();

// Sensor Buta (FR-09): agent tanpa heartbeat > 30 detik -> BUTA + insiden Tinggi.
Schedule::call(fn () => app(SensorWatch::class)->checkHeartbeats())
    ->name('sentra:sensor-buta')
    ->everyTenSeconds()
    ->withoutOverlapping();
