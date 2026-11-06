<?php

use Illuminate\Support\Carbon;

if (! function_exists('waktu_wib')) {
    /**
     * Format waktu (disimpan UTC) untuk tampilan dalam WIB.
     */
    function waktu_wib(?DateTimeInterface $time, string $format = 'd/m/Y H:i:s'): string
    {
        if ($time === null) {
            return '—';
        }

        return Carbon::instance($time)->setTimezone(config('sentra.display_timezone'))->format($format).' WIB';
    }
}
