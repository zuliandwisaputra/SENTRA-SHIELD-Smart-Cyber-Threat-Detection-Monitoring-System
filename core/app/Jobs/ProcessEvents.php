<?php

namespace App\Jobs;

use App\Detection\DetectionEngine;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

/**
 * Menjalankan mesin deteksi untuk satu batch event yang baru disimpan.
 * Worker antrean di lab berjalan satu proses, sehingga batch diproses berurutan.
 */
class ProcessEvents implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    /** @param list<int> $eventIds */
    public function __construct(public array $eventIds) {}

    public function handle(DetectionEngine $engine): void
    {
        $engine->processIds($this->eventIds);
    }
}
